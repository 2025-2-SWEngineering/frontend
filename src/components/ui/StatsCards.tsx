import React from "react";
import styled from "styled-components";
import { Card, colors, media } from "../../styles/primitives";

type Props = {
  loading: boolean;
  currentBalance: string;
  totalIncome: string;
  totalExpense: string;
};

// 카드 스타일은 공통 Card로 대체

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-bottom: 20px;

  ${media.tablet} {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }

  ${media.desktop} {
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
`;

const StatsCards: React.FC<Props> = ({ loading, currentBalance, totalIncome, totalExpense }) => {
  return (
    <StatsGrid>
      <Card>
        <p style={{ color: colors.textMuted, fontSize: 14, marginBottom: 8 }}>현재 잔액</p>
        <h2 style={{ color: colors.text, fontSize: 32, fontWeight: "bold" }}>
          {loading ? "-" : currentBalance}
        </h2>
      </Card>
      <Card>
        <p style={{ color: colors.textMuted, fontSize: 14, marginBottom: 8 }}>총 수입</p>
        <h2 style={{ color: colors.text, fontSize: 32, fontWeight: "bold" }}>
          {loading ? "-" : totalIncome}
        </h2>
      </Card>
      <Card>
        <p style={{ color: colors.textMuted, fontSize: 14, marginBottom: 8 }}>총 지출</p>
        <h2 style={{ color: colors.text, fontSize: 32, fontWeight: "bold" }}>
          {loading ? "-" : totalExpense}
        </h2>
      </Card>
    </StatsGrid>
  );
};

export default StatsCards;
