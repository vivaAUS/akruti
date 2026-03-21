"use client";

import { notFound } from "next/navigation";
import { use, useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ChevronLeft, ChevronRight, Minus, Plus,
  ShoppingCart, Zap, Star, Send, X, ZoomIn, ZoomOut,
} from "lucide-react";
import { useCatalogStore } from "@/store/catalog";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/format";
import toast from "react-hot-toast";

// ─── Static data ──────────────────────────────────────────────────────────────

const MATERIALS = [
  { id: "pla",    label: "Premium PLA+",  hex: "#e8d5b7", note: "Matte finish · standard" },
  { id: "petg",   label: "PETG",          hex: "#a8c4d4", note: "Semi-gloss · heat-safe" },
  { id: "metal",  label: "Metal Fill",    hex: "#c49a4a", note: "Bronze / copper · polished" },
  { id: "carbon", label: "Carbon Fibre",  hex: "#2a2928", note: "Industrial · high-strength" },
];

const COLOURS = [
  { id: "black",      label: "Matte Black",    hex: "#1c1b1b" },
  { id: "white",      label: "Silk White",      hex: "#e8e4e0" },
  { id: "gold",       label: "Metallic Gold",   hex: "#c49a4a" },
  { id: "indigo",     label: "Indigo",          hex: "#4338ca" },
  { id: "terracotta", label: "Terracotta",      hex: "#b45309" },
  { id: "sage",       label: "Sage Green",      hex: "#4d7c5d" },
  { id: "crimson",    label: "Crimson",         hex: "#be3030" },
  { id: "silver",     label: "Silver",          hex: "#9baabb" },
];

const SPECS: Record<string, [string, string][]> = {
  "geometric-fidget-cube": [
    ["Dimensions", "45 × 45 × 45 mm"], ["Weight", "~62 g"],
    ["Layer height", "0.15 mm"],        ["Infill", "25% gyroid"],
    ["Print time", "~6 h"],             ["Material", "PLA+"],
    ["Origin", "Australia"],            ["Model ref", "AKR-0001"],
  ],
  "infinity-flip-ring": [
    ["Ring diameter", "Ø 22 mm"],       ["Weight", "~8 g"],
    ["Layer height", "0.12 mm"],        ["Infill", "40% rectilinear"],
    ["Print time", "~3 h"],             ["Material", "PLA+"],
    ["Origin", "Australia"],            ["Model ref", "AKR-0005"],
  ],
  "custom-name-keychain": [
    ["Dimensions", "60 × 18 × 4 mm"],  ["Weight", "~5 g"],
    ["Characters", "Up to 12"],         ["Layer height", "0.15 mm"],
    ["Print time", "~45 min"],          ["Material", "PLA+"],
    ["Origin", "Australia"],            ["Model ref", "AKR-0002"],
  ],
  "hex-charm-keychain": [
    ["Dimensions", "32 × 32 × 4 mm"],  ["Weight", "~4 g"],
    ["Pattern", "Honeycomb cutout"],    ["Layer height", "0.15 mm"],
    ["Print time", "~30 min"],          ["Material", "PLA+"],
    ["Origin", "Australia"],            ["Model ref", "AKR-0006"],
  ],
  "articulated-dragon": [
    ["Length", "~280 mm"],              ["Weight", "~185 g"],
    ["Segments", "38 jointed"],         ["Layer height", "0.15 mm"],
    ["Print time", "~9 h"],             ["Material", "PLA+"],
    ["Origin", "Australia"],            ["Model ref", "AKR-0003"],
  ],
  "miniature-astronaut": [
    ["Height", "75 mm (1:32 scale)"],   ["Weight", "~45 g"],
    ["Detail height", "0.10 mm"],       ["Infill", "30% rectilinear"],
    ["Print time", "~5 h"],             ["Material", "PLA+"],
    ["Origin", "Australia"],            ["Model ref", "AKR-0007"],
  ],
  "phone-stand": [
    ["Dimensions", "90 × 75 × 60 mm"], ["Weight", "~48 g"],
    ["Compatibility", "50–90 mm wide"], ["Layer height", "0.20 mm"],
    ["Print time", "~4 h"],             ["Material", "PLA+"],
    ["Origin", "Australia"],            ["Model ref", "AKR-0004"],
  ],
  "cable-clip-organiser": [
    ["Pack size", "6 clips"],           ["Per clip", "28 × 20 × 14 mm"],
    ["Total weight", "~36 g"],          ["Layer height", "0.20 mm"],
    ["Print time", "~2.5 h (set)"],     ["Material", "PLA+"],
    ["Origin", "Australia"],            ["Model ref", "AKR-0008"],
  ],
};

type Review = { id: string; name: string; rating: number; text: string; date: string };

const SEED_REVIEWS: Record<string, Review[]> = {
  "geometric-fidget-cube": [
    { id: "r1", name: "Sophie M.",  rating: 5, text: "Surface finish is incredible. In a completely different league from cheaper cubes.", date: "12 Feb 2026" },
    { id: "r2", name: "James K.",   rating: 5, text: "Arrived in 4 days. The matte black is gorgeous — my go-to focus tool.", date: "28 Jan 2026" },
    { id: "r3", name: "Priya R.",   rating: 4, text: "Really satisfying. Heavier than expected but in a good way — feels genuinely premium.", date: "14 Jan 2026" },
  ],
  "infinity-flip-ring": [
    { id: "r1", name: "Alex T.",  rating: 5, text: "Wore it all day and couldn't stop flipping it. The single-piece print is astonishing.", date: "3 Mar 2026" },
    { id: "r2", name: "Nina W.",  rating: 5, text: "Perfectly smooth. Printed as one piece and it just works.", date: "18 Feb 2026" },
  ],
  "articulated-dragon": [
    { id: "r1", name: "Maya R.",   rating: 5, text: "Every segment moves smoothly. I've seen many flex dragons but this is on another level.", date: "8 Mar 2026" },
    { id: "r2", name: "Daniel C.", rating: 5, text: "My son absolutely loves it. No glue, no assembly. Absolute magic.", date: "22 Feb 2026" },
    { id: "r3", name: "Sara N.",   rating: 4, text: "Incredible craftsmanship. The detail on the scales is beautiful.", date: "10 Feb 2026" },
  ],
};

// ─── Lightbox ─────────────────────────────────────────────────────────────────

function Lightbox({
  images, startIndex, onClose,
}: { images: string[]; startIndex: number; onClose: () => void }) {
  const [idx,      setIdx]      = useState(startIndex);
  const [scale,    setScale]    = useState(1);
  const [pos,      setPos]      = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragOrigin = useRef({ mx: 0, my: 0, px: 0, py: 0 });
  const imgRef = useRef<HTMLImageElement>(null);

  // Reset pan+zoom on image change
  function goTo(newIdx: number) {
    setIdx(newIdx);
    setScale(1);
    setPos({ x: 0, y: 0 });
  }

  // ESC to close
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape")      onClose();
      if (e.key === "ArrowRight")  goTo(Math.min(images.length - 1, idx + 1));
      if (e.key === "ArrowLeft")   goTo(Math.max(0, idx - 1));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  // Prevent body scroll while lightbox is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Wheel zoom
  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const factor = e.deltaY < 0 ? 1.12 : 0.9;
    setScale((s) => {
      const next = Math.min(5, Math.max(1, s * factor));
      if (next <= 1) setPos({ x: 0, y: 0 });
      return next;
    });
  }, []);

  // Mouse pan
  function onMouseDown(e: React.MouseEvent) {
    if (scale <= 1) return;
    e.preventDefault();
    setDragging(true);
    dragOrigin.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y };
  }
  function onMouseMove(e: React.MouseEvent) {
    if (!dragging) return;
    const dx = e.clientX - dragOrigin.current.mx;
    const dy = e.clientY - dragOrigin.current.my;
    setPos({ x: dragOrigin.current.px + dx, y: dragOrigin.current.py + dy });
  }
  function onMouseUp() { setDragging(false); }

  // Touch pan (single finger)
  const touchOrigin = useRef({ tx: 0, ty: 0, px: 0, py: 0 });
  function onTouchStart(e: React.TouchEvent) {
    if (scale <= 1 || e.touches.length !== 1) return;
    touchOrigin.current = { tx: e.touches[0].clientX, ty: e.touches[0].clientY, px: pos.x, py: pos.y };
  }
  function onTouchMove(e: React.TouchEvent) {
    if (e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - touchOrigin.current.tx;
    const dy = e.touches[0].clientY - touchOrigin.current.ty;
    setPos({ x: touchOrigin.current.px + dx, y: touchOrigin.current.py + dy });
  }

  const canPrev = idx > 0;
  const canNext = idx < images.length - 1;

  return (
    <div
      className="fixed inset-0 z-[1000] flex flex-col"
      style={{ background: "rgba(12,11,11,0.97)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
           style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <span className="text-[0.6rem] tracking-[0.2em] uppercase text-white/30 font-body">
          {idx + 1} / {images.length}
        </span>
        <div className="flex items-center gap-3">
          {/* Zoom controls */}
          <button
            onClick={() => setScale((s) => { const n = Math.min(5, s * 1.25); return n; })}
            className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <span className="text-[0.6rem] tracking-[0.1em] text-white/30 font-body w-10 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale((s) => { const n = Math.max(1, s * 0.8); if (n <= 1) setPos({ x: 0, y: 0 }); return n; })}
            className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          {scale > 1 && (
            <button
              onClick={() => { setScale(1); setPos({ x: 0, y: 0 }); }}
              className="text-[0.6rem] tracking-[0.12em] uppercase text-white/30 hover:text-white font-body transition-colors px-2"
            >
              Reset
            </button>
          )}
          <div className="w-px h-5 bg-white/10 mx-1" />
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white transition-colors"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Image area */}
      <div
        className="flex-1 relative overflow-hidden flex items-center justify-center"
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        style={{ cursor: scale > 1 ? (dragging ? "grabbing" : "grab") : "zoom-in" }}
        onClick={() => { if (scale === 1 && !dragging) setScale(2); }}
      >
        {/* Subtle radial glow behind image */}
        <div className="absolute inset-0 pointer-events-none"
             style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(196,154,74,0.04) 0%, transparent 70%)" }} />

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={images[idx]}
          alt=""
          draggable={false}
          style={{
            maxWidth: "92vw",
            maxHeight: "80vh",
            width: "auto",
            height: "auto",
            objectFit: "contain",
            transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
            transition: dragging ? "none" : "transform 0.18s cubic-bezier(0.4,0,0.2,1)",
            userSelect: "none",
            WebkitUserSelect: "none",
          }}
        />

        {/* Prev button */}
        {canPrev && (
          <button
            onClick={(e) => { e.stopPropagation(); goTo(idx - 1); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center transition-all duration-200 hover:scale-110"
            style={{
              background: "rgba(255,255,255,0.10)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.18)",
              borderRadius: "50%",
            }}
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
        )}

        {/* Next button */}
        {canNext && (
          <button
            onClick={(e) => { e.stopPropagation(); goTo(idx + 1); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center transition-all duration-200 hover:scale-110"
            style={{
              background: "rgba(255,255,255,0.10)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.18)",
              borderRadius: "50%",
            }}
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        )}
      </div>

      {/* Hint */}
      <p className="text-center text-[0.575rem] tracking-[0.18em] uppercase text-white/18 font-body py-2 flex-shrink-0">
        Scroll to zoom · Drag to pan · Click to zoom in · Esc to close
      </p>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex justify-center gap-2 pb-4 flex-shrink-0 px-4 flex-wrap">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="flex-shrink-0 overflow-hidden transition-all duration-200"
              style={{
                width: 52, height: 52,
                border: i === idx ? "2px solid #c49a4a" : "2px solid rgba(255,255,255,0.12)",
                opacity: i === idx ? 1 : 0.45,
                transform: i === idx ? "scale(1.08)" : "scale(1)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Star selector ─────────────────────────────────────────────────────────────

function StarSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          type="button"
          key={star}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform duration-100 hover:scale-110"
        >
          <Star
            className="w-5 h-5 transition-colors duration-100"
            style={{
              fill: star <= (hover || value) ? "#c49a4a" : "transparent",
              color: star <= (hover || value) ? "#c49a4a" : "#d2c5b3",
            }}
          />
        </button>
      ))}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const products = useCatalogStore((s) => s.products);
  const product  = products.find((p) => p.slug === slug);
  if (!product) notFound();

  const addItem        = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);

  // ── Gallery state ──
  const [activeImg,    setActiveImg]    = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const stripRef  = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startScroll(dir: "left" | "right") {
    stopScroll();
    scrollRef.current = setInterval(() => {
      if (stripRef.current) stripRef.current.scrollLeft += dir === "right" ? 3 : -3;
    }, 16);
  }
  function stopScroll() {
    if (scrollRef.current) { clearInterval(scrollRef.current); scrollRef.current = null; }
  }
  useEffect(() => () => stopScroll(), []);

  // ── Purchase state ──
  const [material, setMaterial] = useState(MATERIALS[0].id);
  const [colour,   setColour]   = useState(COLOURS[0].id);
  const [qty,      setQty]      = useState(1);

  // ── Section tabs ──
  const [activeSection, setActiveSection] = useState<"description" | "technical" | "reviews">("description");

  // ── Reviews state ──
  const [reviews,        setReviews]        = useState<Review[]>(SEED_REVIEWS[product.slug] ?? []);
  const [formName,       setFormName]       = useState("");
  const [formRating,     setFormRating]     = useState(5);
  const [formText,       setFormText]       = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);

  const avgRating = reviews.length
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
    : 0;

  const specs = SPECS[product.slug] ?? [
    ["Material",     "PLA+"],
    ["Layer height", "0.15 mm"],
    ["Lead time",    "3–5 business days"],
    ["Origin",       "Australia"],
    ["Model ref",    `AKR-${product.id.padStart(4, "0")}`],
  ];

  function handleAdd() {
    addItem(product);
    if (qty > 1) updateQuantity(product.id, qty);
    toast.success(`${qty}× ${product.name} added to cart`);
  }

  function handleBuyNow() {
    handleAdd();
    toast("Checkout coming soon!", { icon: "⏳" });
  }

  function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formName.trim() || !formText.trim()) return;
    setFormSubmitting(true);
    setTimeout(() => {
      const newReview: Review = {
        id:     `u-${Date.now()}`,
        name:   formName.trim(),
        rating: formRating,
        text:   formText.trim(),
        date:   new Date().toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }),
      };
      setReviews((prev) => [newReview, ...prev]);
      setFormName(""); setFormRating(5); setFormText("");
      setFormSubmitting(false);
      toast.success("Review submitted — thank you!");
    }, 600);
  }

  const selectedColour   = COLOURS.find((c) => c.id === colour)!;
  const selectedMaterial = MATERIALS.find((m) => m.id === material)!;

  return (
    <>
      {/* ── Lightbox ───────────────────────────────────────────────────── */}
      {lightboxOpen && (
        <Lightbox
          images={product.images}
          startIndex={activeImg}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      <div className="min-h-screen bg-white">

        {/* ── Breadcrumb ───────────────────────────────────────────────── */}
        <nav className="fixed top-[4.5rem] left-0 right-0 z-40 flex items-center gap-1.5 px-8 py-2.5 bg-white/90 backdrop-blur-sm font-body"
             style={{ borderBottom: "1px solid rgba(210,197,179,0.15)" }}>
          <Link href="/" className="text-[0.6rem] tracking-[0.12em] uppercase text-akruti-muted/50 hover:text-akruti-primary transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 text-akruti-border" />
          <Link href="/shop" className="text-[0.6rem] tracking-[0.12em] uppercase text-akruti-muted/50 hover:text-akruti-primary transition-colors">Catalogue</Link>
          <ChevronRight className="w-3 h-3 text-akruti-border" />
          <span className="text-[0.6rem] tracking-[0.12em] uppercase text-akruti-dark truncate">{product.name}</span>
        </nav>

        <div className="pt-[7.5rem]">

          {/* ══════════════════════════════════════════════════════════════
              GALLERY — full-width, dark background, contain fit
          ══════════════════════════════════════════════════════════════ */}
          <div className="w-full" style={{ background: "#111010", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>

            {/* Ambient gold glow behind the product */}
            <div className="relative" style={{ maxHeight: "80vh" }}>
              <div className="absolute inset-0 pointer-events-none"
                   style={{ background: "radial-gradient(ellipse at 50% 60%, rgba(196,154,74,0.08) 0%, transparent 65%)" }} />

              {/* Main image — object-contain so nothing gets cropped */}
              <div
                className="relative flex items-center justify-center"
                style={{ minHeight: 420, maxHeight: "80vh", height: "60vw" }}
              >
                {product.images.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={src}
                    src={src}
                    alt={`${product.name} — view ${i + 1}`}
                    onClick={() => { setActiveImg(i); setLightboxOpen(true); }}
                    className="absolute transition-opacity duration-500 select-none"
                    style={{
                      opacity: activeImg === i ? 1 : 0,
                      maxWidth: "100%",
                      maxHeight: "100%",
                      width: "auto",
                      height: "auto",
                      objectFit: "contain",
                      cursor: "zoom-in",
                    }}
                  />
                ))}

                {/* Prev / next on main image */}
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImg((a) => Math.max(0, a - 1))}
                      disabled={activeImg === 0}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center transition-all duration-200 hover:scale-110 disabled:opacity-0 z-10"
                      style={{
                        background: "rgba(255,255,255,0.10)",
                        backdropFilter: "blur(16px)",
                        WebkitBackdropFilter: "blur(16px)",
                        border: "1px solid rgba(255,255,255,0.20)",
                        borderRadius: "50%",
                      }}
                    >
                      <ChevronLeft className="w-4 h-4 text-white" />
                    </button>
                    <button
                      onClick={() => setActiveImg((a) => Math.min(product.images.length - 1, a + 1))}
                      disabled={activeImg === product.images.length - 1}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center transition-all duration-200 hover:scale-110 disabled:opacity-0 z-10"
                      style={{
                        background: "rgba(255,255,255,0.10)",
                        backdropFilter: "blur(16px)",
                        WebkitBackdropFilter: "blur(16px)",
                        border: "1px solid rgba(255,255,255,0.20)",
                        borderRadius: "50%",
                      }}
                    >
                      <ChevronRight className="w-4 h-4 text-white" />
                    </button>
                  </>
                )}

                {/* Image counter */}
                <div className="absolute bottom-3 right-4 px-3 py-1 font-body text-[0.575rem] tracking-[0.15em] text-white/50"
                     style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)" }}>
                  {activeImg + 1} / {product.images.length}
                </div>

                {/* Click-to-expand hint */}
                <div className="absolute bottom-3 left-4 px-3 py-1 font-body text-[0.575rem] tracking-[0.12em] uppercase text-white/25"
                     style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(8px)" }}>
                  Click to expand
                </div>
              </div>
            </div>

            {/* Thumbnail strip with glass scroll buttons */}
            <div className="relative" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>

              {/* Left glass fade + button */}
              <button
                onMouseEnter={() => startScroll("left")}
                onMouseLeave={stopScroll}
                onClick={() => setActiveImg((a) => Math.max(0, a - 1))}
                className="absolute left-0 top-0 bottom-0 z-10 w-14 flex items-center justify-center group"
                style={{ background: "linear-gradient(to right, rgba(17,16,16,0.95) 0%, transparent 100%)" }}
                aria-label="Scroll left"
              >
                <div className="w-7 h-7 flex items-center justify-center rounded-full opacity-50 group-hover:opacity-100 transition-all duration-200 group-hover:scale-110"
                     style={{
                       background: "rgba(255,255,255,0.10)",
                       backdropFilter: "blur(16px)",
                       WebkitBackdropFilter: "blur(16px)",
                       border: "1px solid rgba(255,255,255,0.18)",
                     }}>
                  <ChevronLeft className="w-3.5 h-3.5 text-white" />
                </div>
              </button>

              {/* Right glass fade + button */}
              <button
                onMouseEnter={() => startScroll("right")}
                onMouseLeave={stopScroll}
                onClick={() => setActiveImg((a) => Math.min(product.images.length - 1, a + 1))}
                className="absolute right-0 top-0 bottom-0 z-10 w-14 flex items-center justify-center group"
                style={{ background: "linear-gradient(to left, rgba(17,16,16,0.95) 0%, transparent 100%)" }}
                aria-label="Scroll right"
              >
                <div className="w-7 h-7 flex items-center justify-center rounded-full opacity-50 group-hover:opacity-100 transition-all duration-200 group-hover:scale-110"
                     style={{
                       background: "rgba(255,255,255,0.10)",
                       backdropFilter: "blur(16px)",
                       WebkitBackdropFilter: "blur(16px)",
                       border: "1px solid rgba(255,255,255,0.18)",
                     }}>
                  <ChevronRight className="w-3.5 h-3.5 text-white" />
                </div>
              </button>

              {/* Scrollable thumbnail row */}
              <div
                ref={stripRef}
                className="flex gap-2 px-16 py-3 overflow-x-auto"
                style={{ scrollBehavior: "smooth", scrollbarWidth: "none" }}
              >
                {product.images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className="flex-shrink-0 overflow-hidden transition-all duration-200 hover:opacity-80"
                    style={{
                      width: 72, height: 72,
                      border: activeImg === i ? "2px solid #c49a4a" : "2px solid rgba(255,255,255,0.12)",
                      opacity: activeImg === i ? 1 : 0.50,
                      transform: activeImg === i ? "scale(1.07)" : "scale(1)",
                      background: "#1c1b1b",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════
              PRODUCT INFO + PURCHASE
          ══════════════════════════════════════════════════════════════ */}
          <div className="max-w-[1920px] mx-auto px-8 py-12 grid grid-cols-1 lg:grid-cols-2 gap-14"
               style={{ borderBottom: "1px solid rgba(210,197,179,0.2)" }}>

            {/* Left — name / description */}
            <div>
              <p className="text-[0.6rem] tracking-[0.22em] uppercase text-akruti-gold font-body mb-2">
                {product.category}
              </p>
              <h1 className="font-headline text-5xl md:text-6xl tracking-tighter text-akruti-dark leading-none mb-4 uppercase">
                {product.name}
              </h1>
              <p className="font-headline text-3xl text-akruti-dark/60 mb-6">{formatPrice(product.price)}</p>
              <p className="text-sm font-body text-akruti-muted leading-relaxed max-w-lg mb-8">
                {product.description}
              </p>
              <ul className="flex flex-col gap-2">
                {["Made to order", "Ships in 3–5 business days", "Premium filament", "30-day quality guarantee"].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-xs font-body text-akruti-muted">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#c49a4a" }} />
                    {f}
                  </li>
                ))}
              </ul>
              {!product.inStock && (
                <div className="mt-6 inline-flex items-center gap-2 px-4 py-2"
                     style={{ border: "1px solid rgba(190,48,48,0.3)", background: "rgba(190,48,48,0.04)" }}>
                  <span className="text-[0.6rem] tracking-[0.2em] uppercase font-body text-red-600">Out of Stock</span>
                </div>
              )}
            </div>

            {/* Right — options + buy */}
            <div className="flex flex-col gap-7">

              {/* Material */}
              <div>
                <p className="text-[0.6rem] tracking-[0.2em] uppercase text-akruti-muted font-body mb-3">
                  Material — <span className="text-akruti-dark font-semibold">{selectedMaterial.label}</span>
                  <span className="text-akruti-muted/50 ml-2 italic normal-case tracking-normal">{selectedMaterial.note}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {MATERIALS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMaterial(m.id)}
                      className="flex items-center gap-2.5 px-3 py-2.5 transition-all duration-200"
                      style={{
                        border: material === m.id ? "1.5px solid #c49a4a" : "1px solid rgba(210,197,179,0.5)",
                        background: material === m.id ? "rgba(196,154,74,0.06)" : "transparent",
                      }}
                    >
                      <span className="w-4 h-4 rounded-full flex-shrink-0"
                            style={{ background: m.hex, border: "1px solid rgba(0,0,0,0.1)" }} />
                      <span className="text-[0.65rem] tracking-[0.1em] uppercase font-body text-akruti-dark">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Colour */}
              <div>
                <p className="text-[0.6rem] tracking-[0.2em] uppercase text-akruti-muted font-body mb-3">
                  Colour — <span className="text-akruti-dark font-semibold">{selectedColour.label}</span>
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {COLOURS.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setColour(c.id)}
                      title={c.label}
                      className="w-8 h-8 rounded-full focus:outline-none transition-all duration-200 hover:scale-110"
                      style={{
                        background: c.hex,
                        border: colour === c.id ? "2.5px solid #c49a4a" : "2px solid rgba(210,197,179,0.3)",
                        boxShadow: colour === c.id
                          ? "0 0 0 3px rgba(196,154,74,0.18), inset 0 1px 2px rgba(0,0,0,0.15)"
                          : "inset 0 1px 2px rgba(0,0,0,0.1)",
                        transform: colour === c.id ? "scale(1.15)" : "scale(1)",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <p className="text-[0.6rem] tracking-[0.2em] uppercase text-akruti-muted font-body mb-3">Quantity</p>
                <div className="flex items-center gap-0 w-fit"
                     style={{ border: "1px solid rgba(210,197,179,0.5)" }}>
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center text-akruti-dark hover:bg-akruti-surface transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-12 text-center font-headline text-lg text-akruti-dark"
                        style={{ borderLeft: "1px solid rgba(210,197,179,0.5)", borderRight: "1px solid rgba(210,197,179,0.5)" }}>
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className="w-10 h-10 flex items-center justify-center text-akruti-dark hover:bg-akruti-surface transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleAdd}
                  disabled={!product.inStock}
                  className="flex-1 flex items-center justify-center gap-2 py-4 font-body text-[0.65rem] tracking-[0.18em] uppercase transition-all duration-200 disabled:opacity-40"
                  style={{ background: "rgba(123,88,11,0.07)", border: "1px solid rgba(123,88,11,0.35)", color: "#7b580b" }}
                  onMouseEnter={(e) => { if (product.inStock) { e.currentTarget.style.background = "rgba(123,88,11,0.13)"; e.currentTarget.style.transform = "perspective(400px) rotateX(-4deg)"; } }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(123,88,11,0.07)"; e.currentTarget.style.transform = "none"; }}
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  {product.inStock ? "Add to Cart" : "Out of Stock"}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={!product.inStock}
                  className="flex-1 flex items-center justify-center gap-2 py-4 font-body text-[0.65rem] tracking-[0.18em] uppercase transition-all duration-200 disabled:opacity-40 text-akruti-cream"
                  style={{ background: "#1c1b1b" }}
                  onMouseEnter={(e) => { if (product.inStock) { e.currentTarget.style.background = "#2a2520"; e.currentTarget.style.transform = "perspective(400px) rotateX(-4deg)"; } }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#1c1b1b"; e.currentTarget.style.transform = "none"; }}
                >
                  <Zap className="w-3.5 h-3.5" />
                  Buy Now
                </button>
              </div>

              <p className="text-[0.575rem] tracking-[0.18em] uppercase text-akruti-muted/40 font-body text-center">
                Made to order · Ships in 3–5 business days · Australia-wide & international
              </p>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════
              SECTIONS — Description / Technical / Reviews
          ══════════════════════════════════════════════════════════════ */}
          <div className="max-w-[1920px] mx-auto px-8">

            {/* Section tabs */}
            <div className="flex" style={{ borderBottom: "1px solid rgba(210,197,179,0.3)" }}>
              {(["description", "technical", "reviews"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setActiveSection(s)}
                  className="py-5 px-6 font-headline text-sm uppercase tracking-tight transition-colors -mb-px"
                  style={{
                    color: activeSection === s ? "#1c1b1b" : "rgba(78,70,56,0.4)",
                    borderBottom: activeSection === s ? "2px solid #1c1b1b" : "2px solid transparent",
                  }}
                >
                  {s === "reviews" ? `Reviews (${reviews.length})` : s}
                </button>
              ))}
            </div>

            {/* Description */}
            {activeSection === "description" && (
              <div className="py-12 max-w-3xl">
                <h2 className="font-headline text-3xl uppercase tracking-tighter text-akruti-dark mb-6">About this print</h2>
                <div className="text-sm font-body text-akruti-muted leading-relaxed space-y-4">
                  <p>{product.description}</p>
                  <p>Every piece is printed fresh to order using premium PLA+ filament on Bambu Lab X1C printers at 0.15 mm layer height. We run a quality inspection on every unit before dispatch — checking dimensional accuracy, surface finish, and structural integrity.</p>
                  <p>Packed in tissue paper and shipped in a rigid box. Tracking number emailed on dispatch. Standard delivery within Australia is 2–5 business days from ship date.</p>
                </div>
                <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Layer height", value: "0.15 mm" },
                    { label: "Print infill",  value: "25% gyroid" },
                    { label: "Lead time",     value: "3–5 days" },
                    { label: "Filament",      value: "Premium PLA+" },
                  ].map((s) => (
                    <div key={s.label} className="py-6 px-5 bg-akruti-cream-low" style={{ border: "1px solid rgba(210,197,179,0.3)" }}>
                      <p className="font-headline text-xl text-akruti-dark mb-1">{s.value}</p>
                      <p className="text-[0.6rem] tracking-[0.15em] uppercase text-akruti-muted font-body">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Technical */}
            {activeSection === "technical" && (
              <div className="py-12 max-w-2xl">
                <h2 className="font-headline text-3xl uppercase tracking-tighter text-akruti-dark mb-6">Technical Specifications</h2>
                <div className="divide-y" style={{ borderTop: "1px solid rgba(210,197,179,0.3)" }}>
                  {specs.map(([key, val]) => (
                    <div key={key} className="flex justify-between py-4" style={{ borderColor: "rgba(210,197,179,0.25)" }}>
                      <span className="text-[0.65rem] tracking-[0.15em] uppercase text-akruti-muted font-body">{key}</span>
                      <span className="text-sm font-body text-akruti-dark font-medium">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {activeSection === "reviews" && (
              <div className="py-12 grid grid-cols-1 lg:grid-cols-2 gap-14">

                {/* Review list */}
                <div>
                  <div className="flex items-end gap-5 mb-8">
                    <span className="font-headline text-7xl text-akruti-dark leading-none">
                      {reviews.length ? avgRating.toFixed(1) : "—"}
                    </span>
                    <div>
                      <div className="flex gap-0.5 mb-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className="w-4 h-4"
                            style={{ fill: s <= Math.round(avgRating) ? "#c49a4a" : "transparent", color: "#c49a4a" }} />
                        ))}
                      </div>
                      <p className="text-[0.6rem] tracking-[0.2em] uppercase text-akruti-muted font-body">
                        {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                      </p>
                    </div>
                  </div>

                  {reviews.length === 0 ? (
                    <p className="text-sm font-body text-akruti-muted/50 italic">No reviews yet. Be the first to leave one.</p>
                  ) : (
                    <div className="flex flex-col divide-y" style={{ borderTop: "1px solid rgba(210,197,179,0.3)" }}>
                      {reviews.map((r) => (
                        <div key={r.id} className="py-5" style={{ borderColor: "rgba(210,197,179,0.25)" }}>
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div>
                              <p className="font-body text-sm font-semibold text-akruti-dark">{r.name}</p>
                              <p className="text-[0.6rem] tracking-[0.1em] text-akruti-muted/50 font-body">{r.date}</p>
                            </div>
                            <div className="flex gap-0.5 flex-shrink-0">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} className="w-3 h-3"
                                  style={{ fill: s <= r.rating ? "#c49a4a" : "transparent", color: "#c49a4a" }} />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm font-body text-akruti-muted leading-relaxed">{r.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit review */}
                <div>
                  <h3 className="font-headline text-2xl uppercase tracking-tighter text-akruti-dark mb-6">Leave a Review</h3>
                  <form onSubmit={handleReviewSubmit} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[0.6rem] tracking-[0.18em] uppercase text-akruti-muted font-body">Your Name *</label>
                      <input
                        required value={formName} onChange={(e) => setFormName(e.target.value)}
                        placeholder="e.g. Sophie M."
                        className="bg-akruti-surface px-4 py-3 text-sm font-body text-akruti-dark placeholder-akruti-muted/40 outline-none focus:ring-1 focus:ring-akruti-gold/40"
                        style={{ border: "1px solid rgba(210,197,179,0.5)" }}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[0.6rem] tracking-[0.18em] uppercase text-akruti-muted font-body">Rating *</label>
                      <StarSelector value={formRating} onChange={setFormRating} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[0.6rem] tracking-[0.18em] uppercase text-akruti-muted font-body">Your Review *</label>
                      <textarea
                        required rows={5} value={formText} onChange={(e) => setFormText(e.target.value)}
                        placeholder="Share your experience with this product…"
                        className="bg-akruti-surface px-4 py-3 text-sm font-body text-akruti-dark placeholder-akruti-muted/40 outline-none focus:ring-1 focus:ring-akruti-gold/40 resize-none"
                        style={{ border: "1px solid rgba(210,197,179,0.5)" }}
                      />
                    </div>
                    <button
                      type="submit" disabled={formSubmitting}
                      className="flex items-center justify-center gap-2 bg-akruti-dark text-akruti-cream font-headline text-sm uppercase tracking-widest py-4 hover:bg-akruti-primary transition-colors duration-300 disabled:opacity-60"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {formSubmitting ? "Submitting…" : "Submit Review"}
                    </button>
                    <p className="text-[0.6rem] tracking-[0.1em] text-akruti-muted/40 font-body text-center">
                      Reviews are published immediately and visible to all customers.
                    </p>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
