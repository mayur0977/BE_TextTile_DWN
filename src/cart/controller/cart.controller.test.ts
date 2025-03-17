import { NextFunction, Request, Response } from 'express';

import ApiResponse from '../../shared/apiResponse';
import pool from '../../shared/dbConnect';
import { AddToCart, deleteFromCart, getCartByUserId } from './cart.controller';
import AppError from '../../shared/appError';

jest.mock('../../shared/dbConnect'); // Mock the database pool
let client: any;
let req: Partial<Request>;
let res: Partial<Response>;
let next: NextFunction;

const defaultDescribe = () => {
  beforeAll(() => {
    client = {
      query: jest.fn(),
      connect: jest.fn().mockResolvedValue(client),
      release: jest.fn(),
    };
    (pool.connect as jest.Mock).mockResolvedValue(client);
  });

  beforeEach(() => {
    req = {
      body: {},
      headers: {},
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

describe('getCartByUserId', () => {
  defaultDescribe();
  it('Should return cart by user id', async () => {
    req.params = { id: 1 } as unknown as Request['params'];
    const cartItems: never[] = [];
    client.query.mockResolvedValueOnce({ rows: cartItems });
    await getCartByUserId(req as Request, res as Response, next as NextFunction);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(new ApiResponse(cartItems, 'success'));
  });
  it('Should return 500 if error', async () => {
    req.params = { id: 1 } as unknown as Request['params'];
    client.query.mockRejectedValue(new Error('Database Error'));
    await getCartByUserId(req as Request, res as Response, next as NextFunction);

    expect(next).toHaveBeenCalledWith(new Error('Database Error'));
  });
});

describe('AddToCart', () => {
  defaultDescribe();

  it('Should add to cart and return 201 success', async () => {
    req.body = { userId: 1, productId: 1 };
    client.query.mockResolvedValueOnce({ rows: [{ exists: true }] }); // Check if Product exists in the products table
    client.query.mockResolvedValueOnce({ rowCount: 0 }); // Check if the product already exists in the user's cart
    client.query.mockResolvedValueOnce({ rows: [{ quantity: 10 }] }); // Check if enough quantity is available in the products table
    client.query.mockResolvedValueOnce({ rows: [{ cart_id: 1, product_id: 1, order_quantity: 1 }] }); // Add product into cart
    // client.query.mockResolvedValueOnce({ rows: [{ quantity: 9 }] }); // Reduce the quantity from the products table
    await AddToCart(req as Request, res as Response, next as NextFunction);
    expect(client.query).toHaveBeenCalledTimes(5);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith(new ApiResponse({ cart_id: 1, product_id: 1, order_quantity: 1 }, 'success'));
  });
  it('Should return 422 with product not found', async () => {
    req.body = { userId: 1, productId: 1 };
    client.query.mockResolvedValueOnce({ rows: [{ exists: false }] });
    await AddToCart(req as Request, res as Response, next as NextFunction);

    expect(next).toHaveBeenCalledWith(new AppError('product not found', 422));
  });

  it('Should return 400 with Product already exists in the cart.', async () => {
    req.body = { userId: 1, productId: 1 };
    client.query.mockResolvedValueOnce({ rows: [{ exists: true }] });
    client.query.mockResolvedValueOnce({ rowCount: 1 });
    await AddToCart(req as Request, res as Response, next as NextFunction);

    expect(next).toHaveBeenCalledWith(new AppError('Product already exists in the cart.', 400));
  });
  it('Should return 400 with Not enough quantity available in stock.', async () => {
    req.body = { userId: 1, productId: 1 };
    client.query.mockResolvedValueOnce({ rows: [{ exists: true }] });
    client.query.mockResolvedValueOnce({ rowCount: 0 });
    client.query.mockResolvedValueOnce({ rows: [{ quantity: 0 }] });
    await AddToCart(req as Request, res as Response, next as NextFunction);

    expect(next).toHaveBeenCalledWith(new AppError('Not enough quantity available in stock.', 400));
  });

  it('Should return 500 if error', async () => {
    req.body = { userId: 1, productId: 1 };
    client.query.mockRejectedValue(new Error('Database Error'));
    await AddToCart(req as Request, res as Response, next as NextFunction);
    expect(next).toHaveBeenCalledWith(new Error('Database Error'));
  });
});

describe('deleteFromCart', () => {
  defaultDescribe();
  it('Should delete from cart and return 200 success', async () => {
    req.params = { id: 1 } as unknown as Request['params'];
    client.query.mockResolvedValueOnce({ rows: [{ cart_id: 1, product_id: 1, order_quantity: 1 }] }); //Retrieve the product_id and quantity from the cart before deleting
    client.query.mockResolvedValueOnce({ rowCount: 1 }); //Retrieve the product_id and quantity from the cart before deleting
    await deleteFromCart(req as Request, res as Response, next as NextFunction);
    expect(client.query).toHaveBeenCalledTimes(3); // API calls to be made
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalledWith(new ApiResponse(null, 'success'));
  });

  it('Should return 404 with Cart item not found.', async () => {
    req.params = { id: 1 } as unknown as Request['params'];
    client.query.mockResolvedValueOnce({ rows: [] });
    await deleteFromCart(req as Request, res as Response, next as NextFunction);

    expect(next).toHaveBeenCalledWith(new AppError('Cart item not found', 404));
  });

  it('Should return 404 with Cart item not found while deleting item from cart.', async () => {
    req.params = { id: 1 } as unknown as Request['params'];
    client.query.mockResolvedValueOnce({ rows: [{ cart_id: 1, product_id: 1, order_quantity: 1 }] });
    client.query.mockResolvedValueOnce({ rowCount: 0 });
    await deleteFromCart(req as Request, res as Response, next as NextFunction);

    expect(next).toHaveBeenCalledWith(new AppError('Cart item not found', 404));
  });

  it('Should return 500 if error', async () => {
    req.params = { id: 1 } as unknown as Request['params'];
    client.query.mockRejectedValue(new Error('Database Error'));
    await deleteFromCart(req as Request, res as Response, next as NextFunction);
    expect(next).toHaveBeenCalledWith(new Error('Database Error'));
  });
});
