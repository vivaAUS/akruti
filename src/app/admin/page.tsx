"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Plus, Pencil, Trash2, X, ChevronLeft,
  Package, LayoutGrid, RotateCcw, Check,
  Upload, Link2, Loader2, ArrowUp, ArrowDown,
} from "lucide-react";
import toast from "react-hot-toast";
import { useCatalogStore } from "@/store/catalog";
import { type Category } from "@/data/categories";
import { type Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const GRADIENTS = [
  { label: "Indigo → Purple",  value: "from-indigo-500 to-purple-700" },
  { label: "Amber → Orange",   value: "from-amber-400 to-orange-600"  },
  { label: "Emerald → Teal",   value: "from-emerald-500 to-teal-700"  },
  { label: "Sky → Blue",       value: "from-sky-400 to-blue-700"      },
  { label: "Rose → Red",       value: "from-rose-500 to-red-700"      },
  { label: "Violet → Fuchsia", value: "from-violet-500 to-fuchsia-700"},
  { label: "Cyan → Emerald",   value: "from-cyan-400 to-emerald-600"  },
  { label: "Slate → Gray",     value: "from-slate-400 to-gray-700"    },
];

// ─── Shared style tokens ──────────────────────────────────────────────────────

const inp =
  "w-full border border-[#d2c5b3] px-3 py-2.5 text-sm font-body text-[#1c1b1b] " +
  "outline-none focus:border-[#c49a4a] focus:ring-1 focus:ring-[#c49a4a]/20 " +
  "transition-colors bg-white placeholder:text-[#4e4638]/40";
const lbl =
  "block text-[0.625rem] tracking-[0.15em] uppercase text-[#4e4638] font-body mb-1.5";

// ─── Image list — supports file upload AND URL paste ─────────────────────────

function ImageRow({
  url, index, onUrlChange, onRemove,
}: {
  url: string; index: number;
  onUrlChange: (val: string) => void;
  onRemove: () => void;
}) {
  const [mode,       setMode]       = useState<"url" | "upload">("url");
  const [uploading,  setUploading]  = useState(false);
  const [dragOver,   setDragOver]   = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    if (!file.type.startsWith("image/")) {
      return alert("Please select an image file (JPG, PNG, WebP, GIF).");
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res  = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      onUrlChange(data.url);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = "";           // reset so same file can be re-picked
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  return (
    <div className="flex flex-col gap-1.5">
      {/* Row: thumbnail | mode toggle | input/dropzone | remove */}
      <div className="flex items-start gap-2">

        {/* Preview thumbnail */}
        <div style={{
          width: 56, height: 56, flexShrink: 0,
          background: "#f0edec", overflow: "hidden", border: "1px solid #d2c5b3",
          position: "relative",
        }}>
          {uploading ? (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#f0edec" }}>
              <Loader2 size={18} className="animate-spin text-[#c49a4a]" />
            </div>
          ) : url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          ) : null}
        </div>

        <div className="flex-1 flex flex-col gap-1">
          {/* Mode toggle tabs */}
          <div className="flex" style={{ border: "1px solid #d2c5b3", width: "fit-content" }}>
            <button
              type="button"
              onClick={() => setMode("upload")}
              className="flex items-center gap-1 px-2.5 py-1 text-[0.55rem] tracking-[0.1em] uppercase font-body transition-colors"
              style={{
                background: mode === "upload" ? "#1c1b1b" : "transparent",
                color: mode === "upload" ? "#fcf8f8" : "#4e4638",
                borderRight: "1px solid #d2c5b3",
              }}
            >
              <Upload size={9} /> Upload
            </button>
            <button
              type="button"
              onClick={() => setMode("url")}
              className="flex items-center gap-1 px-2.5 py-1 text-[0.55rem] tracking-[0.1em] uppercase font-body transition-colors"
              style={{
                background: mode === "url" ? "#1c1b1b" : "transparent",
                color: mode === "url" ? "#fcf8f8" : "#4e4638",
              }}
            >
              <Link2 size={9} /> URL
            </button>
          </div>

          {/* Upload dropzone */}
          {mode === "upload" && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => !uploading && fileRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2.5 cursor-pointer transition-all duration-150"
              style={{
                border: `1.5px dashed ${dragOver ? "#c49a4a" : "#d2c5b3"}`,
                background: dragOver ? "rgba(196,154,74,0.05)" : "#faf9f8",
              }}
            >
              {uploading ? (
                <>
                  <Loader2 size={13} className="animate-spin text-[#c49a4a]" />
                  <span className="text-xs font-body text-[#4e4638]/60">Uploading…</span>
                </>
              ) : (
                <>
                  <Upload size={13} className="text-[#4e4638]/40" />
                  <span className="text-xs font-body text-[#4e4638]/50">
                    {url ? "Replace image — drop or click" : `Drop image ${index + 1} here, or click to browse`}
                  </span>
                </>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                className="sr-only"
                onChange={onFileChange}
              />
            </div>
          )}

          {/* URL input */}
          {mode === "url" && (
            <input
              type="text"
              value={url}
              onChange={(e) => onUrlChange(e.target.value)}
              placeholder={`Image ${index + 1} URL — https://...`}
              className={inp + " text-xs"}
            />
          )}

          {/* Show saved URL below upload zone so user can see/copy it */}
          {mode === "upload" && url && (
            <p className="text-[0.55rem] font-mono text-[#4e4638]/40 truncate leading-none px-0.5"
               title={url}>
              {url}
            </p>
          )}
        </div>

        {/* Remove */}
        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 text-red-400 hover:text-red-600 transition-colors flex-shrink-0 mt-5"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

function ImageList({
  images, onChange,
}: { images: string[]; onChange: (imgs: string[]) => void }) {
  const update = (i: number, val: string) => {
    const n = [...images]; n[i] = val; onChange(n);
  };
  return (
    <div className="space-y-3">
      {images.map((url, i) => (
        <ImageRow
          key={i}
          url={url}
          index={i}
          onUrlChange={(val) => update(i, val)}
          onRemove={() => onChange(images.filter((_, j) => j !== i))}
        />
      ))}
      <button
        type="button"
        onClick={() => onChange([...images, ""])}
        className="flex items-center gap-1.5 text-[0.6875rem] tracking-[0.1em] uppercase font-body text-[#c49a4a] hover:text-[#7b580b] transition-colors mt-1"
      >
        <Plus size={12} /> Add Image
      </button>
    </div>
  );
}

// ─── Category Form ────────────────────────────────────────────────────────────

const blankCat = (): Category => ({
  id: "", name: "", tagline: "", detail: "", gradient: GRADIENTS[0].value, image: "",
});

function CategoryForm({
  initial, onSave, onCancel,
}: { initial?: Category; onSave: (c: Category) => void; onCancel: () => void }) {
  const [f, setF] = useState<Category>(initial ?? blankCat());
  const [catUploading, setCatUploading] = useState(false);
  const editing = !!initial;

  const set = (k: keyof Category, v: string) =>
    setF((prev) => ({
      ...prev, [k]: v,
      ...(k === "name" && !editing ? { id: toSlug(v) } : {}),
    }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!f.name.trim()) return toast.error("Name is required");
    if (!f.id.trim())   return toast.error("ID is required");
    onSave(f);
  }

  return (
    <form onSubmit={submit} className="space-y-5 max-w-xl">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={lbl}>Display Name *</label>
          <input value={f.name} onChange={(e) => set("name", e.target.value)}
            className={inp} placeholder="e.g. Planters" required />
        </div>
        <div>
          <label className={lbl}>URL ID (auto)</label>
          <input value={f.id} onChange={(e) => set("id", e.target.value)}
            className={inp + " bg-[#f6f3f2]"} placeholder="e.g. planters" />
          <p className="text-[0.5625rem] text-[#4e4638]/50 font-body mt-1">Used in URLs — lowercase, no spaces</p>
        </div>
      </div>

      <div>
        <label className={lbl}>Tagline *</label>
        <input value={f.tagline} onChange={(e) => set("tagline", e.target.value)}
          className={inp} placeholder="One-line description shown on category card" required />
      </div>

      <div>
        <label className={lbl}>Detail (hover reveal)</label>
        <textarea value={f.detail} onChange={(e) => set("detail", e.target.value)}
          rows={3} className={inp + " resize-none"} placeholder="Longer paragraph shown on hover..." />
      </div>

      <div>
        <label className={lbl}>Card Gradient</label>
        <select value={f.gradient} onChange={(e) => set("gradient", e.target.value)}
          className={inp + " cursor-pointer"}>
          {GRADIENTS.map((g) => (
            <option key={g.value} value={g.value}>{g.label}</option>
          ))}
        </select>
        {/* Live gradient preview */}
        <div className={`h-6 mt-2 rounded-sm bg-gradient-to-br ${f.gradient}`} />
      </div>

      <div>
        <label className={lbl}>Cover Image (1200 × 800 recommended)</label>
        <div className="flex gap-3 items-start">
          {/* Preview */}
          <div style={{
            width: 140, height: 80, flexShrink: 0,
            background: "#f0edec", overflow: "hidden", border: "1px solid #d2c5b3", position: "relative",
          }}>
            {catUploading && (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Loader2 size={20} className="animate-spin text-[#c49a4a]" />
              </div>
            )}
            {f.image && !catUploading && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={f.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            )}
          </div>
          <div className="flex-1 flex flex-col gap-1.5">
            {/* Upload button */}
            <label
              className="flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors"
              style={{ border: "1.5px dashed #d2c5b3", background: "#faf9f8" }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={async (e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (!file) return;
                setCatUploading(true);
                try {
                  const fd = new FormData(); fd.append("file", file);
                  const res = await fetch("/api/upload", { method: "POST", body: fd });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.error);
                  set("image", data.url);
                } catch (err) { alert((err as Error).message); }
                finally { setCatUploading(false); }
              }}
            >
              <Upload size={13} className="text-[#4e4638]/40 flex-shrink-0" />
              <span className="text-xs font-body text-[#4e4638]/50">Drop or click to upload</span>
              <input type="file" accept="image/*" className="sr-only" onChange={async (e) => {
                const file = e.target.files?.[0]; if (!file) return;
                setCatUploading(true);
                try {
                  const fd = new FormData(); fd.append("file", file);
                  const res = await fetch("/api/upload", { method: "POST", body: fd });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.error);
                  set("image", data.url);
                } catch (err) { alert((err as Error).message); }
                finally { setCatUploading(false); e.target.value = ""; }
              }} />
            </label>
            {/* URL fallback */}
            <input value={f.image} onChange={(e) => set("image", e.target.value)}
              className={inp} placeholder="…or paste an image URL" />
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2 border-t border-[#d2c5b3]">
        <button type="submit"
          className="px-6 py-2.5 text-[0.625rem] tracking-[0.15em] uppercase font-body bg-[#1c1b1b] text-[#fcf8f8] hover:bg-[#2a2520] transition-colors">
          {editing ? "Save Changes" : "Create Category"}
        </button>
        <button type="button" onClick={onCancel}
          className="px-6 py-2.5 text-[0.625rem] tracking-[0.15em] uppercase font-body border border-[#d2c5b3] text-[#4e4638] hover:border-[#1c1b1b] hover:text-[#1c1b1b] transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}

// ─── Spec row list ────────────────────────────────────────────────────────────

function SpecList({
  specs, onChange,
}: { specs: Array<[string, string]>; onChange: (s: Array<[string, string]>) => void }) {
  const update = (i: number, col: 0 | 1, val: string) => {
    const n = specs.map((row, j) => j === i ? ([col === 0 ? val : row[0], col === 1 ? val : row[1]] as [string, string]) : row);
    onChange(n);
  };
  return (
    <div className="space-y-2">
      {specs.map((row, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type="text" value={row[0]}
            onChange={(e) => update(i, 0, e.target.value)}
            placeholder="Label (e.g. Weight)"
            className={inp + " flex-1 text-xs"}
          />
          <input
            type="text" value={row[1]}
            onChange={(e) => update(i, 1, e.target.value)}
            placeholder="Value (e.g. ~62 g)"
            className={inp + " flex-1 text-xs"}
          />
          <button type="button" onClick={() => onChange(specs.filter((_, j) => j !== i))}
            className="p-1.5 text-red-400 hover:text-red-600 transition-colors flex-shrink-0">
            <X size={14} />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...specs, ["", ""]])}
        className="flex items-center gap-1.5 text-[0.6875rem] tracking-[0.1em] uppercase font-body text-[#c49a4a] hover:text-[#7b580b] transition-colors mt-1">
        <Plus size={12} /> Add Spec Row
      </button>
    </div>
  );
}

// ─── Product Form ─────────────────────────────────────────────────────────────

const blankProduct = (firstCatName: string): Product => ({
  id: Date.now().toString(),
  name: "", slug: "", description: "",
  price: 0, images: ["", "", ""],
  category: firstCatName,
  inStock: true,
  isNew: false,
  isFeatured: false,
  specs: [],
});

function ProductForm({
  initial, categories, onSave, onCancel,
}: {
  initial?: Product; categories: Category[];
  onSave: (p: Product) => void; onCancel: () => void;
}) {
  const [f, setF] = useState<Product>(
    initial ?? blankProduct(categories[0]?.name ?? "")
  );
  const [priceStr, setPriceStr] = useState(
    initial ? (initial.price / 100).toFixed(2) : ""
  );
  const editing = !!initial;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const set = (k: keyof Product, v: any) =>
    setF((prev) => ({
      ...prev, [k]: v,
      ...(k === "name" && !editing ? { slug: toSlug(v as string) } : {}),
    }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!f.name.trim()) return toast.error("Name is required");
    const price = parseFloat(priceStr);
    if (!priceStr || isNaN(price) || price <= 0) return toast.error("Enter a valid price");
    const images = f.images.filter((u) => u.trim());
    if (!images.length) return toast.error("At least one image URL is required");
    onSave({ ...f, price: Math.round(price * 100), images });
  }

  return (
    <form onSubmit={submit} className="space-y-5 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={lbl}>Product Name *</label>
          <input value={f.name} onChange={(e) => set("name", e.target.value)}
            className={inp} placeholder="e.g. Geometric Fidget Cube" required />
        </div>
        <div>
          <label className={lbl}>Slug (auto)</label>
          <input value={f.slug} onChange={(e) => set("slug", e.target.value)}
            className={inp + " bg-[#f6f3f2]"} placeholder="e.g. geometric-fidget-cube" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={lbl}>Category *</label>
          <select value={f.category} onChange={(e) => set("category", e.target.value)}
            className={inp + " cursor-pointer"} required>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={lbl}>Price (AUD) *</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-body text-[#4e4638]">$</span>
            <input type="number" step="0.01" min="0.01"
              value={priceStr} onChange={(e) => setPriceStr(e.target.value)}
              className={inp + " pl-7"} placeholder="15.00" required />
          </div>
        </div>
      </div>

      <div>
        <label className={lbl}>Description *</label>
        <textarea value={f.description} onChange={(e) => set("description", e.target.value)}
          rows={4} className={inp + " resize-none"}
          placeholder="Describe the product — materials, features, use case..." required />
      </div>

      {/* Flags row: In Stock · New · Featured */}
      <div className="flex flex-wrap gap-6">
        {(
          [
            { key: "inStock",    label: "In Stock"  },
            { key: "isNew",      label: "New"       },
            { key: "isFeatured", label: "Featured"  },
          ] as const
        ).map(({ key, label }) => (
          <label key={key} className="flex items-center gap-3 cursor-pointer w-fit">
            <div onClick={() => set(key, !f[key])}
              style={{
                width: 22, height: 22, flexShrink: 0,
                border: f[key] ? "none" : "1.5px solid #d2c5b3",
                background: f[key] ? "#1c1b1b" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
              }}>
              {f[key] && <Check size={13} color="#fcf8f8" strokeWidth={3} />}
            </div>
            <span className="text-[0.6875rem] tracking-[0.1em] uppercase font-body text-[#4e4638]">
              {label}
            </span>
          </label>
        ))}
      </div>

      {/* Multi-image section */}
      <div>
        <label className={lbl}>Product Images *</label>
        <p className="text-[0.5625rem] font-body text-[#4e4638]/55 mb-3 leading-relaxed">
          Paste URLs from any image host (800 × 800 px recommended).
          First image is the mosaic thumbnail. Add up to 3+ images for the gallery.
        </p>
        <ImageList images={f.images} onChange={(imgs) => set("images", imgs)} />
      </div>

      {/* Technical specs */}
      <div>
        <label className={lbl}>Technical Specs</label>
        <p className="text-[0.5625rem] font-body text-[#4e4638]/55 mb-3 leading-relaxed">
          Shown in the "Technical" tab on the product page. Each row is a label + value pair.
        </p>
        <SpecList specs={f.specs ?? []} onChange={(s) => set("specs", s)} />
      </div>

      <div className="flex gap-3 pt-2 border-t border-[#d2c5b3]">
        <button type="submit"
          className="px-6 py-2.5 text-[0.625rem] tracking-[0.15em] uppercase font-body bg-[#1c1b1b] text-[#fcf8f8] hover:bg-[#2a2520] transition-colors">
          {editing ? "Save Changes" : "Add Product"}
        </button>
        <button type="button" onClick={onCancel}
          className="px-6 py-2.5 text-[0.625rem] tracking-[0.15em] uppercase font-body border border-[#d2c5b3] text-[#4e4638] hover:border-[#1c1b1b] hover:text-[#1c1b1b] transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

type Section = "categories" | "products";
type Mode = "list" | "form";

export default function AdminPage() {
  const [mounted, setMounted] = useState(false);
  const [section, setSection] = useState<Section>("categories");
  const [mode, setMode] = useState<Mode>("list");
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [catFilter, setCatFilter] = useState("all");

  const {
    categories, products,
    upsertCategory, removeCategory, moveCategory,
    upsertProduct, removeProduct,
    reset,
  } = useCatalogStore();

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "#f6f3f2", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p className="font-body text-sm text-[#4e4638]">Loading…</p>
      </div>
    );
  }

  // ── handlers ────────────────────────────────────────────────────────────────

  function saveCat(cat: Category) {
    upsertCategory(cat);
    toast.success(`"${cat.name}" saved`);
    setMode("list"); setEditCat(null);
  }

  function saveProduct(p: Product) {
    upsertProduct(p);
    toast.success(`"${p.name}" saved`);
    setMode("list"); setEditProduct(null);
  }

  function deleteCat(cat: Category) {
    if (!confirm(`Delete "${cat.name}"? Products in this category will also be removed.`)) return;
    removeCategory(cat.id);
    toast.success(`"${cat.name}" deleted`);
  }

  function deleteProduct(p: Product) {
    if (!confirm(`Delete "${p.name}"?`)) return;
    removeProduct(p.id);
    toast.success(`"${p.name}" deleted`);
  }

  function handleReset() {
    if (!confirm("Reset everything to factory defaults? This cannot be undone.")) return;
    reset();
    setMode("list"); setEditCat(null); setEditProduct(null);
    toast.success("Reset to defaults");
  }

  function goList() { setMode("list"); setEditCat(null); setEditProduct(null); }

  // ── helpers ──────────────────────────────────────────────────────────────────

  const productCount = (catId: string) =>
    products.filter((p) => p.category.toLowerCase() === catId).length;

  const visibleProducts =
    catFilter === "all"
      ? products
      : products.filter((p) => p.category.toLowerCase() === catFilter);

  // ── sidebar nav item ─────────────────────────────────────────────────────────
  function NavItem({
    s, icon: Icon, label,
  }: { s: Section; icon: React.ComponentType<{ size?: number }>; label: string }) {
    const active = section === s;
    return (
      <button
        onClick={() => { setSection(s); setMode("list"); setEditCat(null); setEditProduct(null); }}
        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
        style={{
          background: active ? "rgba(196,154,74,0.1)" : "transparent",
          color: active ? "#c49a4a" : "rgba(252,248,248,0.5)",
          borderLeft: active ? "2px solid #c49a4a" : "2px solid transparent",
        }}
      >
        <Icon size={15} />
        <span className="text-[0.6875rem] tracking-[0.12em] uppercase font-body">{label}</span>
        <span className="ml-auto text-[0.5625rem] font-body opacity-60">
          {s === "categories" ? categories.length : products.length}
        </span>
      </button>
    );
  }

  // ── title ────────────────────────────────────────────────────────────────────
  const pageTitle =
    section === "categories"
      ? mode === "form" ? (editCat ? `Edit — ${editCat.name}` : "New Category") : "Categories"
      : mode === "form" ? (editProduct ? `Edit — ${editProduct.name}` : "New Product") : "Products";

  return (
    <div style={{ display: "flex", height: "100%", minHeight: "100dvh" }}>

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside style={{
        width: 228, background: "#1c1b1b",
        display: "flex", flexDirection: "column", flexShrink: 0,
        position: "sticky", top: 0, height: "100dvh",
      }}>
        {/* Brand */}
        <div style={{ padding: "1.5rem 1.25rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="font-headline text-2xl text-[#fcf8f8] tracking-tight leading-none">Akruti</p>
          <p className="text-[0.5rem] tracking-[0.22em] uppercase font-body text-[#c49a4a] mt-1">Admin Panel</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-2">
          <NavItem s="categories" icon={LayoutGrid} label="Categories" />
          <NavItem s="products"   icon={Package}    label="Products" />
        </nav>

        {/* Footer */}
        <div style={{ padding: "1rem 1.25rem", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: 10 }}>
          <button onClick={handleReset}
            className="flex items-center gap-2 text-[0.5rem] tracking-[0.15em] uppercase font-body text-red-400/50 hover:text-red-400 transition-colors">
            <RotateCcw size={10} /> Reset to Defaults
          </button>
          <Link href="/"
            className="text-[0.5rem] tracking-[0.15em] uppercase font-body text-[rgba(252,248,248,0.25)] hover:text-[rgba(252,248,248,0.65)] transition-colors">
            ← Back to Store
          </Link>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "100dvh" }}>

        {/* Top bar */}
        <header style={{
          height: 60, padding: "0 2rem",
          background: "#fff", borderBottom: "1px solid #d2c5b3",
          display: "flex", alignItems: "center", gap: 16, flexShrink: 0,
          position: "sticky", top: 0, zIndex: 10,
        }}>
          {mode === "form" && (
            <button onClick={goList}
              className="flex items-center gap-1 text-[0.625rem] tracking-[0.1em] uppercase font-body text-[#4e4638] hover:text-[#1c1b1b] transition-colors">
              <ChevronLeft size={14} /> Back
            </button>
          )}
          <h1 className="font-headline text-3xl tracking-tight text-[#1c1b1b] leading-none">
            {pageTitle}
          </h1>
          {mode === "list" && (
            <button
              onClick={() => { setMode("form"); setEditCat(null); setEditProduct(null); }}
              className="ml-auto flex items-center gap-2 px-5 py-2 text-[0.625rem] tracking-[0.15em] uppercase font-body bg-[#1c1b1b] text-[#fcf8f8] hover:bg-[#2a2520] transition-colors">
              <Plus size={12} />
              {section === "categories" ? "Add Category" : "Add Product"}
            </button>
          )}
        </header>

        {/* Content area */}
        <main style={{ flex: 1, padding: "2rem", overflowY: "auto" }}>

          {/* ── CATEGORIES LIST ── */}
          {section === "categories" && mode === "list" && (
            <div>
              {categories.length === 0 && (
                <p className="font-body text-sm text-[#4e4638]/50 italic">No categories yet — add one above.</p>
              )}
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-5">
                {categories.map((cat) => (
                  <div key={cat.id} style={{ background: "#fff", border: "1px solid #d2c5b3", overflow: "hidden" }}>
                    {/* Hero image + gradient */}
                    <div style={{ height: 110, position: "relative", overflow: "hidden", background: "#f0edec" }}>
                      {cat.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={cat.image} alt=""
                          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      )}
                      <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient}`}
                        style={{ opacity: 0.65 }} />
                      <div className="absolute inset-0 p-4 flex flex-col justify-end">
                        <p className="font-headline text-2xl text-white tracking-tight leading-none">
                          {cat.name.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    {/* Info row */}
                    <div style={{ padding: "0.875rem 1rem" }}>
                      <p className="text-xs font-body text-[#4e4638] truncate">{cat.tagline}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[0.5rem] font-mono text-[#4e4638]/40">/{cat.id}</span>
                        <span className="text-[0.5rem] font-body text-[#4e4638]/40">·</span>
                        <span className="text-[0.5rem] font-body text-[#4e4638]/40">
                          {productCount(cat.id)} product{productCount(cat.id) !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-3">
                        <button
                          onClick={() => { setEditCat(cat); setMode("form"); }}
                          className="flex items-center gap-1.5 text-[0.5625rem] tracking-[0.1em] uppercase font-body text-[#4e4638] hover:text-[#1c1b1b] transition-colors">
                          <Pencil size={11} /> Edit
                        </button>
                        {/* Reorder */}
                        <div className="flex items-center gap-1 ml-auto">
                          <button
                            onClick={() => moveCategory(cat.id, "up")}
                            title="Move up"
                            className="p-0.5 text-[#4e4638]/50 hover:text-[#1c1b1b] transition-colors disabled:opacity-20"
                            disabled={categories.indexOf(cat) === 0}>
                            <ArrowUp size={13} />
                          </button>
                          <button
                            onClick={() => moveCategory(cat.id, "down")}
                            title="Move down"
                            className="p-0.5 text-[#4e4638]/50 hover:text-[#1c1b1b] transition-colors disabled:opacity-20"
                            disabled={categories.indexOf(cat) === categories.length - 1}>
                            <ArrowDown size={13} />
                          </button>
                        </div>
                        <button onClick={() => deleteCat(cat)}
                          className="flex items-center gap-1.5 text-[0.5625rem] tracking-[0.1em] uppercase font-body text-red-400 hover:text-red-600 transition-colors">
                          <Trash2 size={11} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── CATEGORY FORM ── */}
          {section === "categories" && mode === "form" && (
            <CategoryForm
              initial={editCat ?? undefined}
              onSave={saveCat}
              onCancel={goList}
            />
          )}

          {/* ── PRODUCTS LIST ── */}
          {section === "products" && mode === "list" && (
            <div>
              {/* Category filter bar */}
              <div className="flex flex-wrap gap-2 mb-5">
                {[{ id: "all", name: "All" }, ...categories].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCatFilter(c.id)}
                    className="px-3 py-1.5 text-[0.5625rem] tracking-[0.1em] uppercase font-body transition-colors"
                    style={{
                      background: catFilter === c.id ? "#1c1b1b" : "#fff",
                      color:      catFilter === c.id ? "#fcf8f8" : "#4e4638",
                      border:     "1px solid",
                      borderColor: catFilter === c.id ? "#1c1b1b" : "#d2c5b3",
                    }}>
                    {c.name}
                  </button>
                ))}
              </div>

              {visibleProducts.length === 0 && (
                <p className="font-body text-sm text-[#4e4638]/50 italic">No products yet.</p>
              )}

              <div style={{ border: "1px solid #d2c5b3", background: "#fff", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f6f3f2", borderBottom: "1px solid #d2c5b3" }}>
                      {["Product", "Category", "Price", "Stock", "Images", ""].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-[0.5625rem] tracking-[0.15em] uppercase font-body text-[#4e4638]">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visibleProducts.map((p, i) => (
                      <tr key={p.id}
                        style={{ borderBottom: i < visibleProducts.length - 1 ? "1px solid #f0edec" : "none" }}>
                        {/* Name + thumbnail */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div style={{
                              width: 44, height: 44, flexShrink: 0,
                              background: "#f0edec", overflow: "hidden", border: "1px solid #e8e0d6",
                            }}>
                              {p.images[0] && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={p.images[0]} alt=""
                                  style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-body font-medium text-[#1c1b1b]">{p.name}</p>
                              <p className="text-[0.5rem] font-mono text-[#4e4638]/40">{p.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[0.6875rem] tracking-[0.08em] uppercase font-body text-[#4e4638]">
                            {p.category}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-headline text-base text-[#1c1b1b]">
                            {formatPrice(p.price)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={
                            "px-2 py-0.5 text-[0.5625rem] tracking-[0.08em] uppercase font-body " +
                            (p.inStock ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600")
                          }>
                            {p.inStock ? "In Stock" : "Sold Out"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex -space-x-1">
                            {p.images.slice(0, 3).map((img, idx) => (
                              <div key={idx} style={{
                                width: 24, height: 24, border: "1.5px solid #fff",
                                background: "#f0edec", overflow: "hidden", borderRadius: 2,
                              }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              </div>
                            ))}
                            {p.images.length > 3 && (
                              <div style={{
                                width: 24, height: 24, border: "1.5px solid #fff",
                                background: "#1c1b1b", display: "flex", alignItems: "center", justifyContent: "center",
                              }}>
                                <span className="text-[0.4rem] font-body text-white">+{p.images.length - 3}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-4 justify-end">
                            <button onClick={() => { setEditProduct(p); setMode("form"); }}
                              className="flex items-center gap-1 text-[0.5625rem] tracking-[0.1em] uppercase font-body text-[#4e4638] hover:text-[#1c1b1b] transition-colors">
                              <Pencil size={11} /> Edit
                            </button>
                            <button onClick={() => deleteProduct(p)}
                              className="flex items-center gap-1 text-[0.5625rem] tracking-[0.1em] uppercase font-body text-red-400 hover:text-red-600 transition-colors">
                              <Trash2 size={11} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── PRODUCT FORM ── */}
          {section === "products" && mode === "form" && (
            <ProductForm
              initial={editProduct ?? undefined}
              categories={categories}
              onSave={saveProduct}
              onCancel={goList}
            />
          )}

        </main>
      </div>
    </div>
  );
}
