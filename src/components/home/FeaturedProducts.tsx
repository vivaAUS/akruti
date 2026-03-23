"use client";

import { useState, useRef, useCallback, useEffect, useLayoutEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCatalogStore } from "@/store/catalog";
import { formatPrice } from "@/lib/format";
import { type Product } from "@/lib/types";

const CARD_W = 228;
const CARD_H = 276;
const STEP   = 204; // px between card centres

// ─── Reviews data ─────────────────────────────────────────────────────────────

const REVIEWS: Record<string, Array<{ name: string; rating: number; text: string }>> = {
  "geometric-fidget-cube": [
    { name: "Sophie M.", rating: 5, text: "The surface finish is incredible. In a completely different league from cheaper cubes." },
    { name: "James K.",  rating: 5, text: "Arrived in 4 days. The matte black finish is gorgeous — my go-to focus tool." },
    { name: "Priya R.",  rating: 4, text: "Really satisfying. Heavier than expected but in a good way — feels genuinely premium." },
  ],
  "infinity-flip-ring": [
    { name: "Alex T.", rating: 5, text: "Wore it all day and couldn't stop flipping it. The single-piece print is astonishing." },
    { name: "Nina W.", rating: 5, text: "Perfectly smooth. Printed as one piece and it just works. Actual magic." },
    { name: "Chris B.", rating: 4, text: "Slightly loose but the flip action is hypnotic. Worth every cent." },
  ],
  "custom-name-keychain": [
    { name: "Emma S.",   rating: 5, text: "Ordered for my whole family. Everyone loved their personalised ones." },
    { name: "Tom H.",    rating: 5, text: "The indigo colour is stunning. Lightweight and the text is perfectly crisp." },
    { name: "Rachel G.", rating: 4, text: "Fast shipping and nice finish." },
  ],
  "hex-charm-keychain": [
    { name: "Liam K.", rating: 5, text: "Looks like it should cost 3× the price. The honeycomb pattern catches the light beautifully." },
    { name: "Zoe M.",  rating: 5, text: "Bought 5 for gifts. Everyone asked where they came from." },
    { name: "Ben T.",  rating: 4, text: "The terracotta colour is stunning. Perfect size." },
  ],
  "articulated-dragon": [
    { name: "Maya R.",   rating: 5, text: "Every segment moves smoothly and it holds poses. This is on another level." },
    { name: "Daniel C.", rating: 5, text: "Printed as one piece. No glue, no assembly. My son absolutely loves it." },
    { name: "Sara N.",   rating: 4, text: "Incredible craftsmanship. The detail on the scales is beautiful." },
  ],
  "miniature-astronaut": [
    { name: "Jake W.",  rating: 5, text: "The visor detail is unreal at this scale. A genuine collector piece." },
    { name: "Laura T.", rating: 5, text: "The 0.1mm layer height makes this look injection-moulded. Astounded." },
    { name: "Mark H.",  rating: 4, text: "Packaged brilliantly. The scale is perfect for a desk display." },
  ],
  "phone-stand": [
    { name: "Alice B.",  rating: 4, text: "Sturdy and fits my iPhone 15 Pro Max perfectly. The cable slot is a thoughtful touch." },
    { name: "George M.", rating: 3, text: "Works well but has been out of stock when I try to reorder." },
    { name: "Fiona K.",  rating: 5, text: "Minimalist design that fits any desk setup. Highly recommend." },
  ],
  "cable-clip-organiser": [
    { name: "Han S.",   rating: 5, text: "Finally tackled my cable nightmare. 6 clips, stick to the desk edge securely." },
    { name: "Clair M.", rating: 5, text: "Clean desk, happy life. Small but the quality is excellent." },
    { name: "Owen P.",  rating: 4, text: "Does exactly what it says. Would love a larger version for monitor cables." },
  ],
};

const PANEL_H = CARD_H + 60; // match carousel viewport height

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function FeaturedProducts() {
  const router     = useRouter();
  const sectionRef = useRef<HTMLElement>(null);
  const products   = useCatalogStore((s) => s.products);
  const all        = products.filter((p) => p.isFeatured);

  const n                                   = all.length;
  const [active,         setActive]         = useState(0);
  const [dialOffset,     setDialOffset]     = useState(0);
  const [subStep,        setSubStep]        = useState(0);
  const [isDialDragging, setIsDialDragging] = useState(false);
  const [carouselHovered, setCarouselHovered] = useState(false);
  const [revealed,       setReveal]         = useState(false);

  const reveal = useCallback(() => setReveal(true), []);

  const prev = useCallback(() => { setActive((i) => (i - 1 + n) % n); reveal(); }, [n, reveal]);
  const next = useCallback(() => { setActive((i) => (i + 1) % n);     reveal(); }, [n, reveal]);

  // Reveal panels when section scrolls 40% into view
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { reveal(); io.disconnect(); } },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reveal]);

  // Keyboard navigation
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

  const activeProduct = all[active];
  const reviews       = REVIEWS[activeProduct?.slug] ?? [];
  const avgRating     = reviews.length
    ? Math.round(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length)
    : 0;

  const panelTransition = "opacity 0.55s ease, transform 0.55s cubic-bezier(0.4,0,0.2,1)";

  return (
    <section ref={sectionRef} className="bg-[#faf9f8] py-8">

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

      {/* Three-panel layout */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", gap: 0 }}>

        {/* ── Left panel: description ── */}
        <div
          className="hidden lg:flex flex-col"
          style={{
            width: 220, flexShrink: 0,
            height: PANEL_H,
            padding: "24px 32px 24px 16px",
            borderRight: "1px solid rgba(0,0,0,0.07)",
            opacity:   revealed ? 1 : 0,
            transform: revealed ? "translateX(0)" : "translateX(-18px)",
            transition: panelTransition,
          }}
        >
          <p className="text-[0.6rem] tracking-[0.22em] uppercase font-body text-akruti-muted mb-5">
            About
          </p>
          {/* scrollable description area */}
          <div style={{ flex: 1, overflowY: "auto", paddingRight: 6 }} className="thin-scroll">
            <h3 className="font-headline text-base leading-snug text-akruti-dark mb-3">
              {activeProduct.name}
            </h3>
            <p className="text-[0.8125rem] font-body text-akruti-dark/60 leading-relaxed">
              {activeProduct.description}
            </p>
            {activeProduct.specs && activeProduct.specs.length > 0 && (
              <div className="mt-5 space-y-1.5">
                {activeProduct.specs.map(([label, val]) => (
                  <div key={label} className="flex justify-between gap-2">
                    <span className="text-[0.7rem] font-body text-akruti-muted">{label}</span>
                    <span className="text-[0.7rem] font-body text-akruti-dark/70 text-right">{val}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Center: carousel + dial ── */}
        <div style={{ flexShrink: 0, width: STRIP_W }}>
          <Carousel
            products={all}
            active={active}
            setActive={setActive}
            prev={prev}
            next={next}
            subStep={subStep}
            isDialDragging={isDialDragging}
            onSelect={(p) => router.push(`/product/${p.slug}`)}
            onHoverChange={setCarouselHovered}
          />
          <div style={{ display: "flex", justifyContent: "center", marginTop: 16, perspective: "700px" }}>
            <GlassDial
              n={n} active={active} prev={prev} next={next}
              offset={dialOffset} setOffset={setDialOffset}
              showHint={carouselHovered}
              onSubStep={setSubStep}
              onDragging={setIsDialDragging}
            />
          </div>
        </div>

        {/* ── Right panel: reviews + price ── */}
        <div
          className="hidden lg:flex flex-col"
          style={{
            width: 220, flexShrink: 0,
            height: PANEL_H,
            padding: "24px 16px 24px 32px",
            borderLeft: "1px solid rgba(0,0,0,0.07)",
            opacity:   revealed ? 1 : 0,
            transform: revealed ? "translateX(0)" : "translateX(18px)",
            transition: panelTransition,
            transitionDelay: "0.08s",
          }}
        >
          <p className="text-[0.6rem] tracking-[0.22em] uppercase font-body text-akruti-muted mb-5">
            Reviews
          </p>
          {/* scrollable reviews list */}
          <div style={{ flex: 1, overflowY: "auto", paddingRight: 6 }} className="thin-scroll">
            {reviews.map((r, i) => (
              <div key={i} style={{ marginBottom: 18, paddingBottom: 18, borderBottom: i < reviews.length - 1 ? "1px solid rgba(0,0,0,0.06)" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <span style={{ color: "#c49a4a", fontSize: 10, letterSpacing: 1 }}>
                    {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                  </span>
                </div>
                <p className="text-[0.75rem] font-body text-akruti-dark/65 leading-relaxed mb-1">
                  "{r.text}"
                </p>
                <p className="text-[0.65rem] font-body text-akruti-muted">— {r.name}</p>
              </div>
            ))}
          </div>
          {/* price pinned at bottom */}
          <div style={{ borderTop: "1px solid rgba(0,0,0,0.08)", paddingTop: 14, marginTop: 4 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <span style={{ color: "#c49a4a", fontSize: 10 }}>{"★".repeat(avgRating)}</span>
              <span className="font-headline text-xl text-akruti-dark">
                {formatPrice(activeProduct.price)}
              </span>
            </div>
            <p className="text-[0.65rem] font-body text-akruti-muted mt-1">
              {activeProduct.inStock ? "In stock — ships in 3–5 days" : "Currently out of stock"}
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}

// ─── Carousel ─────────────────────────────────────────────────────────────────

function Carousel({
  products, active, setActive, prev, next, subStep, isDialDragging, onSelect, onHoverChange,
}: {
  products: Product[];
  active: number;
  setActive: (i: number) => void;
  prev: () => void;
  next: () => void;
  subStep: number;
  isDialDragging: boolean;
  onSelect: (p: Product) => void;
  onHoverChange: (h: boolean) => void;
}) {
  const n = products.length;
  const [mouseZone, setMouseZone] = useState<"left" | "right" | "center" | null>(null);
  const swipe = useRef({ startX: 0, startY: 0, locked: false });

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - left) / width;
    setMouseZone(ratio < 0.35 ? "left" : ratio > 0.65 ? "right" : "center");
  }

  function onWrapperClick() {
    if (mouseZone === "left")  prev();
    if (mouseZone === "right") next();
  }

  function onTouchStart(e: React.TouchEvent) {
    swipe.current = { startX: e.touches[0].clientX, startY: e.touches[0].clientY, locked: false };
  }

  function onTouchEnd(e: React.TouchEvent) {
    const dx = e.changedTouches[0].clientX - swipe.current.startX;
    const dy = e.changedTouches[0].clientY - swipe.current.startY;
    if (Math.abs(dx) < Math.abs(dy) * 1.5 || Math.abs(dx) < 40) return; // vertical scroll wins
    if (dx < 0) next(); else prev();
  }

  const cursor =
    mouseZone === "left"  ? "w-resize" :
    mouseZone === "right" ? "e-resize" : "default";

  return (
    <>
      <style>{`
        @keyframes cardNudge {
          0%   { transform: translate(-50%,-50%) scale(0.96) translateY(5px); }
          55%  { transform: translate(-50%,-50%) scale(1.02) translateY(-2px); }
          100% { transform: translate(-50%,-50%) scale(1) translateY(0); }
        }
        @keyframes arrowBounceLeft {
          0%,100% { transform: translateX(0); }
          50%     { transform: translateX(-4px); }
        }
        @keyframes arrowBounceRight {
          0%,100% { transform: translateX(0); }
          50%     { transform: translateX(4px); }
        }
        .thin-scroll { scrollbar-width: thin; scrollbar-color: rgba(0,0,0,0.15) transparent; }
        .thin-scroll::-webkit-scrollbar { width: 3px; }
        .thin-scroll::-webkit-scrollbar-track { background: transparent; }
        .thin-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 99px; }
      `}</style>

      <div
        style={{
          position: "relative", height: CARD_H + 60, cursor,
          maxWidth: STRIP_W, margin: "0 auto", overflow: "hidden",
          perspective: "900px", perspectiveOrigin: "50% 50%",
        }}
        onMouseMove={onMouseMove}
        onMouseEnter={() => onHoverChange(true)}
        onMouseLeave={() => { setMouseZone(null); onHoverChange(false); }}
        onClick={onWrapperClick}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="select-none"
      >
        {products.map((p, i) => {
          let offset = i - active;
          if (offset >  n / 2) offset -= n;
          if (offset < -n / 2) offset += n;

          const absOff   = Math.abs(offset);
          const isActive = offset === 0;

          // Cylindrical arc — R sized so adjacent cards peek with a small gap
          const fo       = offset - subStep;
          const angleDeg = fo * 42;
          const θ        = (angleDeg * Math.PI) / 180;
          const R        = 360;
          const cx       = R * Math.sin(θ);
          const cz       = R * (Math.cos(θ) - 1);

          return (
            <CardSlot
              key={p.id}
              isActive={isActive}
              isDialDragging={isDialDragging}
              style={{
                position:  "absolute",
                left:      "50%",
                top:       "50%",
                width:     CARD_W,
                height:    CARD_H,
                transform: `translate(-50%, -50%) translate3d(${cx}px, 0, ${cz}px) rotateY(${angleDeg}deg)`,
                opacity:    isActive ? 1 : absOff === 1 ? 0.55 : 0.12,
                filter:    `blur(${isActive ? 0 : absOff === 1 ? 1.5 : 4}px)`,
                zIndex:    20 - absOff * 5,
                transition: isDialDragging
                  ? "opacity 0.1s ease, filter 0.1s ease"
                  : "transform 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.5s ease, filter 0.5s ease",
                pointerEvents: isActive ? "auto" : "none",
              }}
            >
              <ProductCard
                product={p}
                isActive={isActive}
                onOpen={(e) => { e.stopPropagation(); onSelect(p); }}
              />
            </CardSlot>
          );
        })}

        {/* Edge fade */}
        <div style={{
          position: "absolute", inset: "0 auto 0 0", width: 72, pointerEvents: "none", zIndex: 25,
          background: "linear-gradient(to right, #faf9f8 30%, transparent)",
        }} />
        <div style={{
          position: "absolute", inset: "0 0 0 auto", width: 72, pointerEvents: "none", zIndex: 25,
          background: "linear-gradient(to left, #faf9f8 30%, transparent)",
        }} />

        <NavHint side="left"  visible={mouseZone === "left"  && n > 1} />
        <NavHint side="right" visible={mouseZone === "right" && n > 1} />
      </div>
    </>
  );
}

// ─── Card slot — plays page-flip animation when card becomes active ────────────

function CardSlot({
  isActive, isDialDragging, style, children,
}: {
  isActive: boolean;
  isDialDragging: boolean;
  style: React.CSSProperties;
  children: React.ReactNode;
}) {
  const [animating, setAnimating] = useState(false);
  const prevIsActive = useRef(isActive);

  useLayoutEffect(() => {
    if (isActive && !prevIsActive.current && !isDialDragging) {
      setAnimating(true);
    }
    prevIsActive.current = isActive;
  }, [isActive, isDialDragging]);

  return (
    <div
      style={{
        ...style,
        transform:  animating ? undefined : style.transform,
        transition: animating ? undefined : style.transition as string,
        animation:  animating ? "cardNudge 0.45s cubic-bezier(0.34,1.56,0.64,1) both" : undefined,
      }}
      onAnimationEnd={() => setAnimating(false)}
    >
      {children}
    </div>
  );
}

// ─── Nav hint ─────────────────────────────────────────────────────────────────

function NavHint({ side, visible }: { side: "left" | "right"; visible: boolean }) {
  const slide = side === "left" ? "-10px" : "10px";
  return (
    <div style={{
      position: "absolute", top: "50%", [side]: 20,
      transform: visible
        ? "translateY(-50%) translateX(0)"
        : `translateY(-50%) translateX(${slide})`,
      opacity: visible ? 1 : 0,
      transition: "opacity 0.22s ease, transform 0.22s cubic-bezier(0.34,1.56,0.64,1)",
      pointerEvents: "none", zIndex: 30,
      width: 44, height: 44,
      borderRadius: "50%",
      background: "rgba(28,27,27,0.60)",
      backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 2px 12px rgba(0,0,0,0.22)",
    }}>
      <span style={{
        color: "#fff",
        fontSize: "22px",
        lineHeight: 1,
        display: "block",
        animation: visible
          ? `${side === "left" ? "arrowBounceLeft" : "arrowBounceRight"} 0.9s ease-in-out infinite`
          : "none",
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

// ─── Charcoal bar dial ─────────────────────────────────────────────────────────

const STRIP_W      = 420;
const RIDGE_H      = 16;    // thin top strip
const GAP_H        = 5;     // transparent gap between ridge and slot band
const DISC_H       = RIDGE_H + GAP_H; // y-offset where slot band starts
const SLOT_W       = 5;
const SLOT_GAP     = 4;
const SLOT_PITCH   = SLOT_W + SLOT_GAP;
const BAND_H       = 24;
const SLOT_H       = 18;
const SLOT_INSET_Y = 2.5;
const SLOT_R       = 1;
const STRIP_H      = DISC_H + BAND_H;
const ARROW_PAD    = 60;
const SVG_W        = STRIP_W + ARROW_PAD * 2;
const DRAG_PX_STEP = SLOT_PITCH * 2;

function GlassDial({
  n, prev, next, offset, setOffset, showHint, onSubStep, onDragging,
}: {
  n: number;
  active: number;
  prev: () => void;
  next: () => void;
  offset: number;
  setOffset: (fn: (o: number) => number) => void;
  showHint: boolean;
  onSubStep: (f: number) => void;
  onDragging: (d: boolean) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isDialHovered, setIsDialHovered] = useState(false);
  const drag = useRef({ active: false, lastX: 0, accumulated: 0 });

  function startDrag(startX: number) {
    drag.current = { active: true, lastX: startX, accumulated: 0 };
    setIsDragging(true);
    onDragging(true);
  }

  function moveDrag(clientX: number) {
    if (!drag.current.active) return;
    const delta = clientX - drag.current.lastX;
    drag.current.lastX        = clientX;
    drag.current.accumulated += delta;
    setOffset((o) => o + delta);
    while (drag.current.accumulated >=  DRAG_PX_STEP) { drag.current.accumulated -= DRAG_PX_STEP; next(); }
    while (drag.current.accumulated <= -DRAG_PX_STEP) { drag.current.accumulated += DRAG_PX_STEP; prev(); }
    onSubStep(drag.current.accumulated / DRAG_PX_STEP);
  }

  function endDrag() {
    drag.current.active = false;
    setIsDragging(false);
    onDragging(false);
    onSubStep(0);
  }

  const onMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    e.preventDefault();
    startDrag(e.clientX);

    function onMove(ev: MouseEvent) { moveDrag(ev.clientX); }
    function onUp() {
      endDrag();
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prev, next, onSubStep, onDragging]);

  const onTouchStart = useCallback((e: React.TouchEvent<SVGSVGElement>) => {
    e.preventDefault();
    startDrag(e.touches[0].clientX);

    function onMove(ev: TouchEvent) { moveDrag(ev.touches[0].clientX); }
    function onEnd() {
      endDrag();
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend",  onEnd);
    }
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend",  onEnd);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prev, next, onSubStep, onDragging]);

  // Seamless slot tiling
  const slotShift  = ((offset % SLOT_PITCH) + SLOT_PITCH) % SLOT_PITCH;
  const slotCount  = Math.ceil(STRIP_W / SLOT_PITCH) + 6;
  const slotOrigin = ARROW_PAD - SLOT_PITCH * 3 + slotShift;

  return (
    <svg
      width={SVG_W}
      height={STRIP_H + 28}          /* extra height for shadow beneath */
      viewBox={`0 0 ${SVG_W} ${STRIP_H + 28}`}
      onMouseDown={n > 1 ? onMouseDown   : undefined}
      onTouchStart={n > 1 ? onTouchStart : undefined}
      onMouseEnter={() => setIsDialHovered(true)}
      onMouseLeave={() => setIsDialHovered(false)}
      style={{
        cursor:         n > 1 ? (isDragging ? "grabbing" : "grab") : "default",
        userSelect:     "none",
        display:        "block",
        overflow:       "visible",
        transform:      "rotateX(-28deg)",
        transformStyle: "preserve-3d",
      }}
    >
      <defs>
        {/* ── Top ridge — dark metallic ── */}
        <linearGradient id="ridgeGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#3a3a3a" />
          <stop offset="40%"  stopColor="#2a2a2a" />
          <stop offset="100%" stopColor="#1a1a1a" />
        </linearGradient>

        {/* Fine matte grain */}
        <filter id="matte" x="-2%" y="-2%" width="104%" height="104%">
          <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="4" seed="3" result="n" />
          <feColorMatrix type="matrix"
            values="0 0 0 0 0.8  0 0 0 0 0.8  0 0 0 0 0.8  0 0 0 0.09 0"
            in="n" result="g" />
          <feBlend in="SourceGraphic" in2="g" mode="screen" result="b" />
          <feComposite in="b" in2="SourceGraphic" operator="in" />
        </filter>

        {/* ── Slot-band charcoal fill ── */}
        <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#383838" />
          <stop offset="100%" stopColor="#232323" />
        </linearGradient>

        {/* Soft diffused light from above on the whole bar */}
        <linearGradient id="topLight" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="rgba(255,255,255,0)" />
          <stop offset="50%"  stopColor="rgba(255,255,255,0.06)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>

        {/* Horizontal edge fade (both disc + band) */}
        <linearGradient id="edgeFade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="white" stopOpacity="0" />
          <stop offset="11%"  stopColor="white" stopOpacity="1" />
          <stop offset="89%"  stopColor="white" stopOpacity="1" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <mask id="edgeMask">
          <rect x={ARROW_PAD} y={0} width={STRIP_W} height={STRIP_H} fill="url(#edgeFade)" />
        </mask>
        <clipPath id="barClip">
          <rect x={ARROW_PAD} y={0} width={STRIP_W} height={STRIP_H} />
        </clipPath>

        {/* Shadow ellipse beneath bar */}
        <radialGradient id="shadowGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="rgba(0,0,0,0.30)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>

        {/* Background white vignette (wide, fades to page bg) */}
        <radialGradient id="vignette" cx="50%" cy="40%" r="55%">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.95)" />
          <stop offset="55%"  stopColor="rgba(255,255,255,0.60)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>

      {/* ── White vignette background ── */}
      <ellipse
        cx={SVG_W / 2} cy={STRIP_H * 0.45}
        rx={SVG_W * 0.62} ry={STRIP_H * 1.4}
        fill="url(#vignette)"
      />

      {/* ── Bar body ── */}
      <g clipPath="url(#barClip)" mask="url(#edgeMask)">

        {/* Slot band background — charcoal */}
        <rect x={ARROW_PAD} y={DISC_H} width={STRIP_W} height={BAND_H}
          fill="url(#bandGrad)" />

        {/* Recessed slots — scrolling */}
        {Array.from({ length: slotCount }, (_, i) => {
          const sx = slotOrigin + i * SLOT_PITCH - SLOT_W / 2;
          const sy = DISC_H + SLOT_INSET_Y;
          return (
            <g key={i}>
              {/* Deep recess */}
              <rect x={sx} y={sy} width={SLOT_W} height={SLOT_H} rx={SLOT_R}
                fill="#0a0a0a" />
              {/* Top shadow lip (recessed depth illusion) */}
              <rect x={sx} y={sy} width={SLOT_W} height={2} rx={SLOT_R}
                fill="rgba(0,0,0,0.80)" />
              {/* Bottom reflected light (very faint) */}
              <rect x={sx + 1} y={sy + SLOT_H - 1.5} width={SLOT_W - 2} height={1}
                fill="rgba(255,255,255,0.08)" />
            </g>
          );
        })}

        {/* ── Top ridge strip ── */}
        <rect x={ARROW_PAD} y={0} width={STRIP_W} height={RIDGE_H}
          fill="url(#ridgeGrad)" filter="url(#matte)" />

        {/* Top edge specular — bright metallic catch light */}
        <line x1={ARROW_PAD} y1={0.5} x2={ARROW_PAD + STRIP_W} y2={0.5}
          stroke="rgba(255,255,255,0.45)" strokeWidth={1.5} />

        {/* Bottom edge of ridge */}
        <line x1={ARROW_PAD} y1={RIDGE_H} x2={ARROW_PAD + STRIP_W} y2={RIDGE_H}
          stroke="rgba(0,0,0,0.65)" strokeWidth={1} />

        {/* Centre soft overhead light on ridge only */}
        <rect x={ARROW_PAD} y={0} width={STRIP_W} height={RIDGE_H}
          fill="url(#topLight)" />

        {/* Band top seam */}
        <line x1={ARROW_PAD} y1={DISC_H} x2={ARROW_PAD + STRIP_W} y2={DISC_H}
          stroke="rgba(0,0,0,0.85)" strokeWidth={1.5} />

        {/* Bottom edge of bar */}
        <line x1={ARROW_PAD} y1={STRIP_H - 0.5} x2={ARROW_PAD + STRIP_W} y2={STRIP_H - 0.5}
          stroke="rgba(0,0,0,0.70)" strokeWidth={1} />
      </g>

      {/* ── Cast shadow on surface beneath ── */}
      <ellipse
        cx={SVG_W / 2} cy={STRIP_H + 14}
        rx={STRIP_W * 0.46} ry={10}
        fill="url(#shadowGrad)"
        opacity={0.7}
      />

      {/* ── Hover label ── */}
      <g style={{ opacity: (showHint || isDialHovered) && n > 1 ? 1 : 0, transition: "opacity 0.25s ease" }}>
        <text
          x={SVG_W / 2} y={-10}
          textAnchor="middle"
          fontFamily="var(--font-body, sans-serif)"
          fontSize="11" letterSpacing="2.5"
          fill="#4e4638"
          style={{ textTransform: "uppercase" }}
        >
          ← TURN DIAL →
        </text>
      </g>
    </svg>
  );
}
