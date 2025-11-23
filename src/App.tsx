import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import styled from "styled-components";
import { colors } from "./styles/primitives";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import RegisterPage from "./pages/RegisterPage";
import GroupSelectPage from "./pages/GroupSelectPage";
import MemberManagementPage from "./pages/MemberManagementPage";
import "./App.css";
import { GlobalLoadingOverlay } from "./components/ui";

const AppContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background-color: ${colors.bgPage};
`;

const App: React.FC = () => {
  return (
    <AppContainer>
      <GlobalLoadingOverlay />
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              localStorage.getItem("token") ? <Navigate to="/groups" replace /> : <LoginPage />
            }
          />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/groups"
            element={
              localStorage.getItem("token") ? <GroupSelectPage /> : <Navigate to="/" replace />
            }
          />
          <Route
            element={
              localStorage.getItem("token") ? (
                localStorage.getItem("selectedGroupId") ? (
                  <DashboardPage />
                ) : (
                  <Navigate to="/groups" replace />
                )
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/groups/:groupId/members"
            element={
              localStorage.getItem("token") ? <MemberManagementPage /> : <Navigate to="/" replace />
            }
          />
        </Routes>
      </Router>
    </AppContainer>
  );
};

export default App;
