import React, { useState } from "react";
import styled from "styled-components";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import OverviewTab from "../components/dashboard/OverviewTab";
import GroupTab from "../components/dashboard/GroupTab";
import LogoutButton from "../components/LogoutButton";

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

const Tab = styled.button<{ $active: boolean }>`
  appearance: none;
  background: ${(p) => (p.$active ? "#f8fafc" : "transparent")};
  color: ${(p) => (p.$active ? "#111827" : "#6b7280")};
  border: none;
  border-bottom: 3px solid ${(p) => (p.$active ? "#4f46e5" : "transparent")};
  padding: 12px 20px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  &:hover {
    background: #f3f4f6;
    color: #111827;
  }
`;

const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"overview" | "group">("overview");

  return (
    <DashboardContainer>
      <LogoutButton />
      <DashboardHeader />

      <Tabs>
        <Tab
          $active={activeTab === "overview"}
          onClick={() => setActiveTab("overview")}
        >
          요약
        </Tab>
        <Tab
          $active={activeTab === "group"}
          onClick={() => setActiveTab("group")}
        >
          그룹
        </Tab>
      </Tabs>

      {activeTab === "group" ? <GroupTab /> : <OverviewTab />}
    </DashboardContainer>
  );
};

export default DashboardPage;
