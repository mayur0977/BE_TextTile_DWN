import { NextFunction, Request, Response } from 'express';

import ApiResponse from '../../shared/apiResponse';
import pool from '../../shared/dbConnect'; // Ensure this points to your database pool module
import { createCategory, deleteCategory, getAllCategories, updateCategory } from './categories.controller';
import AppError from '../../shared/appError';
import { CategoryResponseModel } from '../model/categories.model';

jest.mock('../../shared/dbConnect'); // Mock the database pool
let client: any;
let req: Partial<Request>;
let res: Partial<Response>;
let next: NextFunction;

const defaultDescribe = () => {
  beforeAll(() => {
    client = {
      connect: jest.fn(),
      query: jest.fn(),
      release: jest.fn(),
    };
    (pool.connect as jest.Mock).mockResolvedValue(client);
  });

  beforeEach(() => {
    req = {
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    client.release();
  });
};
describe('getAllCategories', () => {
  defaultDescribe();
  it('Should return all categories with a status of 200', async () => {
    const mockCategories = [
      { category_id: 1, category_name: 'Category 1' },
      { category_id: 2, category_name: 'Category 2' },
    ];
    client.query.mockResolvedValueOnce({ rows: mockCategories });

    await getAllCategories(req as Request, res as Response, next);
    const expectedResult: CategoryResponseModel[] = [
      {
        categoryId: 1,
        categoryName: 'Category 1',
      },
      {
        categoryId: 2,
        categoryName: 'Category 2',
      },
    ];
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(new ApiResponse(expectedResult, 'success'));
  });

  it('Should call next with error on exception', async () => {
    client.query.mockRejectedValue(new Error('Database Error'));

    await getAllCategories(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(new Error('Database Error'));
  });
});

describe('createCategory', () => {
  defaultDescribe();
  it('Should create a new category and return 201', async () => {
    client.query.mockResolvedValueOnce({ rows: [{ exists: false }] }); // Check if category exists
    client.query.mockResolvedValueOnce({ rows: [{ category_name: 'New Category', category_id: 1 }] }); // Check if category exists
    req.body = { categoryName: 'New Category' };
    await createCategory(req as Request, res as Response, next);
    const expectedResult: CategoryResponseModel = {
      categoryId: 1,
      categoryName: 'New Category',
    };
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith(new ApiResponse(expectedResult, 'success'));
  });

  it('Should return 422 if categoryName is not provided', async () => {
    req.body = {};
    await createCategory(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(new AppError('Category Name is required', 422));
  });

  it('Should return 409 if category already exists', async () => {
    client.query.mockResolvedValueOnce({ rows: [{ exists: true }] });
    req.body = { categoryName: 'Cloths' };
    await createCategory(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(new AppError('Category Cloths already exists', 422));
  });

  it('Should handle server errors and return 500', async () => {
    client.query.mockRejectedValueOnce(new Error('Database Error'));

    req.body = { categoryName: 'Cloths' };
    await createCategory(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(new Error('Database Error'));
  });
});

describe('updateCategory', () => {
  defaultDescribe();

  it('Should return 422 if categoryName is not provided', async () => {
    req.params = { id: 1 } as unknown as Request['params'];
    req.body = {};
    await updateCategory(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(new AppError('Category Name is required', 422));
  });

  it('Should return 400 if category name already exists', async () => {
    client.query.mockResolvedValueOnce({ rows: [{ exists: true }] });
    req.body = { categoryName: 'Cat Name' };
    req.params = { id: 1 } as unknown as Request['params'];
    await updateCategory(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(new AppError('Category Cat Name already exists', 422));
  });

  it('Should return 404 if category not found', async () => {
    client.query.mockResolvedValueOnce({ rows: [{ exists: false }] });
    client.query.mockResolvedValueOnce({ rowCount: 0 });

    req.body = { categoryName: 'Cat Name' };
    req.params = { id: 1 } as unknown as Request['params'];
    await updateCategory(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(new AppError('Category not found', 404));
  });

  it('Should update category and return 200', async () => {
    client.query
      .mockResolvedValueOnce({ rows: [{ exists: false }] }) // Check if category exists
      .mockResolvedValueOnce({ rows: [{ category_id: 7, category_name: 'Updated Category' }] }); // Insert category

    req.body = { categoryName: 'Updated Category' };
    req.params = { id: 7 } as unknown as Request['params'];
    await updateCategory(req as Request, res as Response, next);
    const expectedResult: CategoryResponseModel = {
      categoryId: 7,
      categoryName: 'Updated Category',
    };
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(new ApiResponse(expectedResult, 'success'));
  });

  it('Should handle server errors and return 500', async () => {
    client.query.mockRejectedValueOnce(new Error('Database Error'));

    req.params = { id: 1 } as unknown as Request['params'];
    req.body = { categoryName: 'Updated Category' };
    await updateCategory(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(new Error('Database Error'));
  });
});

describe('deleteCategory', () => {
  defaultDescribe();
  it('Should return 409 if category is being used by products', async () => {
    client.query.mockResolvedValueOnce({ rows: [{ count: 2 }] });
    req.params = { id: 1 } as unknown as Request['params'];

    await deleteCategory(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(new AppError(`Category is being used in 2 product(s)`, 409));
  });

  it('Should return 404 if category not found', async () => {
    client.query.mockResolvedValue({ rows: [{ exists: false }], rowCount: 0 });

    req.params = { id: 1 } as unknown as Request['params'];

    await deleteCategory(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(new AppError('Category not found', 404));
  });

  it('Should delete category and return 204', async () => {
    client.query.mockResolvedValue({ rows: [{ exists: false }], rowCount: 1 });

    req.params = { id: 1 } as unknown as Request['params'];

    await deleteCategory(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalledWith(new ApiResponse(null, 'success'));
  });
  it('Should handle server errors and return 500', async () => {
    client.query.mockRejectedValueOnce(new Error('Database Error'));

    req.params = { id: 1 } as unknown as Request['params'];

    await deleteCategory(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(new Error('Database Error'));
  });
});
