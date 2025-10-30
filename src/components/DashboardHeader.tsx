import React from "react";

type Props = {
  onLogout: () => void;
};

const DashboardHeader: React.FC<Props> = ({ onLogout }) => {
  return (
    <div style={{ marginBottom: 32 }}>
      <h1 style={{ color: "#333", fontSize: 32, marginBottom: 8 }}>대시보드</h1>
      <p style={{ color: "#666", fontSize: 16 }}>
        실시간 재정 현황을 확인하세요
      </p>
      <div style={{ marginTop: 8 }}>
        <button
          onClick={onLogout}
          style={{
            padding: "6px 10px",
            background: "#ef4444",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          로그아웃
        </button>
      </div>
    </div>
  );
};

export default DashboardHeader;
