export function formatEuro(cents: number) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export const QUICK_TOP_UPS_CENTS = [250_000, 1_000_000] as const;
