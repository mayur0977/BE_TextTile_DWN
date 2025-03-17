import express, { Router } from 'express';

import {
  AddProduct,
  deleteProduct,
  getAllProducts,
  getProductByID,
  updateProduct,
} from '../controller/product.controller';
import { protect, restrictTo } from '../../user/controller/user.controller';
import { validateProduct } from '../validator/product.validator';
const productRouter: Router = express.Router();

productRouter.get('/', getAllProducts);
productRouter.get('/:id', getProductByID);
productRouter.post('/', validateProduct, protect, restrictTo(['admin']), AddProduct);
productRouter.put('/:id', validateProduct, protect, restrictTo(['admin']), updateProduct);
productRouter.delete('/:id', protect, restrictTo(['admin']), deleteProduct);

export default productRouter;
