import express, { Router } from 'express';
import { createCategory, deleteCategory, getAllCategories, updateCategory } from '../controller/categories.controller';
import { protect, restrictTo } from '../../user/controller/user.controller';
import { validateCategory } from '../validator/categories.validator';

const categoriesRouter: Router = express.Router();

categoriesRouter.get('/', getAllCategories);
categoriesRouter.post('/', validateCategory, createCategory);
categoriesRouter.put('/:id', validateCategory, updateCategory);
categoriesRouter.delete('/:id', protect, restrictTo(['admin']), deleteCategory);

export default categoriesRouter;
