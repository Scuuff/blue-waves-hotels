import {
  Bath,
  Building2,
  Car,
  Coffee,
  ConciergeBell,
  Eye,
  Flower2,
  Snowflake,
  Sofa,
  Sparkles,
  TreePalm,
  Tv,
  Waves,
  Wifi,
  Wine,
} from "lucide-react";

// Map a free-text amenity name to a matching lucide icon component.
// Specific matches are checked before generic ones.
export function amenityIcon(name) {
  const n = String(name).toLowerCase().trim();
  if (n.includes("wifi")) return Wifi;
  if (n === "ac" || n.includes("air")) return Snowflake;
  if (n.includes("service")) return ConciergeBell;
  if (n.includes("pool")) return Waves;
  if (n.includes("sea") || n.includes("ocean") || n.includes("beach")) return Waves;
  if (n.includes("breakfast")) return Coffee;
  if (n.includes("bar")) return Wine;
  if (n.includes("skyline") || n.includes("city")) return Building2;
  if (n.includes("lounge")) return Sofa;
  if (n.includes("spa")) return Flower2;
  if (n.includes("jacuzzi")) return Bath;
  if (n.includes("terrace")) return TreePalm;
  if (n.includes("tv")) return Tv;
  if (n.includes("valet") || n.includes("parking")) return Car;
  if (n.includes("view")) return Eye;
  return Sparkles;
}
