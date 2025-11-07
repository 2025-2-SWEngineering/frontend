import React from "react";
import GroupSelector from "../shared/GroupSelector";
import InviteAcceptor from "../shared/InviteAcceptor";
import PreferencesToggle from "../shared/PreferencesToggle";
import { Button } from "../../styles/primitives";

type GroupWithRole = {
  id: number;
  name: string;
  user_role?: "admin" | "member";
};

type Props = {
  groups: Array<GroupWithRole>;
  groupId: number | null;
  isAdmin: boolean;
  prefs: { receive_dues_reminders: boolean } | null;
  onChangeGroup: (gid: number) => void;
  onAcceptedInvite: (gid: number) => void;
  onTogglePrefs: (next: boolean) => void | Promise<void>;
  onOpenCategory: () => void;
};

const OverviewHeaderControls: React.FC<Props> = ({
  groups,
  groupId,
  isAdmin,
  prefs,
  onChangeGroup,
  onAcceptedInvite,
  onTogglePrefs,
  onOpenCategory,
}) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <GroupSelector
          groups={groups}
          groupId={groupId}
          onChange={onChangeGroup}
          isAdmin={isAdmin}
          compact
        />
        <InviteAcceptor onAccepted={onAcceptedInvite} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <PreferencesToggle
          checked={!!prefs?.receive_dues_reminders}
          onToggle={onTogglePrefs}
          compact
        />
        {groupId && isAdmin && (
          <Button onClick={onOpenCategory}>카테고리 설정</Button>
        )}
      </div>
    </div>
  );
};

export default OverviewHeaderControls;


