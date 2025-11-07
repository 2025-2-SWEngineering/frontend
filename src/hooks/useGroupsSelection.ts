import React from "react";
import { fetchGroups } from "../api/client";

type GroupWithRole = { id: number; name: string; user_role?: "admin" | "member" };

export function useGroupsSelection() {
  const [groups, setGroups] = React.useState<Array<GroupWithRole>>([]);
  const [groupId, setGroupId] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(true);

  const reload = React.useCallback(async () => {
    const list = await fetchGroups();
    setGroups(list || []);
    return list || [];
  }, []);

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const groupsList = await reload();
        const saved = Number(localStorage.getItem("selectedGroupId") || 0);
        const first = (groupsList || [])[0]?.id ?? null;
        const gid = saved && (groupsList as Array<GroupWithRole>).some((g) => g.id === saved) ? saved : first;
        if (gid) setGroupId(gid);
      } finally {
        setLoading(false);
      }
    })();
  }, [reload]);

  const changeGroup = React.useCallback((gid: number) => {
    setGroupId(gid);
    localStorage.setItem("selectedGroupId", String(gid));
  }, []);

  return { groups, groupId, setGroupId: changeGroup, reloadGroups: reload, loading } as const;
}


