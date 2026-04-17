"use client";

import { useState } from "react";
import Link from "next/link";
import { useCatalogStore } from "@/store/catalog";
import { formatPrice } from "@/lib/format";
import ProductImage from "@/components/ui/ProductImage";
import { useCartStore } from "@/store/cart";
import toast from "react-hot-toast";

const ALL = "all";

export default function CataloguePage() {
  const [active, setActive] = useState(ALL);
  const addItem    = useCartStore((s) => s.addItem);
  const products   = useCatalogStore((s) => s.products);
  const categories = useCatalogStore((s) => s.categories);

  const filtered =
    active === ALL
      ? products
      : products.filter((p) => p.category.toLowerCase().replace(/\s+/g, "-") === active);

  return (
    <div className="pt-24 pb-24 min-h-screen bg-white">
      {/* Header */}
      <div className="max-w-[1920px] mx-auto px-8 pt-12 pb-10"
           style={{ borderBottom: "1px solid rgba(210,197,179,0.3)" }}>
        <p className="text-[0.6875rem] tracking-[0.2em] uppercase text-akruti-muted font-body mb-3">
          AKRUTI STUDIO
        </p>
        <h1 className="font-headline text-6xl md:text-8xl tracking-tighter text-akruti-dark leading-none uppercase">
          Catalogue
        </h1>
        <p className="text-sm text-akruti-muted font-body mt-4 max-w-md leading-relaxed">
          All prints are made to order using premium PLA+ and shipped within 3–5 business days.
        </p>
      </div>

      {/* Category filter bar */}
      <div className="max-w-[1920px] mx-auto px-8 py-6 flex flex-wrap items-center gap-2"
           style={{ borderBottom: "1px solid rgba(210,197,179,0.2)" }}>
        <button
          onClick={() => setActive(ALL)}
          className={`font-headline text-sm uppercase tracking-widest px-5 py-2 transition-all duration-200 ${
            active === ALL
              ? "bg-akruti-dark text-akruti-cream"
              : "text-akruti-muted hover:text-akruti-dark border border-akruti-border"
          }`}
        >
          All ({products.length})
        </button>
        {categories.map((cat) => {
          const count = products.filter(
            (p) => p.category.toLowerCase().replace(/\s+/g, "-") === cat.id
          ).length;
          return (
            <button
              key={cat.id}
              onClick={() => setActive(cat.id)}
              className={`font-headline text-sm uppercase tracking-widest px-5 py-2 transition-all duration-200 ${
                active === cat.id
                  ? "bg-akruti-dark text-akruti-cream"
                  : "text-akruti-muted hover:text-akruti-dark border border-akruti-border"
              }`}
            >
              {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Product grid */}
      <div className="max-w-[1920px] mx-auto px-8 pt-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-akruti-border/30">
          {filtered.map((product) => (
            <div key={product.id} className="bg-white group">
              {/* Image */}
              <Link href={`/product/${product.slug}`} className="block overflow-hidden aspect-square relative">
                <ProductImage
                  src={product.images[0]}
                  alt={product.name}
                  name={product.name}
                  category={product.category}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {!product.inStock && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                    <span className="text-[0.6875rem] tracking-[0.2em] uppercase font-body text-akruti-muted bg-white px-3 py-1"
                          style={{ border: "1px solid rgba(210,197,179,0.5)" }}>
                      Out of stock
                    </span>
                  </div>
                )}
              </Link>

              {/* Info */}
              <div className="px-4 py-4" style={{ borderTop: "1px solid rgba(210,197,179,0.3)" }}>
                <p className="text-[0.6rem] tracking-[0.18em] uppercase text-akruti-muted font-body mb-1">
                  {product.category}
                </p>
                <Link href={`/product/${product.slug}`}>
                  <h3 className="font-headline text-lg uppercase tracking-tight text-akruti-dark leading-tight hover:text-akruti-primary transition-colors">
                    {product.name}
                  </h3>
                </Link>
                <div className="flex items-center justify-between mt-3">
                  <span className="font-headline text-xl text-akruti-dark">
                    {formatPrice(product.price)}
                  </span>
                  {product.inStock ? (
                    <button
                      onClick={() => {
                        addItem(product);
                        toast.success(`${product.name} added to cart`);
                      }}
                      className="text-[0.6rem] tracking-[0.15em] uppercase font-body text-akruti-primary hover:text-akruti-gold transition-colors border-b border-current pb-px"
                    >
                      Add to cart
                    </button>
                  ) : (
                    <Link
                      href="/custom-prints"
                      className="text-[0.6rem] tracking-[0.15em] uppercase font-body text-akruti-muted hover:text-akruti-primary transition-colors border-b border-current pb-px"
                    >
                      Custom order
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-24">
            <p className="font-headline text-2xl text-akruti-muted uppercase tracking-tight">
              No products in this category
            </p>
          </div>
        )}
      </div>

      {/* Custom prints CTA */}
      <div className="max-w-[1920px] mx-auto px-8 mt-20 py-16 bg-akruti-dark text-center">
        <p className="text-[0.6875rem] tracking-[0.2em] uppercase text-akruti-gold font-body mb-4">
          Don&apos;t see what you need?
        </p>
        <h2 className="font-headline text-4xl md:text-5xl uppercase tracking-tighter text-akruti-cream mb-6">
          Request a Custom Print
        </h2>
        <p className="text-sm text-akruti-cream/60 font-body max-w-md mx-auto mb-8 leading-relaxed">
          Send us your file or describe your idea — we&apos;ll quote within 24 hours.
        </p>
        <Link
          href="/custom-prints"
          className="inline-block font-headline text-sm uppercase tracking-widest border border-akruti-gold text-akruti-gold px-10 py-3 hover:bg-akruti-gold hover:text-akruti-dark transition-all duration-300"
        >
          Get a Quote
        </Link>
      </div>
    </div>
  );
}
