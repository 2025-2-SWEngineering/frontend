import React from "react";

type Props = {
  checked: boolean;
  onToggle: (next: boolean) => void;
  compact?: boolean;
};

const PreferencesToggle: React.FC<Props> = ({ checked, onToggle, compact }) => {
  return (
    <div style={{ marginTop: compact ? 0 : 8, display: "inline-flex", alignItems: "center" }}>
      <label style={{ color: "#666" }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onToggle(e.target.checked)}
          style={{ marginRight: 8, width: 16, height: 16 }}
        />
        회비 미납 자동 알림 수신
      </label>
    </div>
  );
};

export default PreferencesToggle;
