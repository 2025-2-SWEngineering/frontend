import React from "react";
import InviteCodeGenerator from "./InviteCodeGenerator";

type Group = { id: number; name: string; user_role?: string };

type Props = {
  groups: Array<Group>;
  groupId: number | null;
  onChange: (groupId: number) => void;
  isAdmin: boolean;
};

const GroupSelector: React.FC<Props> = ({
  groups,
  groupId,
  onChange,
  isAdmin,
}) => {
  return (
    <div style={{ marginTop: 12 }}>
      <label style={{ marginRight: 8, color: "#666" }}>그룹</label>
      <select
        value={groupId ?? ""}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ padding: 8, borderRadius: 8, border: "1px solid #ddd" }}
      >
        {groups.map((g) => (
          <option key={g.id} value={g.id}>
            {g.name}
          </option>
        ))}
      </select>
      {isAdmin && groupId && (
        <span style={{ marginLeft: 10 }}>
          <InviteCodeGenerator groupId={groupId} />
        </span>
      )}
    </div>
  );
};

export default GroupSelector;
