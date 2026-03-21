"use client";

import { useState } from "react";
import Link from "next/link";
import { Upload, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

const materials = [
  { id: "pla",    label: "Premium PLA+",  note: "Matte finish · standard durability · widest colour range",  color: "#e8d5b7" },
  { id: "petg",   label: "PETG",          note: "Semi-gloss · food-safe · excellent heat resistance",         color: "#a8c4d4" },
  { id: "metal",  label: "Metal Fill",    note: "Bronze or copper infill · hand-polished finish",             color: "#c49a4a" },
  { id: "carbon", label: "Carbon Fibre",  note: "Industrial grade · high strength · matte dark finish",       color: "#2a2928" },
];

const steps = [
  { num: "01", title: "Submit Request",  body: "Fill in the form with your idea, dimensions, and material preference. Attach a reference image or STL file if you have one." },
  { num: "02", title: "We Quote",        body: "Our team reviews your request and sends a detailed quote within 24 hours, including estimated print time and final price." },
  { num: "03", title: "Approve & Pay",   body: "Approve the quote and pay a 50% deposit to begin production. The remainder is due before dispatch." },
  { num: "04", title: "Print & Ship",    body: "We print your piece with precision, run a quality check, then ship it to you within 3–7 business days." },
];

export default function CustomPrintsPage() {
  const [material, setMaterial] = useState("pla");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    toast.success("Request received! We'll be in touch within 24 hours.");
    setSubmitted(true);
  }

  return (
    <div className="pt-24 pb-24 min-h-screen bg-white">
      {/* Header */}
      <div className="max-w-[1920px] mx-auto px-8 pt-12 pb-10"
           style={{ borderBottom: "1px solid rgba(210,197,179,0.3)" }}>
        <p className="text-[0.6875rem] tracking-[0.2em] uppercase text-akruti-muted font-body mb-3">
          BESPOKE SERVICE
        </p>
        <h1 className="font-headline text-6xl md:text-8xl tracking-tighter text-akruti-dark leading-none uppercase">
          Custom Prints
        </h1>
        <p className="text-sm text-akruti-muted font-body mt-4 max-w-lg leading-relaxed">
          Have a specific idea in mind? We&apos;ll print it. Send us your file or describe your concept — we handle everything from modelling to dispatch.
        </p>
      </div>

      <div className="max-w-[1920px] mx-auto px-8 py-16 grid grid-cols-1 lg:grid-cols-2 gap-16">

        {/* Left — Process steps */}
        <div>
          <h2 className="font-headline text-2xl uppercase tracking-tight text-akruti-dark mb-10">
            How it works
          </h2>
          <div className="flex flex-col gap-10">
            {steps.map((s) => (
              <div key={s.num} className="flex gap-6">
                <span className="font-headline text-5xl text-akruti-gold/30 leading-none select-none shrink-0">
                  {s.num}
                </span>
                <div>
                  <h3 className="font-headline text-lg uppercase tracking-tight text-akruti-dark mb-1">
                    {s.title}
                  </h3>
                  <p className="text-sm text-akruti-muted font-body leading-relaxed">{s.body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Material swatches */}
          <div className="mt-14">
            <h2 className="font-headline text-2xl uppercase tracking-tight text-akruti-dark mb-6">
              Available Materials
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {materials.map((m) => (
                <div key={m.id}
                     className="p-4 flex gap-3 items-start"
                     style={{ border: "1px solid rgba(210,197,179,0.4)" }}>
                  <span className="w-5 h-5 rounded-full shrink-0 mt-0.5"
                        style={{ background: m.color, border: "1px solid rgba(0,0,0,0.08)" }} />
                  <div>
                    <p className="font-headline text-sm uppercase tracking-tight text-akruti-dark">{m.label}</p>
                    <p className="text-[0.65rem] text-akruti-muted font-body leading-relaxed mt-0.5">{m.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Form */}
        <div>
          {submitted ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-24 gap-6">
              <CheckCircle className="w-14 h-14 text-akruti-gold" />
              <h2 className="font-headline text-3xl uppercase tracking-tight text-akruti-dark">
                Request Received
              </h2>
              <p className="text-sm text-akruti-muted font-body max-w-sm leading-relaxed">
                We&apos;ll review your request and get back to you with a quote within 24 hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="font-headline text-sm uppercase tracking-widest text-akruti-primary border-b border-akruti-primary pb-px hover:text-akruti-gold hover:border-akruti-gold transition-colors"
              >
                Submit another request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <h2 className="font-headline text-2xl uppercase tracking-tight text-akruti-dark">
                Request a Quote
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.6875rem] tracking-[0.15em] uppercase text-akruti-muted font-body">
                    Name *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Your name"
                    className="bg-akruti-surface px-4 py-3 text-sm font-body text-akruti-dark placeholder-akruti-muted/50 outline-none focus:ring-1 focus:ring-akruti-gold/40"
                    style={{ border: "1px solid rgba(210,197,179,0.5)" }}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.6875rem] tracking-[0.15em] uppercase text-akruti-muted font-body">
                    Email *
                  </label>
                  <input
                    required
                    type="email"
                    placeholder="you@example.com"
                    className="bg-akruti-surface px-4 py-3 text-sm font-body text-akruti-dark placeholder-akruti-muted/50 outline-none focus:ring-1 focus:ring-akruti-gold/40"
                    style={{ border: "1px solid rgba(210,197,179,0.5)" }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[0.6875rem] tracking-[0.15em] uppercase text-akruti-muted font-body">
                  Describe your idea *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="What would you like printed? Include any details about size, purpose, or design inspiration."
                  className="bg-akruti-surface px-4 py-3 text-sm font-body text-akruti-dark placeholder-akruti-muted/50 outline-none focus:ring-1 focus:ring-akruti-gold/40 resize-none"
                  style={{ border: "1px solid rgba(210,197,179,0.5)" }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.6875rem] tracking-[0.15em] uppercase text-akruti-muted font-body">
                    Approx. Dimensions
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 10 × 5 × 3 cm"
                    className="bg-akruti-surface px-4 py-3 text-sm font-body text-akruti-dark placeholder-akruti-muted/50 outline-none focus:ring-1 focus:ring-akruti-gold/40"
                    style={{ border: "1px solid rgba(210,197,179,0.5)" }}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.6875rem] tracking-[0.15em] uppercase text-akruti-muted font-body">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min={1}
                    defaultValue={1}
                    className="bg-akruti-surface px-4 py-3 text-sm font-body text-akruti-dark outline-none focus:ring-1 focus:ring-akruti-gold/40"
                    style={{ border: "1px solid rgba(210,197,179,0.5)" }}
                  />
                </div>
              </div>

              {/* Material select */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.6875rem] tracking-[0.15em] uppercase text-akruti-muted font-body">
                  Preferred Material
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {materials.map((m) => (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => setMaterial(m.id)}
                      className={`px-4 py-2.5 text-left transition-all duration-200 ${
                        material === m.id
                          ? "bg-akruti-dark text-akruti-cream"
                          : "text-akruti-muted hover:text-akruti-dark"
                      }`}
                      style={{ border: `1px solid ${material === m.id ? "#1c1b1b" : "rgba(210,197,179,0.5)"}` }}
                    >
                      <span className="font-headline text-sm uppercase tracking-tight block">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* File upload */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.6875rem] tracking-[0.15em] uppercase text-akruti-muted font-body">
                  Reference Image or STL File
                </label>
                <label
                  className="flex items-center gap-3 px-4 py-4 cursor-pointer transition-colors hover:bg-akruti-surface/60"
                  style={{ border: "1px dashed rgba(210,197,179,0.7)" }}
                >
                  <Upload className="w-4 h-4 text-akruti-muted" />
                  <span className="text-sm font-body text-akruti-muted">
                    Click to upload — PNG, JPG, STL, OBJ (max 20 MB)
                  </span>
                  <input type="file" className="sr-only" accept=".png,.jpg,.jpeg,.stl,.obj" />
                </label>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[0.6875rem] tracking-[0.15em] uppercase text-akruti-muted font-body">
                  Additional Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Colour preferences, deadline, special requirements…"
                  className="bg-akruti-surface px-4 py-3 text-sm font-body text-akruti-dark placeholder-akruti-muted/50 outline-none focus:ring-1 focus:ring-akruti-gold/40 resize-none"
                  style={{ border: "1px solid rgba(210,197,179,0.5)" }}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-akruti-dark text-akruti-cream font-headline text-sm uppercase tracking-widest py-4 hover:bg-akruti-primary transition-colors duration-300 mt-2"
              >
                Submit Request
              </button>

              <p className="text-[0.65rem] text-akruti-muted/60 font-body text-center leading-relaxed">
                No payment required at this stage. We&apos;ll quote you first.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
