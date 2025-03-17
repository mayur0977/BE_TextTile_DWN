import request from 'supertest';
import express, { Application } from 'express';
import cartRouter from './cart.routes';

// Mock controller functions
jest.mock('../controller/cart.controller', () => ({
  getCartByUserId: jest.fn((_req, res) => res.status(200).send()),
  AddToCart: jest.fn((_req, res) => res.status(200).send()),
  deleteFromCart: jest.fn((_req, res) => res.status(204).send()),
}));

// Mock middleware functions
jest.mock('../../user/controller/user.controller', () => ({
  protect: jest.fn((req, res, next) => next()),
  restrictTo: jest.fn(() => (_req: any, res: any, next: () => any) => next()),
}));

describe('Routes /cart', () => {
  let app: Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/cart', cartRouter);
  });

  it('Should call GET /cart/:id', async () => {
    const response = await request(app).get('/cart/1').send({});
    expect(response.status).toBe(200);
  });

  it('Should call POST /cart ', async () => {
    const response = await request(app).post('/cart').send({});
    expect(response.status).toBe(200);
  });
  it('Should call DELETE /cart/:id', async () => {
    const response = await request(app).delete('/cart/1').send({});
    expect(response.status).toBe(204);
  });
});
