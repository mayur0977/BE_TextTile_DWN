import express, { Application, Express } from 'express';
import request from 'supertest';

import categoriesRouter from '../routes/categories.routes';

const app: Express = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/categories', categoriesRouter);

jest.mock('../../shared/dbConnect'); // Mock the database pool

// Mock middleware functions
jest.mock('../../user/controller/user.controller', () => ({
  protect: jest.fn((req, res, next) => next()),
  restrictTo: jest.fn(() => (_req: any, res: any, next: () => any) => next()),
}));

// Mock controller functions
jest.mock('../controller/categories.controller', () => ({
  getAllCategories: jest.fn((_req, res) => res.status(200).send()),
  createCategory: jest.fn((_req, res) => res.status(200).send()),
  updateCategory: jest.fn((_req, res) => res.status(200).send()),
  deleteCategory: jest.fn((_req, res) => res.status(204).send()),
}));

// Mock validator
jest.mock('../validator/categories.validator', () => ({
  validateCategory: jest.fn((_req, res) => res.status(200).send()),
}));

describe('Routes - /categories', () => {
  let app: Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/categories', categoriesRouter);
  });

  it('Should call GET /categories', async () => {
    const response = await request(app).get('/categories').send({});
    expect(response.status).toBe(200);
  });

  it('Should call PUT /categories/:id', async () => {
    const response = await request(app).put('/categories/1').send({});
    expect(response.status).toBe(200);
  });
  it('Should call POST /categories', async () => {
    const response = await request(app).post('/categories').send({});
    expect(response.status).toBe(200);
  });
  it('Should call DELETE /categories/:id', async () => {
    const response = await request(app).delete('/categories/1').send({});
    expect(response.status).toBe(204);
  });
});
