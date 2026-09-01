import {
  Waves, Home, TreePine, Flame, Coffee, Utensils, Wifi,
  Star, Heart, Sun, Bath, Car, Wind, Flower2, ShieldCheck,
  Bed, Mountain, Sparkles, Music, Bike,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const ICON_OPTIONS: { name: string; label: string; icon: LucideIcon }[] = [
  { name: "Waves",       label: "Hullámok (jacuzzi)",   icon: Waves       },
  { name: "Home",        label: "Ház",                  icon: Home        },
  { name: "TreePine",    label: "Fenyőfa (kert)",        icon: TreePine    },
  { name: "Flame",       label: "Láng (kandalló)",       icon: Flame       },
  { name: "Coffee",      label: "Kávé",                  icon: Coffee      },
  { name: "Utensils",    label: "Evőeszköz (konyha)",    icon: Utensils    },
  { name: "Wifi",        label: "Wi-Fi",                 icon: Wifi        },
  { name: "Star",        label: "Csillag",               icon: Star        },
  { name: "Heart",       label: "Szív",                  icon: Heart       },
  { name: "Sun",         label: "Nap",                   icon: Sun         },
  { name: "Bath",        label: "Fürdőkád",              icon: Bath        },
  { name: "Car",         label: "Autó (parkoló)",        icon: Car         },
  { name: "Wind",        label: "Szél (légkondicionáló)",icon: Wind        },
  { name: "Flower2",     label: "Virág",                 icon: Flower2     },
  { name: "ShieldCheck", label: "Védelem (biztonság)",   icon: ShieldCheck },
  { name: "Bed",         label: "Ágy",                   icon: Bed         },
  { name: "Mountain",    label: "Hegy (természet)",      icon: Mountain    },
  { name: "Sparkles",    label: "Csillogás (luxus)",     icon: Sparkles    },
  { name: "Music",       label: "Zene",                  icon: Music       },
  { name: "Bike",        label: "Kerékpár",              icon: Bike        },
];

export const ICON_MAP: Record<string, LucideIcon> = Object.fromEntries(
  ICON_OPTIONS.map(({ name, icon }) => [name, icon])
);
