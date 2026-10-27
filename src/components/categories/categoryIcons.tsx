import {
  Baby,
  BookOpen,
  Car,
  Dumbbell,
  Gamepad2,
  Gift,
  Headphones,
  Heart,
  House,
  Laptop,
  Shirt,
  Smartphone,
  Sofa,
  Sparkles,
  Tag,
  UtensilsCrossed,
  Watch,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";
import { createElement } from "react";

// Maps the `icon` string stored on a category to a lucide icon
const ICON_MAP: Record<string, LucideIcon> = {
  laptop: Laptop,
  electronics: Laptop,
  smartphone: Smartphone,
  phone: Smartphone,
  watch: Watch,
  headphones: Headphones,
  audio: Headphones,
  shirt: Shirt,
  fashion: Shirt,
  home: House,
  house: House,
  sofa: Sofa,
  furniture: Sofa,
  sports: Dumbbell,
  dumbbell: Dumbbell,
  baby: Baby,
  kids: Baby,
  car: Car,
  automotive: Car,
  book: BookOpen,
  books: BookOpen,
  gaming: Gamepad2,
  game: Gamepad2,
  beauty: Sparkles,
  food: UtensilsCrossed,
  grocery: UtensilsCrossed,
  health: Heart,
  gift: Gift,
};

export function getCategoryIcon(icon?: string | null): LucideIcon {
  if (!icon) return Tag;
  return ICON_MAP[icon.toLowerCase().trim()] ?? Tag;
}

export function CategoryIcon({ icon, ...props }: { icon?: string | null } & LucideProps) {
  return createElement(getCategoryIcon(icon), props);
}

// Accent palettes used when a category has no cover image
export const CATEGORY_ACCENTS = [
  { gradient: "from-sky-500 to-blue-700", soft: "bg-sky-50 text-sky-700 ring-sky-100" },
  { gradient: "from-fuchsia-500 to-purple-700", soft: "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-100" },
  { gradient: "from-emerald-500 to-teal-700", soft: "bg-emerald-50 text-emerald-700 ring-emerald-100" },
  { gradient: "from-amber-500 to-orange-600", soft: "bg-amber-50 text-amber-700 ring-amber-100" },
  { gradient: "from-rose-500 to-red-600", soft: "bg-rose-50 text-rose-700 ring-rose-100" },
  { gradient: "from-indigo-500 to-violet-700", soft: "bg-indigo-50 text-indigo-700 ring-indigo-100" },
];
