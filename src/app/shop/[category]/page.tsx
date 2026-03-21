"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { products } from "@/data/products";
import { getCategoryById } from "@/data/categories";
import { formatPrice } from "@/lib/format";
import ProductImage from "@/components/ui/ProductImage";

/** Returns a Tailwind col-span based on position and total product count */
function getMosaicSpan(index: number, total: number): string {
  if (total === 1) return "md:col-span-12";
  if (total === 2) return "md:col-span-6";
  if (total === 3) {
    return ["md:col-span-7", "md:col-span-5", "md:col-span-12"][index] ?? "md:col-span-6";
  }
  // 4+: alternating 5/7, 7/5
  const pattern = ["md:col-span-5", "md:col-span-7", "md:col-span-7", "md:col-span-5"];
  return pattern[index % 4] ?? "md:col-span-6";
}

/** Row height based on product count — fewer products = taller cells */
function getRowHeight(total: number): string {
  if (total <= 2) return "md:auto-rows-[520px]";
  if (total <= 4) return "md:auto-rows-[420px]";
  return "md:auto-rows-[340px]";
}

export default function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = use(params);
  const category = getCategoryById(slug);
  const categoryProducts = products.filter(
    (p) => p.category.toLowerCase() === slug.toLowerCase()
  );

  if (!category) notFound();

  const router = useRouter();
  const [clicked, setClicked] = useState<string | null>(null);

  function handleProductClick(productSlug: string) {
    setClicked(productSlug);
    setTimeout(() => router.push(`/product/${productSlug}`), 430);
  }

  return (
    <div className="min-h-screen bg-white pt-28 px-8 pb-24">
      <div className="max-w-[1920px] mx-auto">

        {/* Back + header */}
        <div className="mb-16">
          <Link
            href="/"
            className="text-[0.625rem] tracking-[0.25em] uppercase text-akruti-muted/50 hover:text-akruti-primary transition-colors font-body"
          >
            ← Collections
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mt-6">
            <div>
              <h1 className="font-headline text-6xl md:text-8xl tracking-tight text-akruti-dark leading-none">
                {category.name.toUpperCase()}
              </h1>
              <p className="text-sm text-akruti-muted max-w-md mt-4 font-body leading-relaxed">
                {category.detail}
              </p>
            </div>
            <span className="text-[0.6875rem] tracking-[0.2em] uppercase text-akruti-muted/40 font-body">
              {categoryProducts.length}{" "}
              {categoryProducts.length === 1 ? "artifact" : "artifacts"}
            </span>
          </div>
        </div>

        {/* Product mosaic */}
        {categoryProducts.length === 0 ? (
          <div className="py-32 text-center">
            <p className="font-headline text-5xl text-akruti-dark/20">Coming Soon</p>
            <p className="text-sm text-akruti-muted/40 mt-3 font-body">
              Products in this category are being prepared.
            </p>
            <Link
              href="/"
              className="inline-block mt-8 text-[0.6875rem] tracking-widest uppercase border border-akruti-border px-10 py-4 text-akruti-dark hover:bg-akruti-dark hover:text-akruti-cream transition-all duration-300 font-body"
            >
              Back to Collections
            </Link>
          </div>
        ) : (
          <div
            className={`grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-[320px] ${getRowHeight(
              categoryProducts.length
            )}`}
          >
            {categoryProducts.map((product, i) => {
              const isClicked = clicked === product.slug;
              return (
                <button
                  key={product.id}
                  onClick={() => handleProductClick(product.slug)}
                  className={`${getMosaicSpan(
                    i,
                    categoryProducts.length
                  )} group relative overflow-hidden text-left focus:outline-none`}
                  style={{
                    transform: isClicked
                      ? "scale(1.06) perspective(900px) translateZ(50px)"
                      : "scale(1)",
                    opacity: isClicked ? 0 : 1,
                    transition:
                      "transform 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.35s ease",
                    zIndex: isClicked ? 10 : 1,
                  }}
                >
                  {/* Product image */}
                  <div className="absolute inset-0">
                    <ProductImage
                      src={product.images[0]}
                      alt={product.name}
                      name={product.name}
                      category={product.category}
                      size="lg"
                    />
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8 md:p-10">
                    <span className="text-[0.5625rem] tracking-[0.25em] text-white/60 mb-2 font-body uppercase">
                      {String(i + 1).padStart(2, "0")} / {product.category.toUpperCase()}
                    </span>
                    <h3 className="font-headline text-3xl md:text-4xl text-white">
                      {product.name.toUpperCase()}
                    </h3>
                    <p className="text-white/80 font-headline text-xl mt-1">
                      {formatPrice(product.price)}
                    </p>
                    <p className="text-white/50 text-xs mt-3 font-body tracking-wider uppercase">
                      Click to view →
                    </p>
                  </div>

                  {/* Stock badge */}
                  {!product.inStock && (
                    <div className="absolute top-6 right-6 z-10">
                      <span className="text-[0.6875rem] bg-akruti-dark text-akruti-cream px-4 py-1 tracking-[0.1em] font-body">
                        SOLD OUT
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
