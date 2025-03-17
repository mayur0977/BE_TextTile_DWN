import { userSignup, userLogin, protect, restrictTo } from './user.controller';
import { Request, Response, NextFunction } from 'express';
import pool from '../../shared/dbConnect';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import ApiResponse from '../../shared/apiResponse';
import AppError from '../../shared/appError';

jest.mock('../../shared/dbConnect');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../../shared/apiResponse');

describe('User Controller', () => {
  let req: Partial<Request> & { user: any };
  let res: Partial<Response>;
  let next: NextFunction;
  let client: any;

  beforeEach(() => {
    req = {
      body: {},
      headers: {},
      user: null,
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    next = jest.fn();
    client = {
      query: jest.fn(),
      connect: jest.fn().mockResolvedValue(client),
      release: jest.fn(),
    };
    (pool.connect as jest.Mock).mockResolvedValue(client);
  });

  describe('userSignup', () => {
    it('Should sign up a user and return 200', async () => {
      req.body = {
        user_name: 'testUser',
        user_email: 'test@example.com',
        user_password: 'password123',
        roles: ['user'],
      };

      client.query.mockResolvedValueOnce({ rows: [{ exists: false }] }); // Mock email existence check
      client.query.mockResolvedValueOnce({
        rows: [{ user_id: 1, user_name: 'testUser', user_email: 'test@example.com', roles: ['user'] }],
      }); // Mock user insert

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword'); // mock password hashing
      (jwt.sign as jest.Mock).mockReturnValue('fakeToken'); // mock token generation

      await userSignup(req as Request, res as Response, next); // Call signup function

      expect(client.query).toHaveBeenCalledTimes(2); // Check that both queries were called
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10); // Check that password hashing was called
      expect(jwt.sign).toHaveBeenCalled(); // Check that token generation was called
      expect(res.status).toHaveBeenCalledWith(200); // Check that status was called
      expect(res.send).toHaveBeenCalledWith(expect.any(ApiResponse)); // Check that ApiResponse was called
    });

    it('Should return 422 if Email Already Exist', async () => {
      req.body = {
        user_name: 'testUser',
        user_email: 'test@example.com',
        user_password: 'password123',
      };

      client.query.mockResolvedValueOnce({ rows: [{ exists: true }] }); // Mock email existence check

      await userSignup(req as Request, res as Response, next); // Call signup function

      expect(next).toHaveBeenCalledWith(expect.any(AppError)); // Check that AppError was called
      // expect(next).toHaveBeenCalledWith(new AppError('Email already exists', 422)); // Check that AppError was called
    });
    it('Should return 500 error', async () => {
      client.query.mockRejectedValue(new Error('Database Error')); // Mock email existence check

      await userSignup(req as Request, res as Response, next); // Call signup function

      expect(next).toHaveBeenCalledWith(new Error('Database Error')); // Check that AppError was called
    });
  });

  describe('userLogin', () => {
    it('Should login a user and return 200', async () => {
      req.body = {
        user_email: 'test@example.com',
        user_password: 'password123',
      };

      client.query.mockResolvedValueOnce({
        rows: [
          {
            user_id: 1,
            user_name: 'testUser',
            user_email: 'test@example.com',
            user_password: 'hashedPassword',
            roles: ['user'],
          },
        ],
        rowCount: 1,
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true); // Mock password comparison
      (jwt.sign as jest.Mock).mockReturnValue('fakeToken'); // Mock token generation

      await userLogin(req as Request, res as Response, next); // Call login function

      expect(client.query).toHaveBeenCalled(); // Check that query was called
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword'); // Check that password comparison was called
      expect(jwt.sign).toHaveBeenCalled(); // Check that token generation was called
      expect(res.status).toHaveBeenCalledWith(200); // Check that status was called
      expect(res.send).toHaveBeenCalledWith(expect.any(ApiResponse)); // Check that ApiResponse was called
    });

    it('Should return an error with 401 if user email not found', async () => {
      req.body = {
        user_email: 'test@example.com',
        user_password: 'wrongPassword',
      };

      client.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0,
      }); // Mock email existence check

      (bcrypt.compare as jest.Mock).mockResolvedValue(false); // Mock password comparison

      await userLogin(req as Request, res as Response, next); // Call login function

      expect(next).toHaveBeenCalledWith(new AppError('Invalid credentials', 401)); // Check that AppError was called
    });

    it('Should return an error with 401 if password is incorrect', async () => {
      req.body = {
        user_email: 'test@example.com',
        user_password: 'wrongPassword',
      };

      client.query.mockResolvedValueOnce({
        rows: [
          {
            user_id: 1,
            user_name: 'testUser',
            user_email: 'test@example.com',
            user_password: 'hashedPassword',
            roles: ['user'],
          },
        ],
        rowCount: 1,
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(false); // Mock password comparison

      await userLogin(req as Request, res as Response, next); // Call login function

      expect(next).toHaveBeenCalledWith(new AppError('Invalid credentials', 401)); // Check that AppError was called
    });

    it('should return 500 error ', async () => {
      client.query.mockRejectedValue(new Error('Database Error')); // Mock DB Error rejection

      await userLogin(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(new Error('Database Error')); // Check that AppError was called
    });
  });

  describe('protect', () => {
    it('Should allow access if token is valid', async () => {
      if (req && req.headers) req.headers.authorization = 'Bearer validToken';

      (jwt.verify as jest.Mock).mockImplementation((token, secret, callback) => {
        callback(null, { user_id: 1 });
      });

      client.query.mockResolvedValueOnce({
        rows: [{ user_id: 1, user_name: 'testUser', user_email: 'test@example.com', roles: ['user'] }],
        rowCount: 1,
      });

      await protect(req as Request, res as Response, next);

      expect(client.query).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(next).toHaveBeenCalled();
    });

    it('Should return an error if token is not provided in header', async () => {
      if (req && req.headers) req.headers.authorization = '';

      await protect(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(new AppError('You are not logged in! Please login to get access', 401));
    });

    it('Should return an error if token is invalid', async () => {
      if (req && req.headers) req.headers.authorization = 'Bearer invalidToken';

      (jwt.verify as jest.Mock).mockImplementation((token, secret, callback) => {
        callback(new Error('Invalid token'), null);
      });

      await protect(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(new AppError('Invalid token', 401));
    });

    it('Should return an error with 401 if user not found after validating decoded token', async () => {
      if (req && req.headers) req.headers.authorization = 'Bearer validToken';

      (jwt.verify as jest.Mock).mockImplementation((token, secret, callback) => {
        callback(null, { user_id: 1 });
      });

      client.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0,
      });
      await protect(req as Request, res as Response, next); // Call login function

      expect(next).toHaveBeenCalledWith(new AppError('Invalid token', 401)); // Check that AppError was called
    });
  });

  describe('restrictTo', () => {
    it('Should allow access if user has the correct role', () => {
      req.user = { roles: ['admin'] };

      const middleware = restrictTo(['admin']);
      middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
    });

    it('Should deny access if user does not have the correct role', () => {
      req.user = { roles: ['user'] };

      const middleware = restrictTo(['admin']);
      middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
  });
});
