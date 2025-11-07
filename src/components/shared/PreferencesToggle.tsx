import React from "react";
import styled from "styled-components";

type Props = {
  checked: boolean;
  onToggle: (next: boolean) => void;
  compact?: boolean;
};

const PreferencesToggle: React.FC<Props> = ({ checked, onToggle, compact }) => {
  return (
    <div style={{ marginTop: compact ? 0 : 8, display: "inline-flex", alignItems: "center" }}>
      <Label>
        <Checkbox type="checkbox" checked={checked} onChange={(e) => onToggle(e.target.checked)} />
        회비 미납 자동 알림 수신
      </Label>
    </div>
  );
};

export default PreferencesToggle;

const Label = styled.label`
  color: #666;
  display: inline-flex;
  align-items: center;
`;

const Checkbox = styled.input`
  margin-right: 8px;
  width: 16px;
  height: 16px;
`;
