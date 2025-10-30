import React from "react";

type Props = {
  visible: boolean;
  loading: boolean;
  onClick: () => void;
};

const LoadMore: React.FC<Props> = ({ visible, loading, onClick }) => {
  if (!visible) return null;
  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
      <button
        disabled={loading}
        onClick={onClick}
        style={{
          padding: "8px 16px",
          borderRadius: 8,
          border: "1px solid #ddd",
          background: "#fff",
          cursor: "pointer",
        }}
      >
        {loading ? "불러오는 중..." : "더보기"}
      </button>
    </div>
  );
};

export default LoadMore;
