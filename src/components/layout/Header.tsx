"use client";

import Link from "next/link";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useState } from "react";
import { usePathname } from "next/navigation";

function goHome() {
  window.dispatchEvent(new Event("home-navigate"));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

const navLinks = [
  { label: "HOME",          href: "/" },
  { label: "CATALOGUE",     href: "/shop" },
  { label: "DESIGN",        href: "/design" },
  { label: "CUSTOM PRINTS", href: "/custom-prints" },
  { label: "ABOUT",         href: "/about" },
  { label: "CONTACT",       href: "/contact" },
];

export default function Header() {
  const totalItems = useCartStore((s) => s.totalItems());
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-akruti-dark/95 backdrop-blur-md"
         style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="flex justify-between items-center w-full px-8 py-6 max-w-[1920px] mx-auto">

        {/* Logo */}
        <Link href="/" onClick={goHome} className="text-2xl font-headline font-bold tracking-tighter text-akruti-cream">
          AKRUTI
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={link.href === "/" ? goHome : undefined}
              className={`font-headline tracking-tight uppercase font-medium text-sm transition-colors duration-300 ${
                isActive(link.href)
                  ? "text-akruti-gold border-b border-akruti-gold pb-1"
                  : "text-akruti-cream/50 hover:text-akruti-gold"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right: cart + order tracking + hamburger */}
        <div className="flex items-center gap-4">
          <Link href="/cart" className="relative p-2 text-akruti-cream hover:text-akruti-gold transition-colors">
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-akruti-gold text-akruti-dark text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>

          <Link
            href="/orders"
            className="hidden md:block font-headline tracking-tight uppercase font-medium text-sm border border-akruti-cream/20 px-6 py-2 text-akruti-cream hover:bg-akruti-cream hover:text-akruti-dark transition-all duration-300"
          >
            TRACK ORDER
          </Link>

          <button
            className="md:hidden p-2 text-akruti-cream"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden px-8 py-4 flex flex-col gap-4 bg-akruti-dark" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => { setMenuOpen(false); if (link.href === "/") goHome(); }}
              className={`font-headline text-sm uppercase tracking-widest transition-colors py-1 ${
                isActive(link.href) ? "text-akruti-gold" : "text-akruti-cream/60 hover:text-akruti-gold"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/orders"
            onClick={() => setMenuOpen(false)}
            className="font-headline text-sm uppercase tracking-widest text-akruti-cream/60 hover:text-akruti-gold transition-colors py-1"
          >
            TRACK ORDER
          </Link>
          <Link
            href="/cart"
            onClick={() => setMenuOpen(false)}
            className={`font-headline text-sm uppercase tracking-widest transition-colors py-1 ${
              isActive("/cart") ? "text-akruti-gold" : "text-akruti-cream/60 hover:text-akruti-gold"
            }`}
          >
            CART {totalItems > 0 && `(${totalItems})`}
          </Link>
        </div>
      )}
    </nav>
  );
}
