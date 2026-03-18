import { products } from "@/data/products";
import ProductGrid from "@/components/shop/ProductGrid";

export default function ShopPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Shop</h1>
      <p className="text-gray-500 mb-8">All prints are made to order and shipped within 3–5 business days.</p>
      <ProductGrid products={products} />
    </div>
  );
}
