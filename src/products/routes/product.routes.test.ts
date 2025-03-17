/* eslint-disable no-unused-vars */
import request from 'supertest';
import express, { Application, Express } from 'express';

import productRouter from '../routes/product.routes';
const app: Express = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/products', productRouter);

jest.mock('../../shared/dbConnect');

// Mock middleware functions
jest.mock('../../user/controller/user.controller', () => ({
  protect: jest.fn((req, res, next) => next()),
  restrictTo: jest.fn(() => (_req: any, res: any, next: () => any) => next()),
}));

// Mock controller functions
jest.mock('../controller/product.controller', () => ({
  getAllProducts: jest.fn((_req, res) => res.status(200).send()),
  AddProduct: jest.fn((_req, res) => res.status(200).send()),
  updateProduct: jest.fn((_req, res) => res.status(200).send()),
  deleteProduct: jest.fn((_req, res) => res.status(204).send()),
  getProductByID: jest.fn((_req, res) => res.status(200).send()),
}));

// Mock validator
jest.mock('../validator/product.validator', () => ({
  validateProduct: jest.fn((_req, res, _next) => res.status(200).send()),
}));

describe('Routes - /products', () => {
  let app: Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/products', productRouter);
  });

  it('Should call GET /products', async () => {
    const response = await request(app).get('/products').send({});
    expect(response.status).toBe(200);
  });

  it('Should call GET /products/:id ', async () => {
    const response = await request(app).get('/products/1').send({});
    expect(response.status).toBe(200);
  });
  it('Should call PUT /products/:id', async () => {
    const response = await request(app).put('/products/1').send({});
    expect(response.status).toBe(200);
  });
  it('Should call POST /products', async () => {
    const response = await request(app).post('/products').send({});
    expect(response.status).toBe(200);
  });
  it('Should call DELETE /products/:id', async () => {
    const response = await request(app).delete('/products/1').send({});
    expect(response.status).toBe(204);
  });
});
