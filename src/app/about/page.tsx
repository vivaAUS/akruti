import Link from "next/link";

const values = [
  { title: "Precision",    body: "Every layer is printed at ±0.1 mm tolerance. We don't release pieces that don't meet our internal quality benchmark." },
  { title: "Honesty",      body: "No fake reviews, no inflated pricing. Every product page shows exactly what you get — material, dimensions, and limitations." },
  { title: "Craft",        body: "3D printing is a craft. We post-process every piece by hand — sanding, polishing, and inspecting before it leaves the studio." },
  { title: "Speed",        body: "Made-to-order doesn't mean slow. Standard orders ship within 3–5 business days. Custom prints within 7–10." },
];

const process = [
  { num: "01", title: "Design",       body: "We source or originate our models from professional CAD files, optimised for FDM printing with clean support strategies." },
  { num: "02", title: "Slice",        body: "Each model is sliced in Bambu Studio with tuned profiles per material — PLA+, PETG, metal fill, and carbon fibre." },
  { num: "03", title: "Print",        body: "Printed on Bambu Lab X1C multi-colour printers at 0.1–0.2 mm layer height depending on detail requirements." },
  { num: "04", title: "Finish",       body: "Light sanding on contact surfaces, part inspection, and optional post-curing for resin components." },
  { num: "05", title: "Pack & Ship",  body: "Each piece is wrapped in tissue paper and boxed with care. Tracking number emailed on dispatch." },
];

export default function AboutPage() {
  return (
    <div className="pt-24 pb-24 min-h-screen bg-white">
      {/* Header */}
      <div className="max-w-[1920px] mx-auto px-8 pt-12 pb-10"
           style={{ borderBottom: "1px solid rgba(210,197,179,0.3)" }}>
        <p className="text-[0.6875rem] tracking-[0.2em] uppercase text-akruti-muted font-body mb-3">
          THE STUDIO
        </p>
        <h1 className="font-headline text-6xl md:text-8xl tracking-tighter text-akruti-dark leading-none uppercase">
          About Akruti
        </h1>
      </div>

      {/* Story */}
      <div className="max-w-[1920px] mx-auto px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="font-headline text-4xl uppercase tracking-tighter text-akruti-dark mb-6 leading-tight">
            Handcrafted precision,<br />one layer at a time.
          </h2>
          <div className="flex flex-col gap-4 text-sm font-body text-akruti-muted leading-relaxed max-w-lg">
            <p>
              Akruti started in 2023 from a single Bambu Lab printer and a conviction that consumer 3D printing had quietly reached a turning point — quality that could rival injection moulding, speeds that made made-to-order viable, and materials that genuinely delighted.
            </p>
            <p>
              We focus on a small, curated range of products: fidgets, figurines, keychains, and desk accessories. Each design is tested obsessively before it goes in the catalogue. If it doesn&apos;t survive drop testing, repeated flex cycles, or just doesn&apos;t feel satisfying in the hand — it doesn&apos;t ship.
            </p>
            <p>
              Beyond our standard range, we take custom orders for anything that fits our printers. Miniatures, product prototypes, architectural models, replacement parts — if it can be modelled, we can print it.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 mt-8">
            <Link
              href="/shop"
              className="font-headline text-sm uppercase tracking-widest bg-akruti-dark text-akruti-cream px-8 py-3 hover:bg-akruti-primary transition-colors duration-300"
            >
              Browse Catalogue
            </Link>
            <Link
              href="/custom-prints"
              className="font-headline text-sm uppercase tracking-widest border border-akruti-dark text-akruti-dark px-8 py-3 hover:bg-akruti-dark hover:text-akruti-cream transition-colors duration-300"
            >
              Custom Prints
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-px bg-akruti-border/30">
          {[
            { value: "500+",    label: "Orders fulfilled" },
            { value: "3–5",     label: "Days to ship" },
            { value: "4",       label: "Material options" },
            { value: "100%",    label: "Handchecked" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white py-10 px-8 flex flex-col justify-center">
              <p className="font-headline text-5xl tracking-tighter text-akruti-dark mb-1">{stat.value}</p>
              <p className="text-[0.6875rem] tracking-[0.15em] uppercase text-akruti-muted font-body">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Values */}
      <div className="bg-akruti-cream-low" style={{ borderTop: "1px solid rgba(210,197,179,0.2)", borderBottom: "1px solid rgba(210,197,179,0.2)" }}>
        <div className="max-w-[1920px] mx-auto px-8 py-20">
          <h2 className="font-headline text-3xl uppercase tracking-tighter text-akruti-dark mb-12">
            What we stand for
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((v) => (
              <div key={v.title}>
                <h3 className="font-headline text-xl uppercase tracking-tight text-akruti-dark mb-3">{v.title}</h3>
                <p className="text-sm font-body text-akruti-muted leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Process */}
      <div className="max-w-[1920px] mx-auto px-8 py-20">
        <h2 className="font-headline text-3xl uppercase tracking-tighter text-akruti-dark mb-14">
          From file to front door
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {process.map((step) => (
            <div key={step.num} className="flex flex-col gap-3">
              <span className="font-headline text-5xl text-akruti-gold/25 leading-none">{step.num}</span>
              <h3 className="font-headline text-lg uppercase tracking-tight text-akruti-dark">{step.title}</h3>
              <p className="text-sm font-body text-akruti-muted leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Equipment */}
      <div className="max-w-[1920px] mx-auto px-8 py-16 bg-akruti-dark">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-[0.6875rem] tracking-[0.2em] uppercase text-akruti-gold font-body mb-4">THE HARDWARE</p>
            <h2 className="font-headline text-3xl uppercase tracking-tighter text-akruti-cream mb-6">
              Printed on Bambu Lab X1C
            </h2>
            <p className="text-sm font-body text-akruti-cream/60 leading-relaxed max-w-md">
              The X1C&apos;s multi-colour AMS system and active flow calibration let us print complex geometries with consistent surface quality at production speeds. Layer adhesion is measured, not assumed.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { value: "256 mm³",    label: "Print volume" },
              { value: "0.1 mm",     label: "Layer height" },
              { value: "16 colour",  label: "AMS max" },
            ].map((item) => (
              <div key={item.label} className="py-8 px-4" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="font-headline text-2xl text-akruti-gold mb-1">{item.value}</p>
                <p className="text-[0.6rem] tracking-[0.15em] uppercase text-akruti-cream/40 font-body">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
