import React from "react";

const DashboardHeader: React.FC = () => {
  return (
    <div style={{ marginBottom: 32 }}>
      <h1 style={{ color: "#333", fontSize: 32, marginBottom: 8 }}>대시보드</h1>
      <p style={{ color: "#666", fontSize: 16 }}>
        실시간 재정 현황을 확인하세요
      </p>
    </div>
  );
};

export default DashboardHeader;
