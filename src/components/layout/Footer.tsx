import Link from "next/link";

const footerSections = [
  {
    title: "Shop",
    links: [
      { label: "Catalogue",     href: "/shop" },
      { label: "Custom Prints", href: "/custom-prints" },
      { label: "Track Order",   href: "/orders" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About",   href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "FAQ",     href: "/faq" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy",  href: "#" },
      { label: "Terms of Sale",   href: "#" },
      { label: "Shipping Policy", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-akruti-cream-low w-full"
            style={{ borderTop: "1px solid rgba(210,197,179,0.2)" }}>
      {/* Main footer grid */}
      <div className="max-w-[1920px] mx-auto px-8 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
        {/* Brand column */}
        <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
          <Link href="/" className="text-lg font-bold tracking-widest text-akruti-dark font-body">
            AKRUTI
          </Link>
          <p className="text-xs font-body text-akruti-muted leading-relaxed max-w-[16rem]">
            Precision 3D prints, made to order. Fidgets, figurines, keychains, and custom designs.
          </p>
          <a
            href="mailto:hello@akruti.com.au"
            className="text-xs font-body text-akruti-primary hover:text-akruti-gold transition-colors border-b border-akruti-primary/30 pb-px w-fit"
          >
            hello@akruti.com.au
          </a>
        </div>

        {/* Link columns */}
        {footerSections.map((section) => (
          <div key={section.title} className="flex flex-col gap-4">
            <p className="text-[0.6rem] tracking-[0.18em] uppercase text-akruti-dark font-body font-semibold">
              {section.title}
            </p>
            <nav className="flex flex-col gap-2.5">
              {section.links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-xs font-body text-akruti-muted hover:text-akruti-dark transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="max-w-[1920px] mx-auto px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-3"
           style={{ borderTop: "1px solid rgba(210,197,179,0.2)" }}>
        <p className="text-[0.625rem] tracking-[0.1em] uppercase text-akruti-muted/60 font-body">
          © {new Date().getFullYear()} AKRUTI. ALL RIGHTS RESERVED.
        </p>
        <p className="text-[0.625rem] tracking-[0.08em] uppercase text-akruti-muted/40 font-body">
          Made in Australia · Ships Worldwide
        </p>
      </div>
    </footer>
  );
}
