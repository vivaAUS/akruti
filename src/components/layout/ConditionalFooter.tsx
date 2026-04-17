"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

// Routes where the Footer should be hidden (e.g. full-screen design tools)
const NO_FOOTER_PREFIXES = ["/design/"];

export default function ConditionalFooter() {
  const pathname = usePathname();
  const hidden = NO_FOOTER_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (hidden) return null;
  return <Footer />;
}
