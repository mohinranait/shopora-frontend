/**
 * Money on the client. The API sends taka as numbers with at most 2 decimals (the backend keeps
 * them exact in numeric(12,2) columns), so display must not round them away and any sums done in
 * the browser go through whole paisa to avoid floating-point drift.
 */

/** Taka → integer paisa */
export const toPaisa = (taka: number | string | null | undefined): number => Math.round((Number(taka) || 0) * 100);

/** Add taka amounts exactly */
export const sumTaka = (values: Array<number | string | null | undefined>): number =>
  values.reduce<number>((sum, v) => sum + toPaisa(v), 0) / 100;

/** "৳1,250" for whole amounts, "৳19.99" when there are paisa, "-৳52.47" for negatives */
export const formatTaka = (n?: number | string | null): string => {
  const amount = Number(n) || 0;
  const text = Math.abs(amount).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  return amount < 0 ? `-৳${text}` : `৳${text}`;
};

/** Round a taka amount to 2 decimals (what the API accepts); keeps null/undefined as is */
export const roundTaka = <T extends number | null | undefined>(n: T): T =>
  (typeof n === "number" && Number.isFinite(n) ? Math.round(n * 100) / 100 : n) as T;
