import React, { useState } from "react";
import styled from "styled-components";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import OverviewTab from "../components/dashboard/OverviewTab";
import GroupTab from "../components/dashboard/GroupTab";
import LogoutButton from "../components/LogoutButton";
import { Button, Container as PageContainer, colors, media } from "../styles/primitives";

// 컨테이너는 프리미티브 PageContainer 사용

const HeaderWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  gap: 12px;

  ${media.mobile} {
    flex-direction: column;
    gap: 16px;
  }
`;

const Tabs = styled.div`
  display: flex;
  border-bottom: 2px solid ${colors.border};
  margin-bottom: 16px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
`;

const TabButton = styled(Button)<{ $active: boolean }>`
  background: ${(p) => (p.$active ? colors.bgLighter : "transparent")};
  color: ${(p) => (p.$active ? colors.dark : colors.gray500)};
  border: none;
  border-bottom: 3px solid ${(p) => (p.$active ? colors.primaryStrong : "transparent")};
  padding: 12px 20px;
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
  min-height: 44px;

  ${media.mobile} {
    padding: 12px 16px;
    font-size: 15px;
    flex: 1;
  }

  &:hover {
    background: ${colors.bgSoft};
    color: ${colors.dark};
  }
`;

const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"overview" | "group">("overview");

  return (
    <PageContainer>
      <HeaderWrapper>
        <DashboardHeader />
        <LogoutButton />
      </HeaderWrapper>

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
