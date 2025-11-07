import styled from "styled-components";

// 반응형 Breakpoint 시스템
export const breakpoints = {
  mobile: "480px",
  tablet: "768px",
  desktop: "1024px",
  wide: "1440px",
};

// 미디어 쿼리 헬퍼
export const media = {
  mobile: `@media (max-width: ${breakpoints.mobile})`,
  tablet: `@media (min-width: ${breakpoints.mobile}) and (max-width: ${breakpoints.tablet})`,
  desktop: `@media (min-width: ${breakpoints.tablet})`,
  wide: `@media (min-width: ${breakpoints.desktop})`,
};

export const colors = {
  primary: "#667eea",
  primaryStrong: "#4f46e5",
  accent: "#764ba2",
  dark: "#111827",
  danger: "#ef4444",
  dangerSoft: "#fca5a5",
  success: "#10b981",
  income: "#16a34a",
  expense: "#dc2626",
  border: "#e5e7eb",
  bgSoft: "#f3f4f6",
  bgLighter: "#f8fafc",
  bgField: "#f9fafb",
  bgPage: "#f5f5f5",
  white: "#fff",
  text: "#333",
  textMuted: "#666",
  muted: "#999",
  divider: "#f0f0f0",
  gray500: "#6b7280",
  info: "#0ea5e9",
  amber: "#f59e0b",
  violet: "#8b5cf6",
  teal: "#14b8a6",
  orange: "#f97316",
  lime: "#84cc16",
  indigo: "#6366f1",
};

export const Container = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;

  ${media.tablet} {
    padding: 24px;
  }

  ${media.desktop} {
    padding: 40px 20px;
  }
`;

export const Card = styled.div`
  background: #fff;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  ${media.tablet} {
    padding: 20px;
  }

  ${media.desktop} {
    padding: 24px;
  }
`;

export const SectionTitle = styled.h2`
  margin: 0 0 16px 0;
  color: #333;
  font-size: 20px;

  ${media.tablet} {
    font-size: 22px;
  }

  ${media.desktop} {
    font-size: 24px;
  }
`;

export const Button = styled.button<{ $variant?: "primary" | "danger" | "outline" | "dark" }>`
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  color: #fff;
  background: ${colors.primary};
  min-height: 44px; /* 터치 친화적 최소 크기 */
  font-size: 14px;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.9;
  }

  &:active {
    opacity: 0.8;
  }

  ${media.desktop} {
    padding: 8px 12px;
    min-height: auto;
    font-size: 16px;
  }

  ${(p) => p.$variant === "danger" && `background:${colors.danger};`}
  ${(p) =>
    p.$variant === "outline" && `background:#fff;color:#333;border:1px solid #ddd;font-weight:600;`}
  ${(p) => p.$variant === "dark" && `background:${colors.dark};`}
`;

export const Input = styled.input`
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  width: 100%;
  min-height: 44px; /* 터치 친화적 최소 크기 */
  font-size: 16px; /* iOS 줌 방지 */

  ${media.desktop} {
    padding: 10px;
    min-height: auto;
  }
`;

export const Select = styled.select`
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  min-height: 44px; /* 터치 친화적 최소 크기 */
  font-size: 16px; /* iOS 줌 방지 */

  ${media.desktop} {
    padding: 10px;
    min-height: auto;
  }
`;

export const Flex = styled.div<{ $gap?: number; $center?: boolean; $justify?: string }>`
  display: flex;
  gap: ${(p) => (p.$gap == null ? 12 : p.$gap)}px;
  align-items: ${(p) => (p.$center ? "center" : "stretch")};
  justify-content: ${(p) => p.$justify || "flex-start"};
`;

export const Grid = styled.div<{ $cols?: string; $gap?: number }>`
  display: grid;
  grid-template-columns: ${(p) => p.$cols || "1fr"};
  gap: ${(p) => (p.$gap == null ? 12 : p.$gap)}px;
`;

export const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 16px;
`;

export const ModalCard = styled.div`
  width: min(450px, 96vw);
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 20px;
`;

export const Badge = styled.span`
  background: ${colors.bgSoft};
  border: 1px solid ${colors.border};
  color: #4b5563;
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 13px;
  white-space: nowrap;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

export const Th = styled.th`
  text-align: left;
  padding: 8px;
  color: #666;
  border-bottom: 1px solid #eee;
`;

export const Td = styled.td`
  padding: 8px;
  border-bottom: 1px solid #f6f6f6;
`;

export const AmountText = styled.span<{ $type: "income" | "expense" }>`
  color: ${(p) => (p.$type === "income" ? colors.income : colors.expense)};
  font-weight: 600;
  min-width: 120px;
  display: inline-block;

  ${media.mobile} {
    min-width: auto;
    width: 100%;
  }
`;

export const Spacer = styled.div<{ $size?: number }>`
  height: ${(p) => (p.$size == null ? 20 : p.$size)}px;
`;
