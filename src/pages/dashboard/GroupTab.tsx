import React, { useEffect, useState } from "react";
import { fetchGroups } from "../../api/client";
import { isAdminFor } from "../../utils/group";
import GroupSelector from "../../components/GroupSelector";
import GroupMembers from "../../components/GroupMembers";

type GroupWithRole = {
  id: number;
  name: string;
  user_role?: "admin" | "member";
};

const GroupTab: React.FC = () => {
  const [groups, setGroups] = useState<Array<GroupWithRole>>([]);
  const [groupId, setGroupId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const groupsList = await fetchGroups();
        setGroups(groupsList);
        const saved = Number(localStorage.getItem("selectedGroupId") || 0);
        const first = (groupsList || [])[0]?.id ?? null;
        const gid =
          saved && (groupsList as Array<GroupWithRole>).some((g) => g.id === saved)
            ? saved
            : first;
        if (gid) setGroupId(gid);
      } catch {
        // ignore
      }
    })();
  }, []);

  useEffect(() => {
    if (!groupId) return;
    localStorage.setItem("selectedGroupId", String(groupId));
  }, [groupId]);

  return (
    <>
      <GroupSelector
        groups={groups}
        groupId={groupId}
        onChange={(gid) => setGroupId(gid)}
        isAdmin={isAdminFor(groups, groupId)}
      />
      <div style={{ height: 12 }} />
      {groupId && (
        <GroupMembers groupId={groupId} isAdmin={isAdminFor(groups, groupId)} />
      )}
    </>
  );
};

export default GroupTab;


