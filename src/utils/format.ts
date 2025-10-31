export function formatCurrencyKRW(value: number): string {
  return new Intl.NumberFormat("ko-KR").format(value) + "원";
}
export const toYmd = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};