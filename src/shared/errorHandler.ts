import { NextFunction, Request, Response } from 'express';
import ApiError from './appError';
import dotenv from 'dotenv';
dotenv.config();

const handleJwtTokenError = () => {
  return new ApiError('Provided token is invalid.', 401);
};

const handleJwtExpireError = () => {
  return new ApiError('Verification link has expired, try with the new link', 400);
};

const errorResponseDev = (err: any, res: Response) => {
  res.status(err.statusCode).json({
    success: false,
    error: err,
    message: err.message,
    data: null,
  });
};

// const errorResponseProd = (err: any, res: Response) => {
//   // Operational ,trusted error: send message to client
//   if (err.isOperational) {
//     res.status(err.statusCode).json({
//       status: err.status,
//       message: err.message,
//     });
//   }
//   // Programming or other unknown error: don't leak error details to client
//   else {
//     //  Log error
//     console.error('Error • ', err);

//     // Send generic error
//     res.status(500).json({
//       status: 'error',
//       message: 'Something went very wrong!',
//     });
//   }
// };

// eslint-disable-next-line no-unused-vars
const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
  console.log('ERRRPR', err);

  err.statusCode = err.statusCode || 500;
  let error: any = Object.defineProperties({}, Object.getOwnPropertyDescriptors(err));
  if (err.name === 'JsonWebTokenError') error = handleJwtTokenError();
  if (err.name === 'TokenExpiredError') error = handleJwtExpireError();
  // console.log('ENVVV', process.env);

  // if (process.env.NODE_ENV === 'production') {
  //   errorResponseProd(error, res);
  // } else if (process.env.NODE_ENV === 'development') {
  // }
  errorResponseDev(error, res);
};

export default errorHandler;
