import { CategoryResponseModel } from '../model/categories.model';

export const oneCategoryMapped = (rawCategory: any): CategoryResponseModel => {
  const { category_id, category_name } = rawCategory;
  const mappedCategory: CategoryResponseModel = {
    categoryId: category_id,
    categoryName: category_name,
  };
  return mappedCategory;
};

export const allCategoriesMapped = (rawCategories: any[]): CategoryResponseModel[] => {
  const mappedValues: CategoryResponseModel[] = rawCategories.map((category: any) => oneCategoryMapped(category));
  return mappedValues;
};
