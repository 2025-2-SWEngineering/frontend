import React, { useEffect, useState } from "react";
import { fetchGroups, deleteGroupApi, leaveGroupApi } from "../../api/client";
import { isAdminFor } from "../../utils/group";
import GroupSelector from "../GroupSelector";
import GroupMembers from "../GroupMembers";

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
          saved &&
          (groupsList as Array<GroupWithRole>).some((g) => g.id === saved)
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
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          {isAdminFor(groups, groupId) ? (
            <button
              onClick={async () => {
                if (!groupId) return;
                const ok = confirm(
                  "정말로 이 그룹을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
                );
                if (!ok) return;
                try {
                  await deleteGroupApi(groupId);
                  const list = await fetchGroups();
                  setGroups(list);
                  const next = list[0]?.id ?? null;
                  setGroupId(next);
                } catch (e) {
                  alert("그룹 삭제에 실패했습니다.");
                }
              }}
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                border: "1px solid #ef4444",
                color: "#ef4444",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              그룹 삭제
            </button>
          ) : (
            <button
              onClick={async () => {
                if (!groupId) return;
                const ok = confirm("이 그룹에서 탈퇴하시겠습니까?");
                if (!ok) return;
                try {
                  await leaveGroupApi(groupId);
                  const list = await fetchGroups();
                  setGroups(list);
                  const next = list[0]?.id ?? null;
                  setGroupId(next);
                } catch (e) {
                  alert("그룹 탈퇴에 실패했습니다.");
                }
              }}
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                border: "1px solid #ddd",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              그룹 탈퇴
            </button>
          )}
        </div>
      )}
      {groupId && (
        <GroupMembers groupId={groupId} isAdmin={isAdminFor(groups, groupId)} />
      )}
    </>
  );
};

export default GroupTab;
