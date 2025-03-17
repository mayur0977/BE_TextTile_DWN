import { validateCategory } from './categories.validator';
import { Request, Response, NextFunction } from 'express';

import AppError from '../../shared/appError';
import { CategoryRequest } from '../model/categories.model';

// Mock request and response objects
const mockRequest = (body: Partial<CategoryRequest>) =>
  ({
    body,
  }) as Request;

const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res as Response;
};

const mockNext = jest.fn() as NextFunction;

describe('Validate Product Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call next() when the request body is valid', () => {
    const validCategory = {
      categoryName: 'Valid category name',
    };

    const req = mockRequest(validCategory);
    const res = mockResponse();

    validateCategory(req, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockNext).not.toHaveBeenCalledWith(expect.any(AppError));
  });

  it('should return an error if any field is missing from the request', () => {
    const invalidCategory: any = {
      notAField: 'InvalidCAtegoryName',
    };

    const req = mockRequest(invalidCategory);
    const res = mockResponse();

    validateCategory(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(new AppError('Please check all the field names', 400));
  });

  it('should return an error if Category name is missing', () => {
    const invalidCategory = {
      categoryName: '',
    };

    const req = mockRequest(invalidCategory);
    const res = mockResponse();

    validateCategory(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(new AppError('Category name is required', 400));
  });

  it('should return an error if Category name Expect string, receive number', () => {
    const invalidCategory: any = {
      categoryName: 23,
    };

    const req = mockRequest(invalidCategory);
    const res = mockResponse();

    validateCategory(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(new AppError('Expected string, received number', 400));
  });

  it('should return an error if Category name exceeds 30 characters', () => {
    const invalidCategory = {
      categoryName: 'a'.repeat(31),
    };

    const req = mockRequest(invalidCategory);
    const res = mockResponse();

    validateCategory(req, res, mockNext);
    expect(mockNext).toHaveBeenCalledWith(new AppError('Category name must not exceed 30 characters', 400));
  });
  it('should return an error if Category name contain spacial characters', () => {
    const invalidCategory = {
      categoryName: 'a##@dfg',
    };

    const req = mockRequest(invalidCategory);
    const res = mockResponse();

    validateCategory(req, res, mockNext);
    expect(mockNext).toHaveBeenCalledWith(
      new AppError('Category name must only contain letters, numbers, and spaces', 400),
    );
  });
});
