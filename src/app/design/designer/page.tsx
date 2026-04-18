"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function DesignerPage() {
  return (
    <div className="flex flex-col min-h-screen pt-[73px] bg-akruti-dark">
      <div
        className="flex items-center gap-4 px-6 py-3 shrink-0"
        style={{ borderBottom: "1px solid rgba(245,158,11,0.15)" }}
      >
        <Link
          href="/design"
          className="flex items-center gap-1.5 text-[0.6rem] tracking-[0.18em] uppercase font-body text-akruti-cream/40 hover:text-akruti-gold transition-colors"
        >
          <ChevronLeft className="w-3 h-3" />
          Design Tools
        </Link>
        <span className="text-akruti-gold/20 text-xs">|</span>
        <span className="text-[0.6rem] tracking-[0.18em] uppercase font-body text-akruti-gold/70">
          General Designer
        </span>
      </div>

      <iframe
        src="/tools/designer.html"
        className="flex-1 w-full border-0"
        style={{ minHeight: "calc(100vh - 73px - 41px)" }}
        title="Akruti Designer"
        allow="fullscreen"
      />
    </div>
  );
}
