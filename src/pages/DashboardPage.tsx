import React, { useState } from "react";
import styled from "styled-components";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import OverviewTab from "../components/dashboard/OverviewTab";
import GroupTab from "../components/dashboard/GroupTab";
import LogoutButton from "../components/LogoutButton";
import { Button, Container as PageContainer, colors } from "../styles/primitives";

// 컨테이너는 프리미티브 PageContainer 사용

const Tabs = styled.div`
  display: flex;
  border-bottom: 2px solid ${colors.border};
  margin-bottom: 16px;
`;

const TabButton = styled(Button)<{ $active: boolean }>`
  background: ${(p) => (p.$active ? colors.bgLighter : "transparent")};
  color: ${(p) => (p.$active ? colors.dark : colors.gray500)};
  border: none;
  border-bottom: 3px solid ${(p) => (p.$active ? colors.primaryStrong : "transparent")};
  padding: 12px 20px;
  font-size: 16px;
  font-weight: 600;
  &:hover {
    background: ${colors.bgSoft};
    color: ${colors.dark};
  }
`;

const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"overview" | "group">("overview");

  return (
    <PageContainer>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <DashboardHeader />
        <LogoutButton />
      </div>

      <Tabs>
        <TabButton
          $active={activeTab === "overview"}
          onClick={() => setActiveTab("overview")}
          $variant="outline"
        >
          요약
        </TabButton>
        <TabButton
          $active={activeTab === "group"}
          onClick={() => setActiveTab("group")}
          $variant="outline"
        >
          그룹
        </TabButton>
      </Tabs>

      {activeTab === "group" ? <GroupTab /> : <OverviewTab />}
    </PageContainer>
  );
};

export default DashboardPage;
