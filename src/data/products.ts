import { Product } from "@/lib/types";

export const products: Product[] = [
  {
    id: "1",
    name: "Geometric Fidget Cube",
    slug: "geometric-fidget-cube",
    description:
      "A satisfying geometric fidget cube printed in premium PLA. Great desk toy for focus and stress relief.",
    price: 1500,
    images: ["/placeholder-product.jpg"],
    category: "Fidgets",
    inStock: true,
  },
  {
    id: "2",
    name: "Custom Name Keychain",
    slug: "custom-name-keychain",
    description:
      "Personalised keychain printed with your name or short text. Choose from a range of colours.",
    price: 800,
    images: ["/placeholder-product.jpg"],
    category: "Keychains",
    inStock: true,
  },
  {
    id: "3",
    name: "Articulated Dragon",
    slug: "articulated-dragon",
    description:
      "A fully articulated dragon that flexes and moves. Printed in one piece — no assembly needed.",
    price: 3500,
    images: ["/placeholder-product.jpg"],
    category: "Figurines",
    inStock: true,
  },
  {
    id: "4",
    name: "Phone Stand",
    slug: "phone-stand",
    description:
      "Adjustable phone stand compatible with all phone sizes. Clean minimal design.",
    price: 1200,
    images: ["/placeholder-product.jpg"],
    category: "Desk",
    inStock: false,
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
