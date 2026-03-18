import { products } from "@/data/products";
import ProductGrid from "@/components/shop/ProductGrid";
import Link from "next/link";

export default function FeaturedProducts() {
  const featured = products.filter((p) => p.inStock).slice(0, 3);

  return (
    <section className="max-w-6xl mx-auto px-4 py-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Featured Prints</h2>
        <Link href="/shop" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors">
          View all →
        </Link>
      </div>
      <ProductGrid products={featured} />
    </section>
  );
}
