import styled from "styled-components";

export const Container = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

export const Card = styled.div`
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

export const SectionTitle = styled.h2`
  margin: 0 0 16px 0;
  color: #333;
`;

export const Button = styled.button<{ $variant?: "primary" | "danger" | "outline" | "dark" }>`
  padding: 8px 12px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  color: #fff;
  background: #667eea;
  ${(p) =>
        p.$variant === "danger" &&
        `background:#ef4444;`}
  ${(p) =>
        p.$variant === "outline" &&
        `background:#fff;color:#333;border:1px solid #ddd;font-weight:600;`}
  ${(p) =>
        p.$variant === "dark" &&
        `background:#111827;`}
`;

export const Input = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  width: 100%;
`;

export const Select = styled.select`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
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
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
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


