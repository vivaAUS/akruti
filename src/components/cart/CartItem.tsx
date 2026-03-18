"use client";

import { Trash2 } from "lucide-react";
import { CartItem as CartItemType } from "@/lib/types";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/stripe";

export default function CartItem({ item }: { item: CartItemType }) {
  const { updateQuantity, removeItem } = useCartStore();

  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-100">
      <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center text-xs text-gray-400">
        img
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate">{item.product.name}</p>
        <p className="text-sm text-gray-500">{formatPrice(item.product.price)} each</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
          className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
        >
          −
        </button>
        <span className="w-6 text-center font-medium">{item.quantity}</span>
        <button
          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
          className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
        >
          +
        </button>
      </div>
      <p className="font-bold text-gray-900 w-20 text-right">
        {formatPrice(item.product.price * item.quantity)}
      </p>
      <button
        onClick={() => removeItem(item.product.id)}
        className="text-gray-400 hover:text-red-500 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
