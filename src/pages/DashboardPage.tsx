import React, { useState } from "react";
import styled from "styled-components";
import DashboardHeader from "../components/DashboardHeader";
import OverviewTab from "./dashboard/OverviewTab";
import GroupTab from "./dashboard/GroupTab";

const DashboardContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"overview" | "group">("overview");

  return (
    <DashboardContainer>
      <DashboardHeader
        onLogout={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          window.location.href = "/";
        }}
      />

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button
          onClick={() => setActiveTab("overview")}
          style={{
            padding: "6px 10px",
            borderRadius: 8,
            border: "1px solid #ddd",
            background: activeTab === "overview" ? "#eef2ff" : "#fff",
            cursor: "pointer",
          }}
        >
          요약
        </button>
        <button
          onClick={() => setActiveTab("group")}
          style={{
            padding: "6px 10px",
            borderRadius: 8,
            border: "1px solid #ddd",
            background: activeTab === "group" ? "#eef2ff" : "#fff",
            cursor: "pointer",
          }}
        >
          그룹
        </button>
      </div>

      {activeTab === "group" ? <GroupTab /> : <OverviewTab />}
    </DashboardContainer>
  );
};

export default DashboardPage;
