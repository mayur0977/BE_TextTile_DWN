import express, { Router } from 'express';

import { userLogin, userSignup } from '../controller/user.controller';

const userRouter: Router = express.Router();

userRouter.post('/signup', userSignup);
userRouter.post('/login', userLogin);

export default userRouter;
