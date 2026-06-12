import { formatExpiry, formatPrice, storageLabel } from "@/lib/format";
import { getImageUrl, type Listing } from "@/lib/queries";

export type LotView = {
  id: string;
  title: string;
  inciName: string;
  casNo: string;
  typeCategory: string;
  manufacturer: string;
  quantity: number;
  unit: string;
  expiryLabel: string;
  expiryHelper: string;
  expired: boolean;
  imminent: boolean;
  priceLabel: string;
  status: string;
  hasMsds: boolean;
  hasCoa: boolean;
  functionTags: string[];
  certTags: string[];
  storageText: string;
  imageUrls: string[];
};

function monthsUntil(dateStr: string): number | null {
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  const now = new Date();
  return (date.getFullYear() - now.getFullYear()) * 12 + (date.getMonth() - now.getMonth());
}

export async function buildLotViews(listings: Listing[]): Promise<LotView[]> {
  return Promise.all(
    listings.map(async (l) => {
      const expiry = formatExpiry(l.expiry_date);
      const months = monthsUntil(l.expiry_date);
      const images = (l.listing_images ?? [])
        .slice()
        .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
      const urls = (
        await Promise.all(images.map((img) => getImageUrl(img.storage_path)))
      ).filter((u): u is string => Boolean(u));

      return {
        id: l.id,
        title: l.title,
        inciName: l.inci_name,
        casNo: l.cas_no,
        typeCategory: l.type_category,
        manufacturer: l.manufacturer,
        quantity: l.quantity,
        unit: l.unit,
        expiryLabel: expiry.label,
        expiryHelper: expiry.helper,
        expired: expiry.expired,
        imminent: !expiry.expired && months !== null && months <= 3,
        priceLabel: formatPrice(l.price, l.price_negotiable),
        status: l.status,
        hasMsds: l.has_msds,
        hasCoa: l.has_coa,
        functionTags: l.function_tags ?? [],
        certTags: l.cert_tags ?? [],
        storageText: storageLabel(l.storage_condition),
        imageUrls: urls,
      };
    }),
  );
}
