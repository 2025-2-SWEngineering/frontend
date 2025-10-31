import React from "react";

const LogoutButton: React.FC = () => {
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("selectedGroupId");
    window.location.href = "/";
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        padding: "8px 12px",
        background: "#ef4444",
        color: "#fff",
        border: "none",
        borderRadius: 8,
        cursor: "pointer",
        boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
      }}
    >
      로그아웃
    </button>
  );
};

export default LogoutButton;


