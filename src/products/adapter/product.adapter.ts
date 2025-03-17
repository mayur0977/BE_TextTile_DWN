import { ProductResponseModel } from '../model/product.model';

export const oneProductMapped = (rawProduct: any): ProductResponseModel => {
  const { product_id, product_name, product_description, price, stock_quantity, featured, category } = rawProduct;

  const mappedProduct: ProductResponseModel = {
    productId: product_id,
    productName: product_name,
    productDescription: product_description,
    price,
    stockQuantity: stock_quantity,
    featured,
    category: {
      categoryId: category.category_id,
      categoryName: category.category_name,
    },
  };
  return mappedProduct;
};

export const allProductsMapped = (rawProducts: any[]): ProductResponseModel[] => {
  const mappedValues: ProductResponseModel[] = rawProducts.map((product: any) => oneProductMapped(product));
  return mappedValues;
};
