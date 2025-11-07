import React from "react";
import { Select, Button } from "../../styles/primitives";
import InviteCodeGenerator from "./InviteCodeGenerator";

type Group = { id: number; name: string; user_role?: string };

type Props = {
  groups: Array<Group>;
  groupId: number | null;
  onChange: (groupId: number) => void;
  isAdmin: boolean;
  compact?: boolean;
};

const GroupSelector: React.FC<Props> = ({
  groups,
  groupId,
  onChange,
  isAdmin,
  compact,
}) => {
  return (
    <div style={{ marginTop: compact ? 0 : 12, display: "inline-flex", alignItems: "center" }}>
      <label style={{ marginRight: 8, color: "#666" }}>그룹</label>
      <Select
        value={groupId ?? ""}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        {groups.map((g) => (
          <option key={g.id} value={g.id}>
            {g.name}
          </option>
        ))}
      </Select>
      {isAdmin && groupId && (
        <span style={{ marginLeft: 10 }}>
          <InviteCodeGenerator groupId={groupId} />
        </span>
      )}
    </div>
  );
};

export default GroupSelector;
