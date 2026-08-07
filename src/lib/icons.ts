import {
  Backpack,
  Baby,
  Car,
  Droplets,
  Flower2,
  HeartPulse,
  Home,
  Milk,
  Moon,
  Puzzle,
  Shirt,
  Sparkles,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react';

/**
 * Data carries icon *names* (as the database will), so this map is the single
 * place that turns a stored string into a component.
 */
const ICONS: Record<string, LucideIcon> = {
  Backpack,
  Baby,
  Car,
  Droplets,
  Flower2,
  HeartPulse,
  Home,
  Milk,
  Moon,
  Puzzle,
  Shirt,
  Sparkles,
  UtensilsCrossed,
};

export function resolveIcon(name: string): LucideIcon {
  return ICONS[name] ?? Sparkles;
}

export const ICON_KEYS = Object.keys(ICONS);
