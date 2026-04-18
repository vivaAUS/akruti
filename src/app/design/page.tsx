import Link from "next/link";
import { Box, Shapes } from "lucide-react";

const tools = [
  {
    href: "/design/jewelry-box",
    icon: Box,
    label: "Jewelry Box Designer",
    tagline: "Parametric box designer",
    detail:
      "Design custom jewelry boxes with adjustable dimensions, stackable trays, and interlocking grooves. Export directly to STL for 3D printing.",
  },
  {
    href: "/design/designer",
    icon: Shapes,
    label: "General Designer",
    tagline: "Parts · lids · hinges · textures",
    detail:
      "Compose 3D-printable objects from boxes, cylinders, snap/screw lids, hinges, and face textures. Toggle the A1 mini build-plate guide and export print-ready STL.",
  },
];

export default function DesignPage() {
  return (
    <div className="pt-24 pb-24 min-h-screen bg-akruti-dark text-akruti-cream">
      {/* Header */}
      <div
        className="max-w-[1920px] mx-auto px-8 pt-12 pb-10"
        style={{ borderBottom: "1px solid rgba(245,158,11,0.15)" }}
      >
        <p className="text-[0.6875rem] tracking-[0.2em] uppercase text-akruti-gold font-body mb-3">
          AKRUTI STUDIO
        </p>
        <h1 className="font-headline text-6xl md:text-8xl tracking-tighter text-akruti-cream leading-none uppercase">
          Design Tools
        </h1>
        <p className="text-sm text-akruti-cream/50 font-body mt-4 max-w-md leading-relaxed">
          Parametric 3D design tools for creating custom prints. Configure your piece, preview it live, and export an STL ready for printing.
        </p>
      </div>

      {/* Tools grid */}
      <div className="max-w-[1920px] mx-auto px-8 pt-12">
        <p className="text-[0.6rem] tracking-[0.22em] uppercase text-akruti-gold/60 font-body mb-8">
          Available Tools
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.href}
                href={tool.href}
                className="group bg-akruti-dark p-8 flex flex-col gap-6 hover:bg-white/[0.03] transition-colors duration-300"
              >
                <div
                  className="w-12 h-12 flex items-center justify-center"
                  style={{ border: "1px solid rgba(245,158,11,0.3)" }}
                >
                  <Icon className="w-5 h-5 text-akruti-gold" />
                </div>

                <div>
                  <p className="text-[0.6rem] tracking-[0.18em] uppercase text-akruti-gold/60 font-body mb-2">
                    {tool.tagline}
                  </p>
                  <h2 className="font-headline text-2xl uppercase tracking-tight text-akruti-cream group-hover:text-akruti-gold transition-colors duration-300 leading-tight mb-3">
                    {tool.label}
                  </h2>
                  <p className="text-sm text-akruti-cream/40 font-body leading-relaxed">
                    {tool.detail}
                  </p>
                </div>

                <span
                  className="mt-auto text-[0.6rem] tracking-[0.2em] uppercase font-body text-akruti-gold border-b border-akruti-gold/40 pb-px self-start group-hover:border-akruti-gold transition-colors duration-300"
                >
                  Open Tool →
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
