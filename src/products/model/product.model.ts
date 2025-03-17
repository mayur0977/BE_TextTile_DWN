export interface Product {
  productId: number;
  productName: string;
  productDescription: string;
  categoryId: number;
  price: number;
  stockQuantity: number;
  featured: boolean;
}
interface CategoryResponseModel {
  categoryId: number;
  categoryName: string;
}
export interface ProductResponseModel {
  productId: number;
  productName: string;
  productDescription: string;
  price: number;

  stockQuantity: number;
  featured: boolean;
  category: CategoryResponseModel;
}
