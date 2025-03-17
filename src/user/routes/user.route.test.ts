import request from 'supertest';
import express, { Application } from 'express';
import userRouter from './user.routes';

// Mock controller functions
jest.mock('../controller/user.controller', () => ({
  userSignup: jest.fn((_req, res) => res.status(200).send()),
  userLogin: jest.fn((_req, res) => res.status(200).send()),
}));

describe('Routes /user', () => {
  let app: Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/user', userRouter);
  });

  it('Should call POST /user/signup', async () => {
    const response = await request(app).post('/user/signup').send({});
    expect(response.status).toBe(200);
  });

  it('Should call POST /user/login ', async () => {
    const response = await request(app).post('/user/login').send({});
    expect(response.status).toBe(200);
  });

  it('should return 404 for unknown routes', async () => {
    const response = await request(app).get('/unknown-route');
    expect(response.status).toBe(404);
    // expect(response.body.message).toBe("Can't find /unknown-route on this server!");
  });
});
