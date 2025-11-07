import React, { useEffect, useState } from "react";
import api from "../services/api";
import { fetchGroupMembers, kickMemberApi } from "../api/client";
import { Card, Table, Th, Td, Button } from "../styles/primitives";

type Member = { user_id: number; user_name: string; role: "admin" | "member" };

type Props = {
  groupId: number;
  isAdmin: boolean;
};

const GroupMembers: React.FC<Props> = ({ groupId, isAdmin }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [saving, setSaving] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const membersList = await fetchGroupMembers(groupId);
      setMembers(membersList || []);
    } finally {
      setLoading(false);
    }
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
    <Card>
      <h2 style={{ marginBottom: 12, color: "#333" }}>그룹 멤버</h2>
      {loading ? (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px", gap: 12, paddingBottom: 12, borderBottom: "1px solid #eee", marginBottom: 8 }}>
            <div style={{ width: 120, height: 18, background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: 8 }} />
            <div style={{ width: 80, height: 18, background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: 8, justifySelf: "end" }} />
            {isAdmin && <div style={{ width: 80, height: 18, background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: 8, justifySelf: "end" }} />}
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px", gap: 12, padding: "8px 0", borderBottom: "1px solid #f6f6f6" }}>
              <div style={{ height: 16, background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: 8 }} />
              <div style={{ height: 16, width: 80, background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: 8, justifySelf: "end" }} />
              {isAdmin && <div style={{ height: 16, width: 80, background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: 8, justifySelf: "end" }} />}
            </div>
          ))}
        </div>
      ) : members.length === 0 ? (
        <p style={{ color: "#999" }}>멤버가 없습니다.</p>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th style={{ textAlign: "left" }}>이름</Th>
              <Th style={{ textAlign: "right" }}>역할</Th>
              {isAdmin && <Th style={{ textAlign: "right", width: 100 }}>관리</Th>}
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.user_id}>
                <Td>{m.user_name}</Td>
                <Td style={{ textAlign: "right" }}>
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
                </Td>
                {isAdmin && (
                  <Td style={{ textAlign: "right" }}>
                    <Button
                      $variant="outline"
                      onClick={async () => {
                        if (!groupId) return;
                        const ok = confirm(`정말 ${m.user_name} 님을 추방하시겠습니까?`);
                        if (!ok) return;
                        try {
                          setSaving(m.user_id);
                          await kickMemberApi(groupId, m.user_id);
                          await load();
                        } catch (err: unknown) {
                          const axiosLike = err as { response?: { data?: { message?: string } } };
                          alert(axiosLike.response?.data?.message || "추방에 실패했습니다.");
                        } finally {
                          setSaving(null);
                        }
                      }}
                      disabled={saving === m.user_id}
                      style={{ color: "#ef4444", borderColor: "#ef4444" }}
                    >
                      추방
                    </Button>
                  </Td>
                )}
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Card>
  );
};

export default GroupMembers;


