"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cart";
import CartItem from "@/components/cart/CartItem";
import { formatPrice } from "@/lib/format";
import { ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";

export default function CartPage() {
  const { items, totalPrice } = useCartStore();

  function handleCheckout() {
    toast("Checkout coming soon — we'll notify you when it's live! 🛒", { icon: "⏳" });
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingCart className="w-10 h-10 text-indigo-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-8">Looks like you haven&apos;t added anything yet.</p>
        <Link
          href="/shop"
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition-colors"
        >
          Browse the Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Cart</h1>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {items.map((item) => (
          <CartItem key={item.product.id} item={item} />
        ))}
        <div className="flex justify-between items-center pt-6 mt-2">
          <span className="text-lg font-semibold text-gray-900">Total</span>
          <span className="text-2xl font-extrabold text-gray-900">{formatPrice(totalPrice())}</span>
        </div>
        <button
          onClick={handleCheckout}
          className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-colors text-lg"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
