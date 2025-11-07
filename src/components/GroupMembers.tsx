import React, { useEffect, useState } from "react";
import styled from "styled-components";
import api from "../services/api";
import { fetchGroupMembers, kickMemberApi } from "../api/client";
import { Card, Table, Th, Td, Button, Select, colors, media } from "../styles/primitives";
import { notifyError, confirmAsync } from "../utils/notify";

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
      notifyError(axiosLike.response?.data?.message || "역할 변경에 실패했습니다.");
    } finally {
      setSaving(null);
    }
  };

  if (!groupId) return null;

  return (
    <Card>
      <h2 style={{ marginBottom: 12, color: colors.text }}>그룹 멤버</h2>
      {loading ? (
        <div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 100px",
              gap: 12,
              paddingBottom: 12,
              borderBottom: `1px solid ${colors.divider}`,
              marginBottom: 8,
            }}
          >
            <div
              style={{
                width: 120,
                height: 18,
                background: colors.bgSoft,
                border: `1px solid ${colors.border}`,
                borderRadius: 8,
              }}
            />
            <div
              style={{
                width: 80,
                height: 18,
                background: colors.bgSoft,
                border: `1px solid ${colors.border}`,
                borderRadius: 8,
                justifySelf: "end",
              }}
            />
            {isAdmin && (
              <div
                style={{
                  width: 80,
                  height: 18,
                  background: colors.bgSoft,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 8,
                  justifySelf: "end",
                }}
              />
            )}
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 100px",
                gap: 12,
                padding: "8px 0",
                borderBottom: `1px solid ${colors.bgSoft}`,
              }}
            >
              <div
                style={{
                  height: 16,
                  background: colors.bgSoft,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 8,
                }}
              />
              <div
                style={{
                  height: 16,
                  width: 80,
                  background: colors.bgSoft,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 8,
                  justifySelf: "end",
                }}
              />
              {isAdmin && (
                <div
                  style={{
                    height: 16,
                    width: 80,
                    background: colors.bgSoft,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 8,
                    justifySelf: "end",
                  }}
                />
              )}
            </div>
          ))}
        </div>
      ) : members.length === 0 ? (
        <p style={{ color: colors.muted }}>멤버가 없습니다.</p>
      ) : (
        <>
          <MembersTable>
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
                      <Select
                        value={m.role}
                        onChange={(e) => changeRole(m, e.target.value as "admin" | "member")}
                        disabled={saving === m.user_id}
                      >
                        <option value="member">member</option>
                        <option value="admin">admin</option>
                      </Select>
                    ) : (
                      <span style={{ color: colors.text }}>{m.role}</span>
                    )}
                  </Td>
                  {isAdmin && (
                    <Td style={{ textAlign: "right" }}>
                      <Button
                        $variant="outline"
                        onClick={async () => {
                          if (!groupId) return;
                          const ok = await confirmAsync(
                            `정말 ${m.user_name} 님을 추방하시겠습니까?`,
                          );
                          if (!ok) return;
                          try {
                            setSaving(m.user_id);
                            await kickMemberApi(groupId, m.user_id);
                            await load();
                          } catch (err: unknown) {
                            const axiosLike = err as { response?: { data?: { message?: string } } };
                            notifyError(
                              axiosLike.response?.data?.message || "추방에 실패했습니다.",
                            );
                          } finally {
                            setSaving(null);
                          }
                        }}
                        disabled={saving === m.user_id}
                        style={{ color: colors.danger, borderColor: colors.danger }}
                      >
                        추방
                      </Button>
                    </Td>
                  )}
                </tr>
              ))}
            </tbody>
          </MembersTable>
          <MembersListMobile>
            {members.map((m) => (
              <MemberCard key={m.user_id}>
                <MemberInfo>
                  <MemberName>{m.user_name}</MemberName>
                  <MemberRole>
                    {isAdmin ? (
                      <Select
                        value={m.role}
                        onChange={(e) => changeRole(m, e.target.value as "admin" | "member")}
                        disabled={saving === m.user_id}
                        style={{ width: "100%" }}
                      >
                        <option value="member">member</option>
                        <option value="admin">admin</option>
                      </Select>
                    ) : (
                      <span style={{ color: colors.text }}>{m.role}</span>
                    )}
                  </MemberRole>
                </MemberInfo>
                {isAdmin && (
                  <Button
                    $variant="outline"
                    onClick={async () => {
                      if (!groupId) return;
                      const ok = await confirmAsync(`정말 ${m.user_name} 님을 추방하시겠습니까?`);
                      if (!ok) return;
                      try {
                        setSaving(m.user_id);
                        await kickMemberApi(groupId, m.user_id);
                        await load();
                      } catch (err: unknown) {
                        const axiosLike = err as { response?: { data?: { message?: string } } };
                        notifyError(axiosLike.response?.data?.message || "추방에 실패했습니다.");
                      } finally {
                        setSaving(null);
                      }
                    }}
                    disabled={saving === m.user_id}
                    style={{ color: colors.danger, borderColor: colors.danger, width: "100%" }}
                  >
                    추방
                  </Button>
                )}
              </MemberCard>
            ))}
          </MembersListMobile>
        </>
      )}
    </Card>
  );
};

const MembersTable = styled(Table)`
  ${media.mobile} {
    display: none;
  }
`;

const MembersListMobile = styled.div`
  display: none;

  ${media.mobile} {
    display: block;
  }
`;

const MemberCard = styled.div`
  padding: 16px;
  border-bottom: 1px solid ${colors.border};
  display: flex;
  flex-direction: column;
  gap: 12px;

  &:last-child {
    border-bottom: none;
  }
`;

const MemberInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
`;

const MemberName = styled.div`
  font-weight: 600;
  color: ${colors.text};
`;

const MemberRole = styled.div`
  flex: 1;
  max-width: 150px;
`;

export default GroupMembers;
