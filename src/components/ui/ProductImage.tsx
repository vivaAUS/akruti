"use client";

import { useState } from "react";
import ProductImagePlaceholder from "./ProductImagePlaceholder";

interface Props {
  src: string;
  alt: string;
  name: string;
  category: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/** Shows a real image; falls back to gradient placeholder on error or empty src. */
export default function ProductImage({ src, alt, name, category, size = "md", className = "" }: Props) {
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return <ProductImagePlaceholder name={name} category={category} size={size} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={`w-full h-full object-cover ${className}`}
      onError={() => setErrored(true)}
    />
  );
}
