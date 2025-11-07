export function formatCurrencyKRW(value: number): string {
  return new Intl.NumberFormat("ko-KR").format(value) + "원";
}
export const toYmd = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export function formatNumberKR(value: number | string): string {
  const n = Number(value || 0);
  return new Intl.NumberFormat("ko-KR").format(n);
}

export function isYmdDateString(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

export function formatYmd(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return toYmd(d);
}

export function formatYmdHm(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day} ${hh}:${mm}`;
}

export function formatDisplayDateTime(s: string): string {
  if (isYmdDateString(s)) return `${s} 00:00`;
  return formatYmdHm(s);
}

export const formatKRW = formatCurrencyKRW;
