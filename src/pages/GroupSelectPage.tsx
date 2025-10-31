import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { fetchGroups, createNewGroup } from "../api/client";
import InviteAcceptor from "../components/InviteAcceptor";
import LogoutButton from "../components/LogoutButton";

const Container = styled.div`
  max-width: 720px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const Card = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const GroupSelectPage: React.FC = () => {
  const [groups, setGroups] = useState<Array<{ id: number; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");

  async function loadGroups() {
    try {
      const list = await fetchGroups();
      setGroups(list || []);
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    loadGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const enterGroup = (gid: number) => {
    localStorage.setItem("selectedGroupId", String(gid));
    window.location.href = "/dashboard";
  };

  const createGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      setLoading(true);
      const group = await createNewGroup(name.trim());
      const groupId = group?.id;
      if (groupId) {
        localStorage.setItem("selectedGroupId", String(groupId));
        window.location.href = "/dashboard";
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <LogoutButton />
      <h1 style={{ color: "#333", marginBottom: 12 }}>그룹 선택</h1>
      <p style={{ color: "#666", marginBottom: 20 }}>
        들어갈 그룹을 선택하거나 새 그룹을 생성하세요.
      </p>
      <Card>
        <h2 style={{ marginBottom: 12, color: "#333" }}>내 그룹</h2>
        {groups.length === 0 ? (
          <p style={{ color: "#999" }}>아직 속한 그룹이 없습니다.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {groups.map((g) => (
              <li
                key={g.id}
                style={{
                  padding: "10px 0",
                  display: "flex",
                  justifyContent: "space-between",
                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                <span style={{ color: "#333" }}>{g.name}</span>
                <button
                  onClick={() => enterGroup(g.id)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 8,
                    border: "1px solid #ddd",
                    background: "#fff",
                    cursor: "pointer",
                  }}
                >
                  들어가기
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div style={{ height: 20 }} />

      <Card>
        <h2 style={{ marginBottom: 12, color: "#333" }}>새 그룹 생성</h2>
        <form onSubmit={createGroup}>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="그룹명 입력"
              style={{
                flex: 1,
                padding: 10,
                border: "1px solid #ddd",
                borderRadius: 8,
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "10px 16px",
                borderRadius: 8,
                background: "#667eea",
                color: "#fff",
                border: "none",
                cursor: "pointer",
              }}
            >
              {loading ? "생성 중..." : "생성"}
            </button>
          </div>
          <p style={{ color: "#999", marginTop: 8 }}>
            생성자는 자동으로 관리자 권한이 부여됩니다.
          </p>
        </form>
      </Card>

      <div style={{ height: 20 }} />

      <Card>
        <h2 style={{ marginBottom: 12, color: "#333" }}>초대 코드로 참여</h2>
        <InviteAcceptor
          onAccepted={async (gid) => {
            await loadGroups();
            enterGroup(gid);
          }}
        />
      </Card>
    </Container>
  );
};

export default GroupSelectPage;
