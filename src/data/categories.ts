export type Category = {
  id: string;
  name: string;
  tagline: string;
  detail: string;
  gradient: string;
  image: string;
};

export const categories: Category[] = [
  {
    id: "fidgets",
    name: "Fidgets",
    tagline: "Precision desk toys for restless hands.",
    detail:
      "Satisfying desk companions engineered for tactile feedback and focus. Each piece is printed in premium PLA with micron-level layer accuracy for a silky-smooth feel.",
    gradient: "from-indigo-500 to-purple-700",
    image: "https://loremflickr.com/1200/800/toy,colorful,plastic?lock=1",
  },
  {
    id: "keychains",
    name: "Keychains",
    tagline: "Carry your identity in your pocket.",
    detail:
      "Personalised keychains printed with your name, initials, or any short text. Lightweight, durable, and available in a range of vibrant colour filaments.",
    gradient: "from-amber-400 to-orange-600",
    image: "https://loremflickr.com/1200/800/keychain,accessory,jewelry?lock=2",
  },
  {
    id: "figurines",
    name: "Figurines",
    tagline: "Articulated sculptures in a single run.",
    detail:
      "Fully articulated figures and intricate sculptures printed in one continuous piece — no assembly, no glue, no compromise on detail. Pure mechanical ingenuity.",
    gradient: "from-emerald-500 to-teal-700",
    image: "https://loremflickr.com/1200/800/figurine,dragon,fantasy?lock=3",
  },
  {
    id: "desk",
    name: "Desk",
    tagline: "Minimal accessories for productive spaces.",
    detail:
      "Clean, purposeful desk accessories designed to disappear into any setup while quietly improving it. Universal compatibility, zero visual noise.",
    gradient: "from-sky-400 to-blue-700",
    image: "https://loremflickr.com/1200/800/desk,workspace,minimal?lock=4",
  },
   {
    id: "pots",
    name: "Pots",
    tagline: "Minimal accessories for productive spaces.",
    detail:
      "Clean, purposeful desk accessories designed to disappear into any setup while quietly improving it. Universal compatibility, zero visual noise.",
    gradient: "from-sky-400 to-blue-700",
    image: "https://makerworld.bblmw.com/makerworld/model/USf12e6eb5069503/design/2024-11-12_6e308d9636f25.webp?x-oss-process=image/resize,w_1000/format,webp",
  },
];

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id.toLowerCase());
}
