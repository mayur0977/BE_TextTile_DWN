// src/index.ts
import dotenv from 'dotenv';
import express, { Express } from 'express';
import productRouter from './products/routes/product.routes';

import AppError from './shared/appError';

import globalErrorHandler from './shared/errorHandler';

import userRouter from './user/routes/user.routes';
import mongoose from 'mongoose';
import cors from 'cors';

dotenv.config();

const whitelist = ['http://localhost:3000'];

const app: Express = express();

const DB = process.env.DATABASE!.replace('<db_password>', process.env.DATABASE_PASSWORD!);

mongoose
  .connect(DB)
  .then(() => {
    console.log('DB CONNECTION SUCCESS');
  })
  .catch((err) => {
    console.log(err);
  });
const port = process.env.PORT_API || 5000;

const corsOptions = {
  origin: function (origin: any, callback: any) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use('/products', productRouter);

app.use('/api/user', userRouter);

app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

/* Start the Express app and listen
 for incoming requests on the specified port */
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
// Global error handling middleware
app.use(globalErrorHandler);

export default app;
