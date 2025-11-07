import React from "react";
import { Button } from "../styles/primitives";

const LogoutButton: React.FC = () => {
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("selectedGroupId");
    window.location.href = "/";
  };

  return (
    <Button $variant="danger" onClick={handleLogout}>
      로그아웃
    </Button>
  );
};

export default LogoutButton;


