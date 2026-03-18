"use client";

import { notFound } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { getProductBySlug } from "@/data/products";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/stripe";
import toast from "react-hot-toast";
import { use } from "react";

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const product = getProductBySlug(slug);

  if (!product) notFound();

  const addItem = useCartStore((s) => s.addItem);

  function handleAdd() {
    addItem(product!);
    toast.success(`${product!.name} added to cart`);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-10">
        <div className="aspect-square bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
          No image yet
        </div>
        <div className="flex flex-col gap-4">
          <span className="text-sm font-medium text-indigo-600 uppercase tracking-wide">
            {product.category}
          </span>
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-gray-600 leading-relaxed">{product.description}</p>
          <p className="text-3xl font-extrabold text-gray-900">{formatPrice(product.price)}</p>
          <button
            onClick={handleAdd}
            disabled={!product.inStock}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-bold px-6 py-3 rounded-xl transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            {product.inStock ? "Add to Cart" : "Out of Stock"}
          </button>
        </div>
      </div>
    </div>
  );
}
