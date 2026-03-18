"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Product } from "@/lib/types";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/stripe";
import toast from "react-hot-toast";

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);

  function handleAdd() {
    addItem(product);
    toast.success(`${product.name} added to cart`);
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
      <Link href={`/product/${product.slug}`}>
        <div className="aspect-square bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
          {/* Replace with <Image> once you have real photos */}
          No image
        </div>
      </Link>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <span className="text-xs font-medium text-indigo-600 uppercase tracking-wide">
          {product.category}
        </span>
        <Link href={`/product/${product.slug}`} className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors">
          {product.name}
        </Link>
        <p className="text-sm text-gray-500 line-clamp-2 flex-1">{product.description}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="font-bold text-gray-900">{formatPrice(product.price)}</span>
          <button
            onClick={handleAdd}
            disabled={!product.inStock}
            className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            {product.inStock ? "Add" : "Sold out"}
          </button>
        </div>
      </div>
    </div>
  );
}
