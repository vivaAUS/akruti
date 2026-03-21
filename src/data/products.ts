import { Product } from "@/lib/types";

export const products: Product[] = [
  // ── Fidgets ──────────────────────────────────────────────────────────────
  {
    id: "1",
    name: "Geometric Fidget Cube",
    slug: "geometric-fidget-cube",
    description:
      "A satisfying geometric fidget cube printed in premium PLA. Six sides of tactile interaction — clicks, spins, slides, and rolls. Great desk toy for focus and stress relief.",
    price: 1500,
    images: [
      "https://makerworld.bblmw.com/makerworld/model/US2dfd77924d2c78/design/2024-07-02_bb6b28537b827.png?x-oss-process=image/resize,w_1000/format,webp",
      "https://makerworld.bblmw.com/makerworld/model/US1ba4265727f368/design/7583d44eb677a560.png?x-oss-process=image/resize,w_1000/format,webp",
      "https://makerworld.bblmw.com/makerworld/model/USabe7b928a1a530/design/2025-06-09_1ff02b29be9e5.png?x-oss-process=image/resize,w_1000/format,webp",
      "https://makerworld.bblmw.com/makerworld/model/USc50e30f59c9a35/design/2026-01-18_e809ceb08daea8.jpg?x-oss-process=image/resize,w_1000/format,webp",
    ],
    category: "Fidgets",
    inStock: true,
  },
  {
    id: "5",
    name: "Infinity Flip Ring",
    slug: "infinity-flip-ring",
    description:
      "A satisfying flip ring that pivots and spins endlessly. Printed as a single linked structure with no assembly required. Silky smooth in matte PLA.",
    price: 1200,
    images: [
      "https://loremflickr.com/800/800/ring,silver,jewelry?lock=50",
      "https://loremflickr.com/800/800/ring,spinner,metal?lock=51",
      "https://loremflickr.com/800/800/bracelet,wearable,fidget?lock=52",
    ],
    category: "Fidgets",
    inStock: true,
  },

  // ── Keychains ─────────────────────────────────────────────────────────────
  {
    id: "2",
    name: "Custom Name Keychain",
    slug: "custom-name-keychain",
    description:
      "Personalised keychain printed with your name or short text. Choose from a range of vibrant colour filaments. Lightweight, durable, and uniquely yours.",
    price: 800,
    images: [
      "https://loremflickr.com/800/800/keychain,name,colorful?lock=20",
      "https://loremflickr.com/800/800/keychain,plastic,accessory?lock=21",
      "https://loremflickr.com/800/800/keyring,pendant,charm?lock=22",
    ],
    category: "Keychains",
    inStock: true,
  },
  {
    id: "6",
    name: "Hex Charm Keychain",
    slug: "hex-charm-keychain",
    description:
      "A bold hexagonal charm with honeycomb cutout pattern. Surprisingly lightweight at under 8g. Available in any colour in our filament range.",
    price: 700,
    images: [
      "https://loremflickr.com/800/800/hexagon,pattern,keychain?lock=60",
      "https://loremflickr.com/800/800/geometric,pendant,small?lock=61",
      "https://loremflickr.com/800/800/charm,accessory,metal?lock=62",
    ],
    category: "Keychains",
    inStock: true,
  },

  // ── Figurines ─────────────────────────────────────────────────────────────
  {
    id: "3",
    name: "Articulated Dragon",
    slug: "articulated-dragon",
    description:
      "A fully articulated dragon that flexes and moves naturally. Printed in one continuous piece — no assembly, no glue. Pure mechanical ingenuity.",
    price: 3500,
    images: [
      "https://loremflickr.com/800/800/dragon,figurine,fantasy?lock=30",
      "https://loremflickr.com/800/800/dragon,sculpture,collectible?lock=31",
      "https://loremflickr.com/800/800/fantasy,miniature,art?lock=32",
    ],
    category: "Figurines",
    inStock: true,
  },
  {
    id: "7",
    name: "Miniature Astronaut",
    slug: "miniature-astronaut",
    description:
      "A fully detailed miniature astronaut figurine printed at 1:32 scale with articulated helmet visor. A collector piece for space enthusiasts.",
    price: 2800,
    images: [
      "https://loremflickr.com/800/800/astronaut,figurine,space?lock=70",
      "https://loremflickr.com/800/800/space,helmet,miniature?lock=71",
      "https://loremflickr.com/800/800/collectible,sculpture,figure?lock=72",
    ],
    category: "Figurines",
    inStock: true,
  },

  // ── Desk ──────────────────────────────────────────────────────────────────
  {
    id: "4",
    name: "Adjustable Phone Stand",
    slug: "phone-stand",
    description:
      "Adjustable phone stand compatible with all phone sizes. Clean minimal design with rear cable routing. Compatible with MagSafe-style chargers.",
    price: 1200,
    images: [
      "https://loremflickr.com/800/800/phone,stand,desk?lock=40",
      "https://loremflickr.com/800/800/workspace,minimal,clean?lock=41",
      "https://loremflickr.com/800/800/desk,organizer,white?lock=42",
    ],
    category: "Desk",
    inStock: false,
  },
  {
    id: "8",
    name: "Cable Clip Organiser",
    slug: "cable-clip-organiser",
    description:
      "A set of 6 stackable cable clips that mount magnetically to any desk edge. Keeps your workspace free of cable chaos without drilling.",
    price: 900,
    images: [
      "https://loremflickr.com/800/800/cable,organizer,desk?lock=80",
      "https://loremflickr.com/800/800/cable,management,clean?lock=81",
      "https://loremflickr.com/800/800/workspace,tidy,minimal?lock=82",
    ],
    category: "Desk",
    inStock: true,
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
