import React from "react";
import styled from "styled-components";
import { GroupSelector, InviteAcceptor, PreferencesToggle } from "../shared";
import { Button, media } from "../../styles/primitives";

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
    <ControlsWrapper>
      <LeftGroup>
        <GroupSelector
          groups={groups}
          groupId={groupId}
          onChange={onChangeGroup}
          isAdmin={isAdmin}
          compact
        />
        <InviteAcceptor onAccepted={onAcceptedInvite} />
      </LeftGroup>
      <RightGroup>
        <PreferencesToggle
          checked={!!prefs?.receive_dues_reminders}
          onToggle={onTogglePrefs}
          compact
        />
        {groupId && isAdmin && <Button onClick={onOpenCategory}>카테고리 설정</Button>}
      </RightGroup>
    </ControlsWrapper>
  );
};

const ControlsWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;

  ${media.mobile} {
    flex-direction: column;
    align-items: stretch;
  }
`;

const LeftGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  flex: 1;

  ${media.mobile} {
    width: 100%;
  }
`;

const RightGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;

  ${media.mobile} {
    width: 100%;
    justify-content: space-between;
  }
`;

export default OverviewHeaderControls;
