import React from "react";

type Props = {
  checked: boolean;
  onToggle: (next: boolean) => void;
};

const PreferencesToggle: React.FC<Props> = ({ checked, onToggle }) => {
  return (
    <div style={{ marginTop: 8 }}>
      <label style={{ color: "#666" }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onToggle(e.target.checked)}
          style={{ marginRight: 8 }}
        />
        회비 미납 자동 알림 수신
      </label>
    </div>
  );
};

export default PreferencesToggle;
