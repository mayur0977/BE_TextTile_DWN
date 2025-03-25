export interface ITextileProduct {
  name: string;
  description: string;
  category: string;
  brand: string;
  color: string;
  price: number;
  unit: string;
  image_url: string;
  stock_quantity: number;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height?: number; // Optional field for height if applicable
  };
  composition: string;
  suitable_for: string[];
  care_instructions: string;
  origin: string;
  sustainability_rating: string;
  texture: string;
  fire_retardant: boolean;
  water_resistant: boolean;
  pattern: string;
  created_at: Date;
  updated_at: Date;
  tags: string[];
}
