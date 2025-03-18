/* eslint-disable no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import ApiResponse from '../../shared/apiResponse';
import asyncHandler from '../../shared/asyncHandler';
// import pool from '../../shared/dbConnect';
import AppError from '../../shared/appError';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

dotenv.config();

type UserPayLod = {
  user_id: number;
  user_name: string;
  user_email: string;
  roles: string[];
};

const signToken = (payload: UserPayLod) => {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

export const userSignup = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const client: any = await new Promise((resolve, reject) => {});
    const { user_name, user_email, user_password, roles } = req.body;

    const existsResult = await client.query({
      text: 'SELECT EXISTS (SELECT * FROM users WHERE user_email = $1)',
      values: [user_email],
    });

    if (existsResult.rows[0].exists) {
      return next(new AppError('Email already exists', 422));
    }

    const hashedPassword = await bcrypt.hash(user_password, 10); // 10 is the salt rounds

    let rolesCopy = roles;
    if (!roles) {
      rolesCopy = ['user'];
    }
    const { rows } = await client.query(
      'INSERT INTO users(user_name,user_email,user_password,roles) VALUES($1,$2,$3,$4) RETURNING *',
      [user_name, user_email, hashedPassword, rolesCopy],
    );
    const token = signToken({
      user_id: rows[0].user_id,
      user_name: rows[0].user_name,
      user_email: rows[0].user_email,
      roles: rows[0].roles,
    });
    res.status(200).send(
      new ApiResponse(
        {
          user: {
            user_id: rows[0].user_id,
            user_name: rows[0].user_name,
            user_email: rows[0].user_email,
            roles: rows[0].roles,
          },
          token,
        },
        'success',
      ),
    );
  } catch (error) {
    next(error);
  }
});

export const userLogin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const client: any = await new Promise((resolve, reject) => {});
    const { user_email, user_password } = req.body;

    const existsResult = await client.query({
      text: 'SELECT * FROM users WHERE user_email = $1',
      values: [user_email],
    });

    if (existsResult.rows[0] && existsResult.rowCount && existsResult.rowCount > 0) {
      const isMatch = await bcrypt.compare(user_password, existsResult.rows[0].user_password);
      if (!isMatch) {
        return next(new AppError('Invalid credentials', 401));
      }
      const token = signToken({
        user_id: existsResult.rows[0].user_id,
        user_name: existsResult.rows[0].user_name,
        user_email: existsResult.rows[0].user_email,
        roles: existsResult.rows[0].roles,
      });
      res.status(200).send(
        new ApiResponse(
          {
            user: {
              user_id: existsResult.rows[0].user_id,
              user_name: existsResult.rows[0].user_name,
              user_email: existsResult.rows[0].user_email,
              roles: existsResult.rows[0].roles,
            },
            token,
          },
          'success',
        ),
      );
    } else {
      return next(new AppError('Invalid credentials', 401));
    }
  } catch (error) {
    next(error);
  }
});

export const protect = asyncHandler(
  async (
    req: Request & { user: { user_email: string; user_id: number; user_name: string; roles: string[] } },
    res: Response,
    next: NextFunction,
  ) => {
    const client: any = await new Promise((resolve, reject) => {});
    // 1) getting token and check if its there
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // console.log('TOKEN ', token);
    if (!token) {
      return next(new AppError('You are not logged in! Please login to get access', 401));
    }
    // 2) Verification token

    jwt.verify(token, process.env.JWT_SECRET as string, async function (err, decoded: any) {
      if (err || !decoded) {
        return next(new AppError('Invalid token', 401));
      }
      const existsResult = await client.query({
        text: 'SELECT * FROM users WHERE user_id = $1',
        values: [decoded.user_id],
      });

      if (existsResult.rows[0] && existsResult.rowCount && existsResult.rowCount > 0) {
        req.user = {
          user_id: existsResult.rows[0].user_id,
          user_name: existsResult.rows[0].user_name,
          user_email: existsResult.rows[0].user_email,
          roles: existsResult.rows[0].roles,
        };
        return next();
      } else {
        return next(new AppError('Invalid token', 401));
      }
    });
  },
);

export const restrictTo = (roles: string[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.roles[0])) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};
