import React from "react";

type Props = {
  loading: boolean;
  currentBalance: string;
  totalIncome: string;
  totalExpense: string;
};

const cardStyle: React.CSSProperties = {
  background: "white",
  padding: 24,
  borderRadius: 12,
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
};

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
      <div style={cardStyle}>
        <p style={{ color: "#666", fontSize: 14, marginBottom: 8 }}>
          현재 잔액
        </p>
        <h2 style={{ color: "#333", fontSize: 32, fontWeight: "bold" }}>
          {loading ? "-" : currentBalance}
        </h2>
      </div>
      <div style={cardStyle}>
        <p style={{ color: "#666", fontSize: 14, marginBottom: 8 }}>총 수입</p>
        <h2 style={{ color: "#333", fontSize: 32, fontWeight: "bold" }}>
          {loading ? "-" : totalIncome}
        </h2>
      </div>
      <div style={cardStyle}>
        <p style={{ color: "#666", fontSize: 14, marginBottom: 8 }}>총 지출</p>
        <h2 style={{ color: "#333", fontSize: 32, fontWeight: "bold" }}>
          {loading ? "-" : totalExpense}
        </h2>
      </div>
    </div>
  );
};

export default StatsCards;
