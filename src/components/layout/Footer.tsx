import Link from "next/link";
import { Printer } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-white font-semibold">
          <Printer className="w-5 h-5 text-indigo-400" />
          Akruti 3D Prints
        </div>
        <nav className="flex gap-6 text-sm">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <Link href="/shop" className="hover:text-white transition-colors">Shop</Link>
          <Link href="/cart" className="hover:text-white transition-colors">Cart</Link>
        </nav>
        <p className="text-xs">© {new Date().getFullYear()} Akruti. All rights reserved.</p>
      </div>
    </footer>
  );
}
