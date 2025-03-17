import express, { Router } from 'express';
import { AddToCart, deleteFromCart, getCartByUserId } from '../controller/cart.controller';
import { protect, restrictTo } from '../../user/controller/user.controller';

const cartRouter: Router = express.Router();

cartRouter.get('/:id', protect, getCartByUserId);
cartRouter.post('/', protect, restrictTo(['user']), AddToCart);
cartRouter.delete('/:id', protect, restrictTo(['user']), deleteFromCart);

export default cartRouter;
