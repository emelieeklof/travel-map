import { Tag, Coffee, Shirt, Leaf, BookOpen, Music2, Camera, Star, Heart, Beer, type LucideIcon } from 'lucide-react'

export const CUSTOM_CATEGORY_ICONS: Record<string, LucideIcon> = {
  tag: Tag,
  coffee: Coffee,
  shirt: Shirt,
  leaf: Leaf,
  book: BookOpen,
  music: Music2,
  camera: Camera,
  star: Star,
  heart: Heart,
  beer: Beer,
}

export const CUSTOM_CATEGORY_ICON_IDS = Object.keys(CUSTOM_CATEGORY_ICONS)

export const CUSTOM_CATEGORY_COLORS = [
  '#a13920',
  '#3e616f',
  '#466556',
  '#c25136',
  '#7a5c8e',
  '#b8863f',
  '#4c7a8e',
  '#8e5c4c',
]

export function autoCustomCategoryColor(existingCount: number): string {
  return CUSTOM_CATEGORY_COLORS[existingCount % CUSTOM_CATEGORY_COLORS.length]
}
