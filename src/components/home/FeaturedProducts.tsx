"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCatalogStore } from "@/store/catalog";
import { formatPrice } from "@/lib/format";
import { type Product } from "@/lib/types";

const CARD_W = 228;
const CARD_H = 276;
const STEP   = 204; // px between card centres

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function FeaturedProducts() {
  const router     = useRouter();
  const sectionRef = useRef<HTMLElement>(null);
  const products   = useCatalogStore((s) => s.products);
  const all        = products.filter((p) => p.isFeatured);

  const n                         = all.length;
  const [active,    setActive]    = useState(0);
  const [dialOffset, setDialOffset] = useState(0);
  const [carouselHovered, setCarouselHovered] = useState(false);

  const prev = useCallback(() => setActive((i) => (i - 1 + n) % n), [n]);
  const next = useCallback(() => setActive((i) => (i + 1) % n), [n]);

  // Keyboard navigation — also animates the dial
  useEffect(() => {
    if (n === 0) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft")  { prev(); setDialOffset((o) => o - DRAG_PX_STEP); }
      if (e.key === "ArrowRight") { next(); setDialOffset((o) => o + DRAG_PX_STEP); }
      if (e.key === "ArrowDown") {
        const next = sectionRef.current?.nextElementSibling as HTMLElement | null;
        next?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next, n]);

  if (n === 0) return null;

  return (
    <section ref={sectionRef} className="bg-[#faf9f8] py-8 overflow-hidden">

      {/* Header */}
      <div className="max-w-[1920px] mx-auto px-8 mb-7">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <h2 className="font-headline text-2xl md:text-3xl tracking-tight leading-none mb-2 text-akruti-dark">
              FEATURED
            </h2>
            <p className="text-xs text-akruti-muted leading-relaxed max-w-xs font-body">
              Hand-picked pieces — printed fresh to order.
            </p>
          </div>
          <Link
            href="/shop"
            className="text-[0.6875rem] tracking-[0.1em] font-body text-akruti-primary border-b border-akruti-primary pb-1 hover:opacity-70 transition-opacity"
          >
            VIEW ALL
          </Link>
        </div>
      </div>

      {/* Carousel */}
      <Carousel
        products={all}
        active={active}
        setActive={setActive}
        prev={prev}
        next={next}
        onSelect={(p) => router.push(`/product/${p.slug}`)}
        onHoverChange={setCarouselHovered}
      />

      {/* Dial */}
      <div className="flex justify-center mt-8 mb-2" style={{ perspective: "500px" }}>
        <GlassDial
          n={n} active={active} prev={prev} next={next}
          offset={dialOffset} setOffset={setDialOffset}
          showHint={carouselHovered}
        />
      </div>

    </section>
  );
}

// ─── Carousel ─────────────────────────────────────────────────────────────────

function Carousel({
  products, active, setActive, prev, next, onSelect, onHoverChange,
}: {
  products: Product[];
  active: number;
  setActive: (i: number) => void;
  prev: () => void;
  next: () => void;
  onSelect: (p: Product) => void;
  onHoverChange: (h: boolean) => void;
}) {
  const n = products.length;
  const [mouseZone, setMouseZone] = useState<"left" | "right" | "center" | null>(null);

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - left) / width;
    setMouseZone(ratio < 0.35 ? "left" : ratio > 0.65 ? "right" : "center");
  }

  function onWrapperClick() {
    if (mouseZone === "left")  prev();
    if (mouseZone === "right") next();
  }

  const cursor =
    mouseZone === "left"  ? "w-resize" :
    mouseZone === "right" ? "e-resize" : "default";

  return (
    <div
      style={{ position: "relative", height: CARD_H + 60, cursor }}
      onMouseMove={onMouseMove}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => { setMouseZone(null); onHoverChange(false); }}
      onClick={onWrapperClick}
      className="select-none"
    >
      {products.map((p, i) => {
        let offset = i - active;
        if (offset >  n / 2) offset -= n;
        if (offset < -n / 2) offset += n;

        const absOff  = Math.abs(offset);
        const isActive = offset === 0;

        return (
          <div
            key={p.id}
            style={{
              position:  "absolute",
              left:      "50%",
              top:       "50%",
              width:     CARD_W,
              height:    CARD_H,
              transform: `translate(calc(-50% + ${offset * STEP}px), -50%) scale(${isActive ? 1 : absOff === 1 ? 0.78 : 0.60})`,
              opacity:    isActive ? 1 : absOff === 1 ? 0.55 : 0.20,
              filter:    `blur(${isActive ? 0 : absOff === 1 ? 2 : 4}px)`,
              zIndex:    20 - absOff * 5,
              transition: "transform 0.55s cubic-bezier(0.4,0,0.2,1), opacity 0.55s ease, filter 0.55s ease",
              pointerEvents: isActive ? "auto" : "none",
            }}
          >
            <ProductCard
              product={p}
              isActive={isActive}
              onOpen={(e) => { e.stopPropagation(); onSelect(p); }}
            />
          </div>
        );
      })}

      <NavHint side="left"  visible={mouseZone === "left"  && n > 1} />
      <NavHint side="right" visible={mouseZone === "right" && n > 1} />
    </div>
  );
}

// ─── Nav hint ─────────────────────────────────────────────────────────────────

function NavHint({ side, visible }: { side: "left" | "right"; visible: boolean }) {
  return (
    <div style={{
      position: "absolute", top: "50%", [side]: 24,
      transform: "translateY(-50%)",
      opacity: visible ? 1 : 0,
      transition: "opacity 0.25s ease, transform 0.25s ease",
      pointerEvents: "none", zIndex: 30,
      width: 52, height: 52,
      borderRadius: "50%",
      background: "rgba(28,27,27,0.52)",
      backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 2px 16px rgba(0,0,0,0.18)",
    }}>
      <span style={{
        color: "#fff",
        fontSize: "26px",
        lineHeight: 1,
        marginTop: "-1px",
        fontFamily: "serif",
      }}>
        {side === "left" ? "‹" : "›"}
      </span>
    </div>
  );
}

// ─── Product card ─────────────────────────────────────────────────────────────

function ProductCard({
  product, isActive, onOpen,
}: {
  product: Product;
  isActive: boolean;
  onOpen: (e: React.MouseEvent) => void;
}) {
  const img = product.images?.[0];

  return (
    <button
      onClick={onOpen}
      className="group relative w-full h-full overflow-hidden bg-akruti-surface text-left focus:outline-none"
      style={{ cursor: isActive ? "pointer" : "default" }}
      tabIndex={isActive ? 0 : -1}
    >
      {img ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={img} alt={product.name} draggable={false}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-headline text-7xl text-akruti-dark/10">{product.name[0]}</span>
        </div>
      )}

      <div
        className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent transition-opacity duration-500"
        style={{ opacity: isActive ? 0.9 : 0 }}
      />

      <span className="absolute top-5 left-5 text-[0.5rem] tracking-[0.15em] font-body px-2.5 py-1 bg-white/90 text-akruti-dark">
        {product.inStock ? "IN STOCK" : "SOLD OUT"}
      </span>

      <div
        className="absolute inset-x-0 bottom-0 p-7 flex flex-col gap-1.5"
        style={{
          opacity:   isActive ? 1 : 0,
          transform: isActive ? "translateY(0)" : "translateY(12px)",
          transition:"opacity 0.45s ease, transform 0.45s ease",
        }}
      >
        <p className="text-[0.5625rem] tracking-[0.25em] font-body text-white/50 uppercase">{product.category}</p>
        <h3 className="font-headline text-3xl text-white leading-tight">{product.name.toUpperCase()}</h3>
        <p className="text-sm font-body text-white/70 mt-1">{formatPrice(product.price)}</p>
        <p className="text-[0.625rem] tracking-[0.2em] font-body text-white/40 uppercase mt-3">Click to explore →</p>
      </div>
    </button>
  );
}

// ─── Knurled metal dial ────────────────────────────────────────────────────────

const STRIP_W     = 320;
const DISC_H      = 18;   // disc face above the band
const BODY_H      = 30;   // groove band height
const STRIP_H     = DISC_H + BODY_H;
const GROOVE_PITCH = 8;   // px between groove lines
const ARROW_PAD   = 38;
const SVG_W       = STRIP_W + ARROW_PAD * 2;
const DRAG_PX_STEP = 36;

function GlassDial({
  n, prev, next, offset, setOffset, showHint,
}: {
  n: number;
  active: number;
  prev: () => void;
  next: () => void;
  offset: number;
  setOffset: (fn: (o: number) => number) => void;
  showHint: boolean;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const drag = useRef({ active: false, lastX: 0, accumulated: 0 });

  const onMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    e.preventDefault();
    drag.current = { active: true, lastX: e.clientX, accumulated: 0 };
    setIsDragging(true);

    function onMove(ev: MouseEvent) {
      if (!drag.current.active) return;
      const delta = ev.clientX - drag.current.lastX;
      drag.current.lastX        = ev.clientX;
      drag.current.accumulated += delta;
      setOffset((o) => o + delta);
      while (drag.current.accumulated >=  DRAG_PX_STEP) { drag.current.accumulated -= DRAG_PX_STEP; next(); }
      while (drag.current.accumulated <= -DRAG_PX_STEP) { drag.current.accumulated += DRAG_PX_STEP; prev(); }
    }

    function onUp() {
      drag.current.active = false;
      setIsDragging(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   onUp);
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
  }, [prev, next]);

  // Groove positions — seamless infinite tile via shift-mod-pitch
  const grooveShift  = ((offset % GROOVE_PITCH) + GROOVE_PITCH) % GROOVE_PITCH;
  const grooveCount  = Math.ceil(STRIP_W / GROOVE_PITCH) + 4;
  const grooveOrigin = ARROW_PAD - GROOVE_PITCH * 2 + grooveShift;

  return (
    <svg
      width={SVG_W}
      height={STRIP_H}
      viewBox={`0 0 ${SVG_W} ${STRIP_H}`}
      onMouseDown={n > 1 ? onMouseDown : undefined}
      style={{
        cursor:         n > 1 ? (isDragging ? "grabbing" : "grab") : "default",
        userSelect:     "none",
        display:        "block",
        overflow:       "visible",
        filter:         "drop-shadow(0 8px 24px rgba(0,0,0,0.45)) drop-shadow(0 2px 5px rgba(0,0,0,0.35))",
        transform:      "rotateX(-28deg)",
        transformStyle: "preserve-3d",
      }}
    >
      <defs>
        {/* Disc face */}
        <linearGradient id="discGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#505050" />
          <stop offset="40%"  stopColor="#2e2e2e" />
          <stop offset="100%" stopColor="#1a1a1a" />
        </linearGradient>

        {/* Groove band body */}
        <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#d0d0d0" />
          <stop offset="6%"   stopColor="#808080" />
          <stop offset="22%"  stopColor="#303030" />
          <stop offset="55%"  stopColor="#181818" />
          <stop offset="100%" stopColor="#080808" />
        </linearGradient>

        {/* Metal grain */}
        <filter id="grain" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" seed="5" result="noise" />
          <feColorMatrix type="matrix"
            values="0 0 0 0 0.9  0 0 0 0 0.9  0 0 0 0 0.9  0 0 0 0.13 0"
            in="noise" result="grain" />
          <feBlend in="SourceGraphic" in2="grain" mode="screen" result="blended" />
          <feComposite in="blended" in2="SourceGraphic" operator="in" />
        </filter>

        {/* Edge fade */}
        <linearGradient id="edgeFade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="white" stopOpacity="0" />
          <stop offset="9%"   stopColor="white" stopOpacity="1" />
          <stop offset="91%"  stopColor="white" stopOpacity="1" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <mask id="edgeMask">
          <rect x={ARROW_PAD} y={0} width={STRIP_W} height={STRIP_H} fill="url(#edgeFade)" />
        </mask>
        <clipPath id="stripClip">
          <rect x={ARROW_PAD} y={0} width={STRIP_W} height={STRIP_H} />
        </clipPath>
      </defs>

      {/* ── Strip content ── */}
      <g clipPath="url(#stripClip)" mask="url(#edgeMask)">

        {/* Base */}
        <rect x={ARROW_PAD - GROOVE_PITCH} y={0}
          width={STRIP_W + GROOVE_PITCH * 2} height={STRIP_H} fill="#050505" />

        {/* Disc face */}
        <rect x={ARROW_PAD} y={0} width={STRIP_W} height={DISC_H}
          fill="url(#discGrad)" filter="url(#grain)" />
        <line x1={ARROW_PAD} y1={0.5} x2={ARROW_PAD + STRIP_W} y2={0.5}
          stroke="rgba(255,255,255,0.28)" strokeWidth={1} />
        {/* Step shadow between disc and band */}
        <line x1={ARROW_PAD} y1={DISC_H} x2={ARROW_PAD + STRIP_W} y2={DISC_H}
          stroke="rgba(0,0,0,0.95)" strokeWidth={2.5} />

        {/* Groove band */}
        <rect x={ARROW_PAD} y={DISC_H} width={STRIP_W} height={BODY_H}
          fill="url(#bodyGrad)" filter="url(#grain)" />

        {/* Band top specular */}
        <line x1={ARROW_PAD} y1={DISC_H + 0.6} x2={ARROW_PAD + STRIP_W} y2={DISC_H + 0.6}
          stroke="rgba(255,255,255,0.90)" strokeWidth={1.6} />
        <line x1={ARROW_PAD} y1={DISC_H + 3.5} x2={ARROW_PAD + STRIP_W} y2={DISC_H + 3.5}
          stroke="rgba(255,255,255,0.14)" strokeWidth={1} />

        {/* Vertical groove lines — scrolling */}
        {Array.from({ length: grooveCount }, (_, i) => {
          const x = grooveOrigin + i * GROOVE_PITCH;
          return (
            <g key={i}>
              {/* Shadow side */}
              <line
                x1={x + 0.8} y1={DISC_H + 4} x2={x + 0.8} y2={DISC_H + BODY_H - 4}
                stroke="rgba(0,0,0,0.75)" strokeWidth={1.2} />
              {/* Lit side */}
              <line
                x1={x} y1={DISC_H + 4} x2={x} y2={DISC_H + BODY_H - 4}
                stroke="rgba(255,255,255,0.38)" strokeWidth={0.8} />
            </g>
          );
        })}

        {/* Band bottom edge */}
        <line x1={ARROW_PAD} y1={DISC_H + BODY_H - 0.5} x2={ARROW_PAD + STRIP_W} y2={DISC_H + BODY_H - 0.5}
          stroke="rgba(0,0,0,0.80)" strokeWidth={1} />
      </g>

      {/* ── Hover label ── */}
      <g
        style={{
          opacity:    showHint && n > 1 ? 1 : 0,
          transition: "opacity 0.25s ease",
        }}
      >
        <text
          x={SVG_W / 2}
          y={-10}
          textAnchor="middle"
          fontFamily="var(--font-body, sans-serif)"
          fontSize="11"
          letterSpacing="2.5"
          fill="#4e4638"
          style={{ textTransform: "uppercase" }}
        >
          ← TURN DIAL →
        </text>
      </g>
    </svg>
  );
}
