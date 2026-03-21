import { Box, Gamepad2, KeyRound, Sword, Monitor } from "lucide-react";

const categoryStyles: Record<string, { gradient: string; Icon: React.ElementType }> = {
  Fidgets:    { gradient: "from-indigo-400 to-purple-500",  Icon: Gamepad2 },
  Keychains:  { gradient: "from-amber-400 to-orange-500",   Icon: KeyRound },
  Figurines:  { gradient: "from-emerald-400 to-teal-500",   Icon: Sword    },
  Desk:       { gradient: "from-sky-400 to-blue-500",       Icon: Monitor  },
};

interface Props {
  name: string;
  category: string;
  size?: "sm" | "md" | "lg";
}

export default function ProductImagePlaceholder({ name, category, size = "md" }: Props) {
  const style = categoryStyles[category] ?? { gradient: "from-gray-400 to-slate-500", Icon: Box };
  const { gradient, Icon } = style;

  const iconSize = size === "sm" ? "w-6 h-6" : size === "lg" ? "w-14 h-14" : "w-10 h-10";
  const letterSize = size === "sm" ? "text-lg" : size === "lg" ? "text-5xl" : "text-3xl";
  const labelSize = size === "sm" ? "text-[10px]" : "text-xs";

  return (
    <div className={`w-full h-full bg-gradient-to-br ${gradient} flex flex-col items-center justify-center gap-2 select-none`}>
      <Icon className={`${iconSize} text-white/70`} />
      <span className={`${letterSize} font-black text-white/90 leading-none`}>
        {name.charAt(0).toUpperCase()}
      </span>
      {size !== "sm" && (
        <span className={`${labelSize} font-semibold text-white/70 uppercase tracking-widest`}>
          {category}
        </span>
      )}
    </div>
  );
}
