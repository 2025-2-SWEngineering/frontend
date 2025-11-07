import React from "react";
import { ModalBackdrop, ModalCard, colors } from "../../styles/primitives";

type Props = {
  visible: boolean;
  label?: string;
};

const LoadingOverlay: React.FC<Props> = ({ visible, label }) => {
  if (!visible) return null;
  return (
    <ModalBackdrop role="status" aria-live="polite">
      <style>
        {`
@keyframes spinnerRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
        `}
      </style>
      <ModalCard>
        <div style={{ marginBottom: 12, color: "#111827", fontWeight: 700 }}>
          {label || "로딩 중..."}
        </div>
        <div
          aria-hidden
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            paddingTop: 4,
            paddingBottom: 4,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              border: `4px solid ${colors.border}`,
              borderTopColor: colors.primary,
              animation: "spinnerRotate 0.9s linear infinite",
            }}
          />
        </div>
      </ModalCard>
    </ModalBackdrop>
  );
};

export default LoadingOverlay;
