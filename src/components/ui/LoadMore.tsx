import React from "react";
import { Button } from "../styles/primitives";

type Props = {
  visible: boolean;
  loading: boolean;
  onClick: () => void;
};

const LoadMore: React.FC<Props> = ({ visible, loading, onClick }) => {
  if (!visible) return null;
  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
      <Button $variant="outline" disabled={loading} onClick={onClick}>
        {loading ? "불러오는 중..." : "더보기"}
      </Button>
    </div>
  );
};

export default LoadMore;
