import React, { useEffect, useState } from "react";
import styled from "styled-components";
import {
  Card,
  Button,
  Input,
  Container as PageContainer,
} from "../styles/primitives";
import { fetchGroups, createNewGroup } from "../api/client";
import InviteAcceptor from "../components/InviteAcceptor";
import LogoutButton from "../components/LogoutButton";
import LoadingOverlay from "../components/LoadingOverlay";

// 컨테이너는 프리미티브 PageContainer 사용

const GroupSelectPage: React.FC = () => {
  const [groups, setGroups] = useState<Array<{ id: number; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [name, setName] = useState("");

  async function loadGroups() {
    try {
      setLoadingGroups(true);
      const list = await fetchGroups();
      setGroups(list || []);
    } catch {
      // ignore
    } finally {
      setLoadingGroups(false);
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
    <PageContainer>
      <LoadingOverlay
        visible={loadingGroups || loading}
        label={loading ? "그룹 생성 중..." : "그룹 불러오는 중..."}
      />
      <LogoutButton />
      <h1 style={{ color: "#333", marginBottom: 12 }}>그룹 선택</h1>
      <p style={{ color: "#666", marginBottom: 20 }}>
        들어갈 그룹을 선택하거나 새 그룹을 생성하세요.
      </p>
      <Card>
        <h2 style={{ marginBottom: 12, color: "#333" }}>내 그룹</h2>
        {loadingGroups ? (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <li
                key={i}
                style={{
                  padding: "10px 0",
                  display: "flex",
                  justifyContent: "space-between",
                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                <div
                  style={{
                    width: 160,
                    height: 18,
                    background: "#f3f4f6",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                  }}
                />
                <div
                  style={{
                    width: 80,
                    height: 28,
                    background: "#f3f4f6",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                  }}
                />
              </li>
            ))}
          </ul>
        ) : groups.length === 0 ? (
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
                <Button $variant="outline" onClick={() => enterGroup(g.id)}>
                  들어가기
                </Button>
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
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="그룹명 입력"
              style={{ flex: 1 }}
            />
            <Button type="submit" disabled={loading}>
              {loading ? "생성 중..." : "생성"}
            </Button>
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
    </PageContainer>
  );
};

export default GroupSelectPage;
