import React from "react";
import { Button } from "../styles/primitives";

const LogoutButton: React.FC = () => {
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("selectedGroupId");
    // Clear stored FCM registration marker so next login can re-register if needed
    try {
      localStorage.removeItem("fcm_registered_token");
    } catch {
      void 0;
    }
    window.location.href = "/";
  };

  return (
    <Button $variant="danger" onClick={handleLogout}>
      로그아웃
    </Button>
  );
};

export default LogoutButton;
