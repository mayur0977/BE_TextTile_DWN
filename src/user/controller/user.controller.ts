/* eslint-disable no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import asyncHandler from '../../shared/asyncHandler';
import AppError from '../../shared/appError';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import User from '../model/user.model';
import { Types } from 'mongoose';
import { promisify } from 'util';

dotenv.config();

type UserPayLod = {
  user_id: Types.ObjectId;
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
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      role: req.body.role,
    });
    const userpayLoad: UserPayLod = {
      user_id: newUser._id,
      user_name: newUser.name,
      user_email: newUser.email,
      roles: [newUser.role],
    };
    const token = signToken(userpayLoad);

    res.status(201).json({
      status: 'success',
      message: 'User register successfully',
      data: { user: newUser, accessToken: token },
    });
  } catch (error) {
    next(error);
  }
});

export const userLogin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // 1) check if email and password exist
    if (!email || !password) {
      return next(new AppError('Please provide email and password!', 400));
    }

    // 2) check if user exist
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError('Incorrect email or password!', 401));
    }

    console.log('Uq', user);

    const userpayLoad: UserPayLod = {
      user_id: user._id,
      user_name: user.name,
      user_email: user.email,
      roles: [user.role],
    };
    // 3) if everything ok ,send token to client
    const token = signToken(userpayLoad);
    res.status(200).json({
      status: 'success',
      message: '',
      data: {
        name: user.name,
        email: user.email,
        userRole: user.role,
        userId: user._id,
        accessToken: token,
      },
    });
  } catch (error) {
    next(error);
  }
});

const verifyAsync: any = promisify(jwt.verify);

export const protect = asyncHandler(async (req: Request & { user: UserPayLod }, res: Response, next: NextFunction) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // console.log('TOKEN ', token);
  if (!token) {
    return next(new AppError('You are not logged in! Please login to get access', 401));
  }
  // 2) Verification token

  const decoded = await verifyAsync(token, process.env.JWT_SECRET as string);
  // console.log('DECODED', decoded);

  const currentUser = await User.findById(decoded.id);
  // 3) Check if user still exist
  if (!currentUser) {
    return next(new AppError('The user belonging to this token does not exist.', 401));
  }
  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('User recently changed password! Please login again.', 401));
  }
  req.user = {
    user_id: currentUser._id,
    roles: [currentUser.role],
    user_email: currentUser.email,
    user_name: currentUser.name,
  };
  // Grant access to protected route
  next();
});

export const restrictTo = (roles: string[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.roles[0])) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};
