export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number; // in cents, e.g. 1500 = $15.00
  images: string[];
  category: string;
  inStock: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
  specs?: Array<[string, string]>; // [[label, value], ...]
};

export type CartItem = {
  product: Product;
  quantity: number;
};
