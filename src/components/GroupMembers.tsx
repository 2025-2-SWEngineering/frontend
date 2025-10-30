import React, { useEffect, useState } from "react";
import api from "../services/api";
import { fetchGroupMembers } from "../api/client";

type Member = { user_id: number; user_name: string; role: "admin" | "member" };

type Props = {
  groupId: number;
  isAdmin: boolean;
};

const GroupMembers: React.FC<Props> = ({ groupId, isAdmin }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [saving, setSaving] = useState<number | null>(null);

  async function load() {
    const membersList = await fetchGroupMembers(groupId);
    setMembers(membersList || []);
  }

  useEffect(() => {
    if (!groupId) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  const changeRole = async (m: Member, next: "admin" | "member") => {
    if (!isAdmin) return;
    if (m.role === next) return;
    try {
      setSaving(m.user_id);
      await api.put(`/groups/${groupId}/members/${m.user_id}/role`, { role: next });
      await load();
    } catch (err: unknown) {
      const axiosLike = err as { response?: { data?: { message?: string } } };
      alert(axiosLike.response?.data?.message || "역할 변경에 실패했습니다.");
    } finally {
      setSaving(null);
    }
  };

  if (!groupId) return null;

  return (
    <div style={{ background: "white", padding: 24, borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
      <h2 style={{ marginBottom: 12, color: "#333" }}>그룹 멤버</h2>
      {members.length === 0 ? (
        <p style={{ color: "#999" }}>멤버가 없습니다.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: 8, color: "#666", borderBottom: "1px solid #eee" }}>이름</th>
              <th style={{ textAlign: "right", padding: 8, color: "#666", borderBottom: "1px solid #eee" }}>역할</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.user_id}>
                <td style={{ padding: 8, borderBottom: "1px solid #f6f6f6" }}>{m.user_name}</td>
                <td style={{ padding: 8, borderBottom: "1px solid #f6f6f6", textAlign: "right" }}>
                  {isAdmin ? (
                    <select
                      value={m.role}
                      onChange={(e) => changeRole(m, e.target.value as "admin" | "member")}
                      disabled={saving === m.user_id}
                      style={{ padding: 8, border: "1px solid #ddd", borderRadius: 8 }}
                    >
                      <option value="member">member</option>
                      <option value="admin">admin</option>
                    </select>
                  ) : (
                    <span style={{ color: "#333" }}>{m.role}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default GroupMembers;


