"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { type Category } from "@/data/categories";
import { useCatalogStore } from "@/store/catalog";

// Bento spans: alternating wide/narrow per row
const spans = ["md:col-span-5", "md:col-span-7", "md:col-span-7", "md:col-span-5"];

export default function CategoryMosaic() {
  const router = useRouter();
  const categories = useCatalogStore((s) => s.categories);
  const [clicked, setClicked] = useState<string | null>(null);

  function handleClick(id: string) {
    setClicked(id);
    setTimeout(() => router.push(`/shop/${id}`), 450);
  }

  return (
    <section className="bg-white py-32 px-8 overflow-hidden">
      <div className="max-w-[1920px] mx-auto">

        {/* Section header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
          <div className="max-w-xl">
            <h2 className="font-headline text-5xl md:text-7xl tracking-tight leading-none mb-6 text-akruti-dark">
              THE COLLECTION
            </h2>
            <p className="text-sm text-akruti-muted leading-relaxed max-w-sm font-body">
              Every piece is printed fresh to order. No shelf stock —
              only purpose-built prints shipped within 3–5 business days.
            </p>
          </div>
          <div className="flex gap-6 text-[0.6875rem] tracking-[0.1em] font-body">
            <span className="text-akruti-primary border-b border-akruti-primary pb-1">ALL CATEGORIES</span>
            {categories.slice(0, 2).map((c) => (
              <button
                key={c.id}
                onClick={() => handleClick(c.id)}
                className="text-akruti-dark/30 hover:text-akruti-dark/70 cursor-pointer transition-colors uppercase"
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Mosaic grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-[320px] md:auto-rows-[420px]">
          {categories.map((cat, i) => (
            <CategoryCell
              key={cat.id}
              category={cat}
              span={spans[i] ?? "md:col-span-6"}
              index={i + 1}
              isClicked={clicked === cat.id}
              onClick={() => handleClick(cat.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryCell({
  category,
  span,
  index,
  isClicked,
  onClick,
}: {
  category: Category;
  span: string;
  index: number;
  isClicked: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`${span} relative overflow-hidden text-left focus:outline-none`}
      style={{
        transform: isClicked
          ? "scale(1.06) perspective(900px) translateZ(50px)"
          : hovered
          ? "scale(1.025) perspective(900px) translateZ(12px)"
          : "scale(1) perspective(900px) translateZ(0)",
        opacity: isClicked ? 0 : 1,
        transition: "transform 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.35s ease",
        zIndex: hovered || isClicked ? 10 : 1,
      }}
    >
      {/* Real photo background */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={category.image}
        alt={category.name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700"
        style={{ transform: hovered ? "scale(1.06)" : "scale(1)" }}
      />

      {/* Gradient overlay for readability */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${category.gradient} transition-opacity duration-500`}
        style={{ opacity: hovered ? 0.55 : 0.72 }}
      />

      {/* Content */}
      <div className="relative z-10 p-8 md:p-10 h-full flex flex-col justify-between">
        {/* Index */}
        <span className="text-[0.5625rem] tracking-[0.3em] text-white/50 font-body">
          {String(index).padStart(2, "0")} / {categories.length.toString().padStart(2, "0")}
        </span>

        {/* Name + text */}
        <div>
          <h3 className="font-headline text-3xl sm:text-4xl md:text-6xl text-white tracking-tight leading-none mb-4">
            {category.name.toUpperCase()}
          </h3>

          {/* Tagline — always shown */}
          <p className="text-white/70 text-sm font-body font-light mb-3 leading-snug">
            {category.tagline}
          </p>

          {/* Detail — slides in on hover */}
          <p
            className="text-white/80 text-sm font-body leading-relaxed max-w-xs"
            style={{
              opacity: hovered ? 1 : 0,
              transform: hovered ? "translateY(0)" : "translateY(10px)",
              transition: "opacity 0.35s ease, transform 0.35s ease",
              maxHeight: hovered ? "100px" : "0",
              overflow: "hidden",
            }}
          >
            {category.detail}
          </p>
        </div>

        {/* Explore arrow */}
        <div
          className="flex items-center gap-2 font-body text-[0.625rem] tracking-[0.25em] uppercase text-white/60"
          style={{
            opacity: hovered ? 1 : 0.3,
            transform: hovered ? "translateX(0)" : "translateX(-6px)",
            transition: "opacity 0.3s ease, transform 0.3s ease",
          }}
        >
          Explore Collection <span className="text-base">→</span>
        </div>
      </div>
    </button>
  );
}
