import React from "react";
import { Card } from "../styles/primitives";

type Props = {
  loading: boolean;
  currentBalance: string;
  totalIncome: string;
  totalExpense: string;
};

// 카드 스타일은 공통 Card로 대체

const StatsCards: React.FC<Props> = ({
  loading,
  currentBalance,
  totalIncome,
  totalExpense,
}) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: 24,
        marginBottom: 20,
      }}
    >
      <Card>
        <p style={{ color: "#666", fontSize: 14, marginBottom: 8 }}>
          현재 잔액
        </p>
        <h2 style={{ color: "#333", fontSize: 32, fontWeight: "bold" }}>
          {loading ? "-" : currentBalance}
        </h2>
      </Card>
      <Card>
        <p style={{ color: "#666", fontSize: 14, marginBottom: 8 }}>총 수입</p>
        <h2 style={{ color: "#333", fontSize: 32, fontWeight: "bold" }}>
          {loading ? "-" : totalIncome}
        </h2>
      </Card>
      <Card>
        <p style={{ color: "#666", fontSize: 14, marginBottom: 8 }}>총 지출</p>
        <h2 style={{ color: "#333", fontSize: 32, fontWeight: "bold" }}>
          {loading ? "-" : totalExpense}
        </h2>
      </Card>
    </div>
  );
};

export default StatsCards;
