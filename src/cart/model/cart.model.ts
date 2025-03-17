export interface Category {
  categoryId: number;
  categoryName: string;
}
export interface Cart {
  id?: number;
  userId: number;
  productId: number;
  orderQuantity: number;
}
