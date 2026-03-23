"use client";

import { useState, useRef, useEffect } from "react";
import { ShoppingCart, Plus, Minus, Star, ChevronLeft } from "lucide-react";
import toast from "react-hot-toast";
import { type Category } from "@/data/categories";
import { useCatalogStore } from "@/store/catalog";
import { type Product } from "@/lib/types";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/format";

// ─── Mosaic helpers ──────────────────────────────────────────────────────────

const CATEGORY_SPANS = ["5", "7", "7", "5"];

function getProductColSpans(total: number): string[] {
  if (total === 1) return ["12"];
  if (total === 2) return ["6", "6"];
  if (total === 3) return ["7", "5", "12"];
  return ["5", "7", "7", "5"];
}

const MATERIALS = [
  { label: "Matte Black", hex: "#1c1b1b" },
  { label: "Silk White",  hex: "#e0dcd8" },
  { label: "Indigo",      hex: "#4f46e5" },
  { label: "Terracotta",  hex: "#b45309" },
];

// ─── Per-product specs & reviews ─────────────────────────────────────────────

const SPECS: Record<string, Array<[string, string]>> = {
  "geometric-fidget-cube": [
    ["Dimensions", "45 × 45 × 45 mm"], ["Weight", "~62 g"],
    ["Layer height", "0.15 mm"],        ["Infill", "25% gyroid"],
    ["Print time", "~6 h"],             ["Material", "PLA+"],
  ],
  "infinity-flip-ring": [
    ["Ring diameter", "Ø 22 mm (adj.)"], ["Weight", "~8 g"],
    ["Layer height", "0.12 mm"],         ["Infill", "40% rectilinear"],
    ["Print time", "~3 h"],              ["Material", "PLA+"],
  ],
  "custom-name-keychain": [
    ["Dimensions", "60 × 18 × 4 mm"], ["Weight", "~5 g"],
    ["Characters", "Up to 12"],        ["Layer height", "0.15 mm"],
    ["Print time", "~45 min"],         ["Material", "PLA+"],
  ],
  "hex-charm-keychain": [
    ["Dimensions", "32 × 32 × 4 mm"], ["Weight", "~4 g"],
    ["Pattern", "Honeycomb cutout"],   ["Layer height", "0.15 mm"],
    ["Print time", "~30 min"],         ["Material", "PLA+"],
  ],
  "articulated-dragon": [
    ["Length", "~280 mm"],      ["Weight", "~185 g"],
    ["Segments", "38 jointed"], ["Layer height", "0.15 mm"],
    ["Print time", "~9 h"],     ["Material", "PLA+"],
  ],
  "miniature-astronaut": [
    ["Height", "75 mm (1:32 scale)"], ["Weight", "~45 g"],
    ["Detail height", "0.10 mm"],     ["Infill", "30% rectilinear"],
    ["Print time", "~5 h"],           ["Material", "PLA+"],
  ],
  "phone-stand": [
    ["Dimensions", "90 × 75 × 60 mm"],         ["Weight", "~48 g"],
    ["Compatibility", "50–90 mm wide phones"],  ["Layer height", "0.20 mm"],
    ["Print time", "~4 h"],                     ["Material", "PLA+"],
  ],
  "cable-clip-organiser": [
    ["Pack size", "6 clips"],          ["Clip dims", "28 × 20 × 14 mm each"],
    ["Total weight", "~36 g"],         ["Layer height", "0.20 mm"],
    ["Print time", "~2.5 h (set)"],    ["Material", "PLA+"],
  ],
};

const REVIEWS: Record<string, Array<{ name: string; rating: number; text: string }>> = {
  "geometric-fidget-cube": [
    { name: "Sophie M.", rating: 5, text: "The surface finish is incredible. This is in a completely different league from cheaper cubes." },
    { name: "James K.",  rating: 5, text: "Arrived in 4 days. The matte black finish is gorgeous — it's become my go-to focus tool." },
    { name: "Priya R.",  rating: 4, text: "Really satisfying. Heavier than expected but in a good way — feels genuinely premium." },
  ],
  "infinity-flip-ring": [
    { name: "Alex T.", rating: 5, text: "Wore it all day and couldn't stop flipping it. The single-piece print is astonishing." },
    { name: "Nina W.", rating: 5, text: "Perfectly smooth. Printed as one piece and it just works. Actual magic." },
    { name: "Chris B.", rating: 4, text: "Slightly loose but the flip action is hypnotic. Worth every cent." },
  ],
  "custom-name-keychain": [
    { name: "Emma S.", rating: 5, text: "Ordered for my whole family. Everyone loved their personalised ones. Great quality." },
    { name: "Tom H.",  rating: 5, text: "The indigo colour is stunning. Lightweight and the text is perfectly crisp." },
    { name: "Rachel G.", rating: 4, text: "Fast shipping and nice finish. Delivery took slightly longer than expected." },
  ],
  "hex-charm-keychain": [
    { name: "Liam K.", rating: 5, text: "Looks like it should cost 3× the price. The honeycomb pattern catches the light beautifully." },
    { name: "Zoe M.",  rating: 5, text: "Bought 5 for gifts. Everyone asked where they came from." },
    { name: "Ben T.",  rating: 4, text: "The terracotta colour is stunning. Perfect size — not too big, not too small." },
  ],
  "articulated-dragon": [
    { name: "Maya R.",   rating: 5, text: "Every segment moves smoothly and it holds poses. I've seen many flex dragons but this is on another level." },
    { name: "Daniel C.", rating: 5, text: "My son absolutely loves it. Printed as one piece. No glue, no assembly. Absolute magic." },
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

// ─── Constants ───────────────────────────────────────────────────────────────

const HDR = 72;
const BALL = 300;   // glass ball diameter px
const BHALF = 150;

type Screen = "categories" | "products" | "detail";
type Phase  = "idle" | "exit" | "spin" | "expand" | "split";

// ─── Glass Ball ───────────────────────────────────────────────────────────────
// Transparent sphere with image grid on its surface.
// `images` are the 2×2 thumbnails visible through the glass.
// `phase` controls which animation plays.
// `splitBalls` = true → show 3 smaller balls flying to panel positions.

function GlassBall({
  phase, images, splitBalls,
}: {
  phase: Phase;
  images: string[];
  splitBalls: boolean;
}) {

  const ballBase: React.CSSProperties = {
    position: "absolute",
    width: BALL, height: BALL,
    borderRadius: "50%",
    overflow: "hidden",
  };

  const glassShell: React.CSSProperties = {
    position: "absolute", inset: 0, zIndex: 10, pointerEvents: "none",
    borderRadius: "50%",
    border: "1.5px solid rgba(255,255,255,0.55)",
    // Specular highlight in upper-left
    background: [
      "radial-gradient(circle at 28% 22%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.15) 28%, transparent 55%)",
      "radial-gradient(circle at 70% 75%, rgba(255,255,255,0.12) 0%, transparent 40%)",
    ].join(", "),
    boxShadow: [
      "inset 0 0 40px rgba(255,255,255,0.08)",
      "inset -6px -6px 20px rgba(0,0,0,0.18)",
      "0 16px 60px rgba(0,0,0,0.3)",
      "0 0 0 1px rgba(255,255,255,0.12)",
    ].join(", "),
  };

  // 2 split glass balls for detail reveal
  if (splitBalls) {
    const targets = [
      { leftPct: "25%", delay: 0   },
      { leftPct: "75%", delay: 120 },
    ];
    const mini = BALL * 0.45;
    const mhalf = mini / 2;
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 100, pointerEvents: "none" }}>
        {targets.map((t, i) => (
          <div key={i} style={{
            position: "absolute",
            left: `calc(${t.leftPct} - ${mhalf}px)`,
            top: `calc(50% - ${mhalf}px)`,
            width: mini, height: mini,
            borderRadius: "50%", overflow: "hidden",
            animation: `ballFlyFade 0.5s cubic-bezier(0.4,0,1,1) ${t.delay}ms both`,
          }}>
            {images[i] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={images[i]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            )}
            <div style={{ ...glassShell, inset: 0, position: "absolute" }} />
          </div>
        ))}
      </div>
    );
  }

  // Ball only renders AFTER iris close finishes — not during exit
  if (phase === "idle" || phase === "exit") return null;

  // "spin" phase = appear (0.32s) then spin 360° (0.95s), chained via multi-animation
  // "expand" = ball grows outward and fades
  const anim =
    phase === "spin"   ? "ballAppear 0.32s cubic-bezier(0,0,0.2,1) both, ballSpinOnce 0.95s ease-in-out 0.32s both" :
    phase === "expand" ? "ballGrow 0.52s cubic-bezier(0.4,0,1,1) both"                                               :
    undefined;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, pointerEvents: "none" }}>
      <div style={{ ...ballBase, left: `calc(50% - ${BHALF}px)`, top: `calc(50% - ${BHALF}px)`, animation: anim }}>

        {/* 2×2 image grid — visible through the glass */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", width: "100%", height: "100%" }}>
          {[0, 1, 2, 3].map((i) => (
            images[i]
              // eslint-disable-next-line @next/next/no-img-element
              ? <img key={i} src={images[i]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <div key={i} style={{ background: "#1c1b1b" }} />
          ))}
        </div>

        {/* Glass overlay — specular + edge shadow */}
        <div style={glassShell} />
        {/* Edge vignette for sphere depth */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 11, pointerEvents: "none", borderRadius: "50%",
          background: "radial-gradient(circle at 50% 50%, transparent 45%, rgba(0,0,0,0.45) 100%)",
        }} />
      </div>
    </div>
  );
}

// ─── Root component ──────────────────────────────────────────────────────────

export default function CollectionExplorer() {
  const containerRef = useRef<HTMLDivElement>(null);

  const [screen, setScreen]             = useState<Screen>("categories");
  const [phase,  setPhase]              = useState<Phase>("idle");
  const [splitBalls, setSplitBalls]     = useState(false);
  const [panelRevealStep, setPanelRevealStep] = useState(3);

  // Images shown on the glass ball surface (before and after the flip)
  const [beforeBallImages, setBeforeBallImages] = useState<string[]>([]);
  const [afterBallImages,  setAfterBallImages]  = useState<string[]>([]);
  const [ballFlipped, setBallFlipped]           = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedProduct, setSelectedProduct]   = useState<Product | null>(null);
  const [clickedCell, setClickedCell]           = useState<string | null>(null);

  const [quantity, setQuantity]               = useState(1);
  const [activeTab, setActiveTab]             = useState<"description" | "reviews" | "technical">("description");
  const [activeImage, setActiveImage]         = useState(0);
  const [activeMaterial, setActiveMaterial]   = useState(0);

  const categories     = useCatalogStore((s) => s.categories);
  const allProducts    = useCatalogStore((s) => s.products);

  // Reset to categories view when HOME is clicked
  useEffect(() => {
    function onHomeNavigate() {
      setScreen("categories");
      setPhase("idle");
      setSelectedCategory(null);
      setSelectedProduct(null);
      setClickedCell(null);
      setSplitBalls(false);
      setPanelRevealStep(3);
    }
    window.addEventListener("home-navigate", onHomeNavigate);
    return () => window.removeEventListener("home-navigate", onHomeNavigate);
  }, []);

  const addItem        = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);

  const categoryProducts = selectedCategory
    ? allProducts.filter((p) => p.category.toLowerCase() === selectedCategory.id.toLowerCase())
    : [];

  // Images on ball surface (switches at spin midpoint)
  const ballImages = ballFlipped ? afterBallImages : beforeBallImages;

  function navigate(next: Screen, afterImgs: string[]) {
    containerRef.current?.scrollIntoView({ behavior: "instant", block: "start" });

    // Snapshot current screen images for the ball's "before" face
    const beforeImgs =
      screen === "categories" ? categories.slice(0, 4).map((c) => c.image) :
      screen === "products"   ? categoryProducts.slice(0, 4).map((p) => p.images[0]) :
      selectedProduct         ? selectedProduct.images.slice(0, 4) : [];

    setBeforeBallImages(beforeImgs);
    setAfterBallImages(afterImgs);
    setBallFlipped(false);

    // t=0 ── iris-close: screen closes like a camera shutter (0.42s)
    setPhase("exit");

    // t=440 ── iris done; ball mounts and plays appear(0.32s) + spin(0.95s)
    //          new screen content is swapped here (hidden behind closed iris)
    setTimeout(() => {
      setPhase("spin");
      setScreen(next);
      setClickedCell(null);
      if (next === "detail") setPanelRevealStep(0);
    }, 440);

    // t=440+320+475=1235 ── ball is at 180° (edge-on) → seamlessly flip images
    setTimeout(() => setBallFlipped(true), 1235);

    // t=440+320+950=1710 ── spin complete
    if (next === "detail") {
      // Split into 2 glass balls, each flying to a panel position
      setTimeout(() => { setPhase("split"); setSplitBalls(true); }, 1710);
      setTimeout(() => setPanelRevealStep(1), 1810);
      setTimeout(() => setPanelRevealStep(2), 1980);
      setTimeout(() => { setPhase("idle"); setSplitBalls(false); setBallFlipped(false); }, 2250);
    } else {
      // Ball grows outward; new screen iris-opens from centre
      setTimeout(() => setPhase("expand"), 1710);
      setTimeout(() => { setPhase("idle"); setBallFlipped(false); }, 2260);
    }
  }

  function onCategoryClick(cat: Category) {
    setClickedCell(cat.id);
    setSelectedCategory(cat);
    const prods = allProducts.filter((p) => p.category.toLowerCase() === cat.id.toLowerCase());
    const afterImgs = prods.slice(0, 4).map((p) => p.images[0]);
    setTimeout(() => navigate("products", afterImgs), 60);
  }

  function onProductClick(product: Product) {
    setClickedCell(product.slug);
    setSelectedProduct(product);
    setActiveImage(0); setQuantity(1); setActiveTab("description"); setActiveMaterial(0);
    const afterImgs = product.images.slice(0, 4);
    setTimeout(() => navigate("detail", afterImgs), 60);
  }

  function onRelatedProductClick(product: Product) {
    setSelectedProduct(product);
    setActiveImage(0); setQuantity(1); setActiveTab("description"); setActiveMaterial(0);
    setPanelRevealStep(0);
    setTimeout(() => setPanelRevealStep(1), 80);
    setTimeout(() => setPanelRevealStep(2), 210);
  }

  function onBack() {
    if (screen === "products") {
      const afterImgs = categories.slice(0, 4).map((c) => c.image);
      navigate("categories", afterImgs);
    } else if (screen === "detail") {
      const afterImgs = categoryProducts.slice(0, 4).map((p) => p.images[0]);
      navigate("products", afterImgs);
    }
  }

  function onAddToCart() {
    if (!selectedProduct) return;
    addItem(selectedProduct);
    if (quantity > 1) updateQuantity(selectedProduct.id, quantity);
    toast.success(`${quantity}× ${selectedProduct.name} added to cart`);
  }

  // Screen wrapper class: iris-close on exit, iris-open on expand, hidden during spin
  const screenClass =
    phase === "exit"   ? "screen-shrink" :
    phase === "expand" ? "screen-expand" : undefined;

  const screenStyle: React.CSSProperties = {
    height: "100dvh", overflow: "hidden",
    // Keep new screen hidden while ball is spinning (visible through glass ball is enough)
    ...(phase === "spin" ? { clipPath: "circle(0% at 50% 50%)" } : {}),
  };

  return (
    <div ref={containerRef} style={{ position: "relative", height: "100dvh", overflow: "hidden" }}>

      {/* ── Glass ball overlay ────────────────────────────────────────────── */}
      <GlassBall phase={phase} images={ballImages} splitBalls={splitBalls} />

      {/* ── Floating back button (hidden during transitions) ─────────────── */}
      {screen !== "categories" && phase === "idle" && (
        <FloatingBackButton onBack={onBack} />
      )}

      {/* ── Screen content ───────────────────────────────────────────────── */}
      <div className={screenClass} style={screenStyle}>
        {screen === "categories" && (
          <CategoriesScreen categories={categories} clickedCell={clickedCell} onCategoryClick={onCategoryClick} />
        )}
        {screen === "products" && selectedCategory && (
          <ProductsScreen
            category={selectedCategory}
            categoryProducts={categoryProducts}
            clickedCell={clickedCell}
            onProductClick={onProductClick}
          />
        )}
        {screen === "detail" && selectedProduct && selectedCategory && (
          <DetailScreen
            product={selectedProduct}
            category={selectedCategory}
            categoryProducts={categoryProducts}
            panelRevealStep={panelRevealStep}
            quantity={quantity}             setQuantity={setQuantity}
            activeTab={activeTab}           setActiveTab={setActiveTab}
            activeImage={activeImage}       setActiveImage={setActiveImage}
            activeMaterial={activeMaterial} setActiveMaterial={setActiveMaterial}
            onAddToCart={onAddToCart}
            onRelatedProductClick={onRelatedProductClick}
          />
        )}
      </div>
    </div>
  );
}

// ─── Floating Back Button ────────────────────────────────────────────────────

function FloatingBackButton({ onBack }: { onBack: () => void }) {
  const [hovered,  setHovered]  = useState(false);
  const [animated, setAnimated] = useState(true);

  return (
    <button
      onClick={onBack}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onAnimationEnd={() => setAnimated(false)}
      aria-label="Go back"
      style={{
        position: "fixed", left: 0, top: "50%", zIndex: 40,
        width: 48, height: 96,
        borderRadius: "0 48px 48px 0",
        background: hovered ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.14)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.25)", borderLeft: "none",
        boxShadow: hovered
          ? "6px 0 36px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.2)"
          : "4px 0 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.12)",
        transform: animated ? undefined : `translateY(-50%) translateX(${hovered ? "5px" : "0px"})`,
        transition: animated ? "none" : "background 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease",
        animation: animated ? "floatBackEnter 0.35s cubic-bezier(0,0,0.2,1) both" : "none",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", outline: "none",
      }}
    >
      <ChevronLeft style={{
        width: 20, height: 20, color: "rgba(28,27,27,0.60)", marginLeft: -4,
        transition: "transform 0.18s ease",
        transform: hovered ? "translateX(-2px)" : "translateX(0)",
      }} />
    </button>
  );
}

// ─── Categories Screen ───────────────────────────────────────────────────────

function CategoriesScreen({
  categories, clickedCell, onCategoryClick,
}: { categories: Category[]; clickedCell: string | null; onCategoryClick: (c: Category) => void }) {

  const mosaicH = `calc(100dvh - ${HDR}px - 112px - 24px)`;

  return (
    <div style={{ height: "100dvh", overflow: "hidden", display: "flex", flexDirection: "column", paddingTop: HDR }}>

      {/* Header strip */}
      <div style={{ height: 112, padding: "0 2rem", display: "flex", flexDirection: "column", justifyContent: "flex-end", paddingBottom: "1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <h2 className="font-headline text-5xl md:text-6xl tracking-tight leading-none text-akruti-dark">
              THE COLLECTION
            </h2>
            <p className="text-xs text-akruti-muted font-body mt-1">
              Every piece printed fresh to order — ships within 3–5 days.
            </p>
          </div>
          <span className="text-[0.625rem] tracking-[0.2em] uppercase text-akruti-dark/30 font-body">
            {categories.length} collections
          </span>
        </div>
      </div>

      {/* Mosaic */}
      <div style={{ padding: "0 2rem 24px", flex: 1 }}>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(12, 1fr)",
          gridAutoRows: "1fr", gap: 12, height: mosaicH,
        }}>
          {categories.map((cat, i) => (
            <CategoryCell
              key={cat.id} category={cat} index={i + 1} total={categories.length}
              colSpan={CATEGORY_SPANS[i] ?? "6"} staggerIndex={i}
              isClicked={clickedCell === cat.id}
              onClick={() => onCategoryClick(cat)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function CategoryCell({ category, index, total, colSpan, staggerIndex, isClicked, onClick }: {
  category: Category; index: number; total: number; colSpan: string; staggerIndex: number;
  isClicked: boolean; onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative overflow-hidden text-left focus:outline-none"
      style={{
        gridColumn: `span ${colSpan}`,
        transform: isClicked ? "scale(1.04)" : hovered ? "scale(1.015)" : "scale(1)",
        opacity: isClicked ? 0.4 : 1,
        transition: "transform 0.25s cubic-bezier(0.25,0.1,0.25,1), opacity 0.2s ease",
        zIndex: hovered || isClicked ? 10 : 1,
        animation: `cellEnter 0.45s cubic-bezier(0,0,0.2,1) ${staggerIndex * 70}ms both`,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={category.image} alt={category.name}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transform: hovered ? "scale(1.06)" : "scale(1)", transition: "transform 0.65s cubic-bezier(0.25,0.1,0.25,1)" }}
      />
      <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient}`}
        style={{ opacity: hovered ? 0.5 : 0.68, transition: "opacity 0.4s ease" }} />
      <div className="relative z-10 p-8 md:p-10 h-full flex flex-col justify-between">
        <span className="text-[0.5625rem] tracking-[0.3em] text-white/50 font-body">
          {String(index).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        <div>
          <h3 className="font-headline text-5xl md:text-6xl text-white tracking-tight leading-none mb-3">
            {category.name.toUpperCase()}
          </h3>
          <p className="text-white/70 text-sm font-body font-light mb-2 leading-snug">{category.tagline}</p>
          <p className="text-white/80 text-sm font-body leading-relaxed max-w-xs overflow-hidden"
            style={{ opacity: hovered ? 1 : 0, transform: hovered ? "translateY(0)" : "translateY(8px)",
              transition: "opacity 0.3s ease, transform 0.3s ease", maxHeight: hovered ? "80px" : "0" }}>
            {category.detail}
          </p>
        </div>
        <div className="flex items-center gap-2 font-body text-[0.625rem] tracking-[0.25em] uppercase text-white/60"
          style={{ opacity: hovered ? 1 : 0.28, transform: hovered ? "translateX(0)" : "translateX(-5px)",
            transition: "opacity 0.25s ease, transform 0.25s ease" }}>
          Explore Collection <span className="text-base">→</span>
        </div>
      </div>
    </button>
  );
}

// ─── Products Screen ─────────────────────────────────────────────────────────

function ProductsScreen({ category, categoryProducts, clickedCell, onProductClick }: {
  category: Category; categoryProducts: Product[];
  clickedCell: string | null; onProductClick: (p: Product) => void;
}) {
  const colSpans = getProductColSpans(categoryProducts.length);
  const titleH   = 108;
  const mosaicH  = `calc(100dvh - ${HDR}px - ${titleH}px - 16px)`;

  return (
    <div style={{ height: "100dvh", overflow: "hidden", display: "flex", flexDirection: "column", paddingTop: HDR }}>

      {/* Title strip */}
      <div style={{ height: titleH, padding: "0 2rem", display: "flex", flexDirection: "column", justifyContent: "flex-end", paddingBottom: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <h1 className="font-headline text-6xl md:text-7xl tracking-tight text-akruti-dark leading-none">
              {category.name.toUpperCase()}
            </h1>
            <p className="text-xs text-akruti-muted font-body mt-1 max-w-md leading-relaxed">{category.detail}</p>
          </div>
          <span className="text-[0.6875rem] tracking-[0.2em] uppercase text-akruti-muted/40 font-body">
            {categoryProducts.length} {categoryProducts.length === 1 ? "artifact" : "artifacts"}
          </span>
        </div>
      </div>

      {/* Product mosaic */}
      {categoryProducts.length === 0 ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p className="font-headline text-5xl text-akruti-dark/20">Coming Soon</p>
        </div>
      ) : (
        <div style={{ padding: "0 2rem 16px", flex: 1 }}>
          <div
            key={category.id}
            style={{
              display: "grid", gridTemplateColumns: "repeat(12, 1fr)",
              gridAutoRows: "1fr", gap: 12, height: mosaicH,
            }}
          >
            {categoryProducts.map((product, i) => {
              const isClicked = clickedCell === product.slug;
              return (
                <button
                  key={product.id}
                  onClick={() => onProductClick(product)}
                  className="group relative overflow-hidden text-left focus:outline-none"
                  style={{
                    gridColumn: `span ${colSpans[i] ?? "6"}`,
                    transform: isClicked ? "scale(1.04)" : "scale(1)",
                    opacity: isClicked ? 0.4 : 1,
                    transition: "transform 0.25s cubic-bezier(0.25,0.1,0.25,1), opacity 0.2s ease",
                    zIndex: isClicked ? 10 : 1,
                    animation: `cellEnter 0.38s cubic-bezier(0,0,0.2,1) ${i * 55}ms both`,
                  }}
                >
                  <div className="absolute inset-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={product.images[0]} alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent
                    opacity-0 group-hover:opacity-100 transition-opacity duration-400
                    flex flex-col justify-end p-8 md:p-10">
                    <span className="text-[0.5625rem] tracking-[0.25em] text-white/60 mb-2 font-body uppercase">
                      {String(i + 1).padStart(2, "0")} / {category.name.toUpperCase()}
                    </span>
                    <h3 className="font-headline text-3xl md:text-4xl text-white">{product.name.toUpperCase()}</h3>
                    <p className="text-white/80 font-headline text-xl mt-1">{formatPrice(product.price)}</p>
                    <p className="text-white/50 text-xs mt-2 font-body tracking-wider uppercase">Click to view →</p>
                  </div>
                  {!product.inStock && (
                    <div className="absolute top-5 right-5 z-10">
                      <span className="text-[0.6875rem] bg-akruti-dark text-akruti-cream px-4 py-1 tracking-[0.1em] font-body">SOLD OUT</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Detail Screen ───────────────────────────────────────────────────────────

function DetailScreen({
  product, category, categoryProducts,
  panelRevealStep,
  quantity, setQuantity, activeTab, setActiveTab,
  activeImage, setActiveImage, activeMaterial, setActiveMaterial,
  onAddToCart, onRelatedProductClick,
}: {
  product: Product; category: Category; categoryProducts: Product[];
  panelRevealStep: number;
  quantity: number; setQuantity: (q: number) => void;
  activeTab: "description" | "reviews" | "technical"; setActiveTab: (t: "description" | "reviews" | "technical") => void;
  activeImage: number; setActiveImage: (i: number) => void;
  activeMaterial: number; setActiveMaterial: (i: number) => void;
  onAddToCart: () => void;
  onRelatedProductClick: (p: Product) => void;
}) {
  const [hoverMinus, setHoverMinus] = useState(false);
  const [hoverPlus,  setHoverPlus]  = useState(false);
  const [hoverCart,  setHoverCart]  = useState(false);
  const [hoverBuy,   setHoverBuy]   = useState(false);

  const specs   = product.specs ?? SPECS[product.slug] ?? [];
  const reviews = REVIEWS[product.slug] ?? [];
  const related = categoryProducts.filter((p) => p.id !== product.id);

  const topH   = HDR + 36;
  const panelH = `calc(100dvh - ${topH}px)`;

  // Panel reveal helper: scaleX + opacity driven by panelRevealStep
  function panelReveal(step: number): React.CSSProperties {
    const visible = panelRevealStep >= step;
    return {
      transform: visible ? "scaleX(1)" : "scaleX(0)",
      opacity:   visible ? 1 : 0,
      transition: "transform 0.32s cubic-bezier(0.22,0,0.36,1), opacity 0.26s ease",
    };
  }

  return (
    <div style={{ height: "100dvh", overflow: "hidden", display: "flex", flexDirection: "column" }}>

      {/* Breadcrumb strip */}
      <div style={{ height: topH, paddingTop: HDR, paddingLeft: "2rem", display: "flex", alignItems: "flex-end", paddingBottom: "0.5rem" }}>
        <span className="text-[0.625rem] tracking-[0.25em] uppercase text-akruti-muted/40 font-body">
          {category.name} / {product.name}
        </span>
      </div>

      {/* ── 2 panels ── */}
      <div style={{ display: "flex", height: panelH, overflow: "hidden" }}>

        {/* LEFT 50% — Image gallery */}
        <div
          style={{
            width: "50%", display: "flex", flexDirection: "column",
            padding: "1rem 1.5rem 1rem 2rem", gap: 10, overflow: "hidden",
            borderRight: "1px solid rgba(210,197,179,0.15)",
            transformOrigin: "100% 50%",
            ...panelReveal(1),
          }}
        >
          <div key={`img-${product.id}-${activeImage}`}
            style={{ flex: 1, overflow: "hidden", position: "relative", animation: "cellEnter 0.28s ease both" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.images[activeImage]} alt={product.name}
              className="w-full h-full object-cover" />
          </div>
          <div style={{ height: 68, display: "flex", gap: 8, flexShrink: 0 }}>
            {product.images.map((img, i) => (
              <button key={`${product.id}-t${i}`} onClick={() => setActiveImage(i)}
                style={{ flex: 1, overflow: "hidden",
                  border: activeImage === i ? "2px solid #c49a4a" : "2px solid rgba(210,197,179,0.3)",
                  opacity: activeImage === i ? 1 : 0.5, transition: "all 0.18s ease" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT 50% — Info panel */}
        <div
          style={{
            width: "50%", display: "flex", flexDirection: "column", overflow: "hidden",
            borderLeft: "1px solid rgba(210,197,179,0.15)",
            transformOrigin: "0% 50%",
            ...panelReveal(2),
          }}
        >
          {/* Scrollable content */}
          <div key={`info-${product.id}-${activeImage}`}
            style={{ flex: 1, overflowY: "auto", padding: "1.5rem 2rem 0.5rem",
              animation: "cellEnter 0.32s ease both" }}>

            <span className="text-[0.6875rem] tracking-[0.2em] uppercase text-akruti-gold font-body">
              {product.category}
            </span>
            <h1 className="font-headline text-4xl tracking-tight leading-none mt-1 mb-3 text-akruti-dark">
              {product.name.toUpperCase()}
            </h1>
            <p className="font-body text-xs text-akruti-muted leading-relaxed mb-6">{product.description}</p>

            {/* Material swatches */}
            <div className="mb-6">
              <p className="text-[0.625rem] tracking-[0.15em] uppercase text-akruti-dark/40 font-body mb-2">
                Material — <span className="text-akruti-dark/70">{MATERIALS[activeMaterial].label}</span>
              </p>
              <div className="flex gap-2">
                {MATERIALS.map((m, i) => (
                  <button key={m.label} onClick={() => setActiveMaterial(i)} title={m.label}
                    style={{ width: 26, height: 26, borderRadius: 4, backgroundColor: m.hex,
                      border: activeMaterial === i ? "2px solid #c49a4a" : "2px solid rgba(210,197,179,0.35)",
                      boxShadow: activeMaterial === i ? "0 0 0 3px rgba(196,154,74,0.15)" : "none",
                      transform: activeMaterial === i ? "perspective(100px) rotateX(-8deg) scale(1.1)" : "none",
                      transition: "all 0.15s ease" }} />
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div style={{ borderBottom: "1px solid rgba(210,197,179,0.5)", marginBottom: "1rem" }}>
              <div style={{ display: "flex" }}>
                {(["description", "reviews", "technical"] as const).map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className="mr-5 pb-2.5 text-[0.625rem] tracking-[0.1em] uppercase font-body transition-colors"
                    style={{ color: activeTab === tab ? "#1c1b1b" : "rgba(78,70,56,0.4)",
                      borderBottom: activeTab === tab ? "1px solid #1c1b1b" : "1px solid transparent",
                      marginBottom: -1 }}>
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === "description" && (
              <div className="font-body text-xs text-akruti-muted leading-relaxed space-y-3">
                <p>{product.description}</p>
                <p>Printed on demand in premium PLA+. Layer height 0.15mm for exceptional surface quality. Infill 25% gyroid for optimal strength-to-weight ratio.</p>
                <ul className="space-y-1.5 mt-3">
                  {["Made to order — 3–5 business days", "PLA+ filament, food-safe", "Shipped in recycled packaging", "30-day satisfaction guarantee"].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-akruti-gold flex-shrink-0" />{f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r.name} className="border-b border-akruti-border pb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="flex">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} className="w-2.5 h-2.5 fill-akruti-gold text-akruti-gold" />
                        ))}
                      </span>
                      <span className="text-xs font-medium text-akruti-dark font-body">{r.name}</span>
                    </div>
                    <p className="text-xs text-akruti-muted font-body leading-relaxed">{r.text}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "technical" && (
              <div>
                {specs.map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2 border-b border-akruti-border/50 text-xs font-body">
                    <span className="text-akruti-muted/55 uppercase tracking-wider">{k}</span>
                    <span className="text-akruti-dark font-medium">{v}</span>
                  </div>
                ))}
              </div>
            )}

            {/* More from this collection */}
            {related.length > 0 && (
              <div className="mt-8 pt-6" style={{ borderTop: "1px solid rgba(210,197,179,0.5)" }}>
                <p className="text-[0.5625rem] tracking-[0.25em] uppercase text-akruti-muted/40 font-body mb-3">
                  More from {category.name}
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  {related.map((p, i) => (
                    <button key={p.id} onClick={() => onRelatedProductClick(p)}
                      className="group text-left focus:outline-none"
                      style={{ animation: `cellEnter 0.35s cubic-bezier(0,0,0.2,1) ${i * 70}ms both` }}>
                      <div style={{ aspectRatio: "1", overflow: "hidden", border: "1px solid rgba(210,197,179,0.25)" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover
                          group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <p className="text-[0.625rem] font-body text-akruti-dark truncate mt-1 group-hover:text-akruti-primary transition-colors">{p.name}</p>
                      <p className="text-[0.5625rem] font-body text-akruti-muted/55">{formatPrice(p.price)}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Glass cart strip ─────────────────────────────────────────── */}
          <div style={{ flexShrink: 0, padding: "0.875rem 1.5rem",
            background: "rgba(252,248,248,0.9)", backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderTop: "1px solid rgba(210,197,179,0.35)",
            boxShadow: "0 -6px 32px rgba(0,0,0,0.05)" }}>

            <div className="flex items-center justify-between mb-3">
              <span className="text-[0.5625rem] tracking-[0.2em] uppercase text-akruti-muted/50 font-body">Qty</span>
              <div className="flex items-center gap-2.5">
                <button onMouseEnter={() => setHoverMinus(true)} onMouseLeave={() => setHoverMinus(false)}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
                    border: "1px solid rgba(210,197,179,0.6)", background: hoverMinus ? "rgba(28,27,27,0.06)" : "transparent",
                    transform: hoverMinus ? "perspective(100px) rotateX(-10deg)" : "none", transition: "all 0.15s ease" }}>
                  <Minus style={{ width: 11, height: 11, color: "#1c1b1b" }} />
                </button>
                <span className="w-5 text-center font-body text-sm font-medium text-akruti-dark">{quantity}</span>
                <button onMouseEnter={() => setHoverPlus(true)} onMouseLeave={() => setHoverPlus(false)}
                  onClick={() => setQuantity(quantity + 1)}
                  style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
                    border: "1px solid rgba(210,197,179,0.6)", background: hoverPlus ? "rgba(28,27,27,0.06)" : "transparent",
                    transform: hoverPlus ? "perspective(100px) rotateX(-10deg)" : "none", transition: "all 0.15s ease" }}>
                  <Plus style={{ width: 11, height: 11, color: "#1c1b1b" }} />
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button onMouseEnter={() => setHoverCart(true)} onMouseLeave={() => setHoverCart(false)}
                onClick={onAddToCart} disabled={!product.inStock}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 font-body text-[0.625rem] tracking-[0.1em] uppercase disabled:opacity-40 transition-all duration-150"
                style={{ background: hoverCart && product.inStock ? "rgba(196,154,74,0.18)" : "rgba(196,154,74,0.08)",
                  border: "1px solid rgba(196,154,74,0.45)", color: "#7b580b",
                  transform: hoverCart && product.inStock ? "perspective(300px) rotateX(-4deg)" : "none" }}>
                <ShoppingCart style={{ width: 12, height: 12 }} />
                {product.inStock ? "Add to Cart" : "Sold Out"}
              </button>
              <button onMouseEnter={() => setHoverBuy(true)} onMouseLeave={() => setHoverBuy(false)}
                onClick={() => toast("Checkout coming soon!", { icon: "🔔" })} disabled={!product.inStock}
                className="flex-1 py-2.5 font-body text-[0.625rem] tracking-[0.1em] uppercase disabled:opacity-40 transition-all duration-150"
                style={{ background: hoverBuy && product.inStock ? "#2a2520" : "#1c1b1b", color: "#fcf8f8",
                  transform: hoverBuy && product.inStock ? "perspective(300px) rotateX(-4deg)" : "none" }}>
                Buy Now
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
