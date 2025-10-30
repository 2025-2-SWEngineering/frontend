export function formatCurrencyKRW(value: number): string {
  return new Intl.NumberFormat("ko-KR").format(value) + "원";
}
