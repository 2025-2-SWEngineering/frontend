import React from "react";

type Props = {
  visible: boolean;
  label?: string;
};

const LoadingOverlay: React.FC<Props> = ({ visible, label }) => {
  if (!visible) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: 16,
      }}
    >
      <style>
        {`
@keyframes spinnerRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
        `}
      </style>
      <div
        style={{
          width: "min(420px, 96vw)",
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          padding: 20,
        }}
      >
        <div style={{ marginBottom: 12, color: "#111827", fontWeight: 700 }}>
          {label || "로딩 중..."}
        </div>
        <div aria-hidden style={{ display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 4, paddingBottom: 4 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              border: "4px solid #e5e7eb",
              borderTopColor: "#667eea",
              animation: "spinnerRotate 0.9s linear infinite",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;


