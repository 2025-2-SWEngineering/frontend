import React, { useState } from "react";
import styled from "styled-components";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import OverviewTab from "../components/dashboard/OverviewTab";
import GroupTab from "../components/dashboard/GroupTab";
import LogoutButton from "../components/LogoutButton";
import { Button } from "../styles/primitives";

const DashboardContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const Tabs = styled.div`
  display: flex;
  border-bottom: 2px solid #e5e7eb;
  margin-bottom: 16px;
`;

const TabButton = styled(Button)<{ $active: boolean }>`
  background: ${(p) => (p.$active ? "#f8fafc" : "transparent")};
  color: ${(p) => (p.$active ? "#111827" : "#6b7280")};
  border: none;
  border-bottom: 3px solid ${(p) => (p.$active ? "#4f46e5" : "transparent")};
  padding: 12px 20px;
  font-size: 16px;
  font-weight: 600;
`;

const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"overview" | "group">("overview");

  return (
    <DashboardContainer>
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
        <TabButton $active={activeTab === "overview"} onClick={() => setActiveTab("overview")} $variant="outline">
          요약
        </TabButton>
        <TabButton $active={activeTab === "group"} onClick={() => setActiveTab("group")} $variant="outline">
          그룹
        </TabButton>
      </Tabs>

      {activeTab === "group" ? <GroupTab /> : <OverviewTab />}
    </DashboardContainer>
  );
};

export default DashboardPage;
