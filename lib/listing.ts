import type { ListingCategory } from "@prisma/client";

export const listingCategories: { id: ListingCategory; label: string }[] = [
  { id: "ANIME", label: "Anime" },
  { id: "GAMING", label: "Oyun" },
  { id: "GOTHIC", label: "Gotik" },
  { id: "STREETWEAR", label: "Sokak" },
  { id: "MINIMAL", label: "Sade" },
  { id: "VINTAGE", label: "Vintage" },
  { id: "COUPLE", label: "Çift" },
  { id: "FUNNY", label: "Eğlenceli" },
  { id: "MEME", label: "Meme" },
  { id: "MUSIC", label: "Müzik" },
  { id: "SPORT", label: "Spor" },
  { id: "KIDS", label: "Çocuk" },
  { id: "TRENDING", label: "Gündem" },
];

export function listingCategoryLabel(id: ListingCategory) {
  return listingCategories.find((item) => item.id === id)?.label ?? id;
}
