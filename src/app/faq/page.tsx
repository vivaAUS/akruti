"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import Link from "next/link";

type FAQ = { q: string; a: string };

const sections: { title: string; items: FAQ[] }[] = [
  {
    title: "Ordering",
    items: [
      { q: "How long does it take to receive my order?",
        a: "Standard orders ship within 3–5 business days from payment confirmation. Custom print orders ship within 7–10 business days. You'll receive a tracking number by email on dispatch." },
      { q: "Do you ship internationally?",
        a: "Yes. We ship worldwide via Australia Post with tracking. International delivery typically takes 7–21 business days depending on the destination. Import duties are the buyer's responsibility." },
      { q: "Can I change or cancel my order?",
        a: "Cancellations are accepted within 12 hours of ordering, provided printing hasn't started. After that, we cannot cancel because the material is already in use. Email us immediately at hello@akruti.com.au." },
      { q: "What payment methods do you accept?",
        a: "We accept all major credit and debit cards (Visa, Mastercard, Amex) via Stripe. Apple Pay and Google Pay are supported at checkout. We don't accept bank transfers for standard orders." },
    ],
  },
  {
    title: "Materials & Quality",
    items: [
      { q: "What materials do you print with?",
        a: "We primarily use premium PLA+, PETG, and metal-fill (bronze or copper powder infused). Carbon fibre reinforced filament is available for structural parts. All materials are sourced from certified suppliers." },
      { q: "Are the prints food-safe?",
        a: "PETG is generally considered food-safe, but we don't recommend using any 3D printed item for direct food contact without post-processing (sanding + sealing). Layer lines can harbour bacteria. PLA+ is not food-safe." },
      { q: "How strong are FDM prints?",
        a: "Our PLA+ prints handle everyday use comfortably. For structural or high-stress applications, we recommend PETG or carbon fibre filament. We run drop tests on every product model before it enters the catalogue." },
      { q: "Will the colours look exactly as shown?",
        a: "We do our best to represent colours accurately, but filament batches can vary slightly between manufacturers. If exact colour matching is critical (e.g. for branding), contact us before ordering." },
    ],
  },
  {
    title: "Custom Prints",
    items: [
      { q: "Can you print from my own STL file?",
        a: "Yes. Submit it via the Custom Prints page along with your material preference and quantity. We'll review the file for printability and quote you within 24 hours. We accept STL, OBJ, and 3MF formats." },
      { q: "What if I don't have a 3D file — just an idea?",
        a: "Describe your idea on the Custom Prints form and attach a reference image or sketch. For simple shapes we can model it ourselves; for complex designs we'll refer you to one of our trusted CAD partners." },
      { q: "How is custom print pricing determined?",
        a: "Price is based on print time, material weight, post-processing required, and complexity. We provide an itemised quote before any payment is taken. A 50% deposit is required to start production." },
      { q: "Do you offer discounts for bulk custom orders?",
        a: "Yes — orders of 10+ identical units receive a 15% discount on print cost. Orders of 50+ units are quoted individually. Contact us to discuss your project." },
    ],
  },
  {
    title: "Returns & Warranty",
    items: [
      { q: "What is your return policy?",
        a: "We accept returns for defective or incorrectly printed items within 14 days of delivery. Because all items are printed to order, we don't accept change-of-mind returns. Provide a photo of the issue and we'll arrange a replacement or full refund." },
      { q: "My print arrived damaged — what do I do?",
        a: "Email hello@akruti.com.au within 48 hours of delivery with photos of the damage and the packaging. We'll send a replacement at no cost. Keep the original packaging in case Australia Post requires it for a claim." },
      { q: "Do your prints come with a warranty?",
        a: "We guarantee our prints against manufacturing defects for 30 days. Normal wear and tear is not covered. Misuse — dropping, exposure to high heat, or forcing articulated joints — voids the guarantee." },
    ],
  },
];

function FAQItem({ faq }: { faq: FAQ }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid rgba(210,197,179,0.3)" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-5 text-left gap-4"
      >
        <span className="font-headline text-base uppercase tracking-tight text-akruti-dark">{faq.q}</span>
        {open
          ? <Minus className="w-4 h-4 text-akruti-gold shrink-0" />
          : <Plus  className="w-4 h-4 text-akruti-muted shrink-0" />
        }
      </button>
      {open && (
        <p className="text-sm font-body text-akruti-muted leading-relaxed pb-5 max-w-2xl">
          {faq.a}
        </p>
      )}
    </div>
  );
}

export default function FAQPage() {
  return (
    <div className="pt-24 pb-24 min-h-screen bg-white">
      {/* Header */}
      <div className="max-w-[1920px] mx-auto px-8 pt-12 pb-10"
           style={{ borderBottom: "1px solid rgba(210,197,179,0.3)" }}>
        <p className="text-[0.6875rem] tracking-[0.2em] uppercase text-akruti-muted font-body mb-3">
          SUPPORT
        </p>
        <h1 className="font-headline text-6xl md:text-8xl tracking-tighter text-akruti-dark leading-none uppercase">
          FAQ
        </h1>
        <p className="text-sm text-akruti-muted font-body mt-4 max-w-md leading-relaxed">
          Answers to the most common questions about orders, materials, customs, and returns.
        </p>
      </div>

      {/* Sections */}
      <div className="max-w-3xl mx-auto px-8 py-16 flex flex-col gap-14">
        {sections.map((section) => (
          <div key={section.title}>
            <h2 className="font-headline text-2xl uppercase tracking-tighter text-akruti-dark mb-2">
              {section.title}
            </h2>
            <div style={{ borderTop: "1px solid rgba(210,197,179,0.4)" }}>
              {section.items.map((faq) => (
                <FAQItem key={faq.q} faq={faq} />
              ))}
            </div>
          </div>
        ))}

        {/* Still have questions */}
        <div className="text-center py-10 px-8 bg-akruti-cream-low" style={{ border: "1px solid rgba(210,197,179,0.3)" }}>
          <h3 className="font-headline text-2xl uppercase tracking-tighter text-akruti-dark mb-3">
            Still have questions?
          </h3>
          <p className="text-sm font-body text-akruti-muted mb-6 leading-relaxed">
            We&apos;re a small team and we read every message. Drop us a line.
          </p>
          <Link
            href="/contact"
            className="inline-block font-headline text-sm uppercase tracking-widest bg-akruti-dark text-akruti-cream px-10 py-3 hover:bg-akruti-primary transition-colors duration-300"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
