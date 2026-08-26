import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Convert Latin digits to Bangla digits if needed
export function toBanglaNumber(num: number | string): string {
  const banglaDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num
    .toString()
    .replace(/\d/g, (digit) => banglaDigits[parseInt(digit, 10)]);
}

/**
 * Format price in Taka.
 * Example: formatPrice(1250) => "৳১,২৫০" or "৳1,250"
 */
export function formatPrice(amount: number, useBanglaDigits: boolean = false): string {
  const formatted = new Intl.NumberFormat("en-IN").format(amount);
  if (useBanglaDigits) {
    return `৳${toBanglaNumber(formatted)}`;
  }
  return `৳${formatted}`;
}

/** Whole taka only — never show trailing .00 on storefront prices. */
export function formatTaka(amount: number): string {
  return `৳${new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(Math.round(amount))}`;
}

export function calculateDiscount(price: number, originalPrice?: number): number {
  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}
