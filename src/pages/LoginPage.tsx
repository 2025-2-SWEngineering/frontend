import React, { useState } from "react";
import api from "../services/api";
import { initFcm } from "../initFcm";
import logo from "../assets/logo.png";
import LoadingPage from "./LoadingPage";
import "./LoginPage.css";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    try {
      setLoading(true);
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }
      localStorage.setItem("user", JSON.stringify(data.user));

      // Show loading screen before navigating
      setShowLoadingScreen(true);

      // Initialize FCM now that tokens are stored. Don't block navigation on failure.
      (async () => {
        try {
          await initFcm();
        } catch (e) {
          console.warn("[FCM] init after login failed", e);
        }
      })();

      // Simulate a short delay for the loading screen to be visible
      setTimeout(() => {
        window.location.href = "/groups";
      }, 1500);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "로그인에 실패했습니다.";
      alert(msg);
      setLoading(false);
    }
  };

  if (showLoadingScreen) {
    return <LoadingPage />;
  }

  return (
    <div className="login-container">
      <img src={logo} alt="우리회계 로고" className="login-logo" />
      <p className="login-subtitle">소규모 조직을 위한 회계 관리, 우리회계.</p>

      <form className="login-form" onSubmit={handleSubmit}>
        <input
          className="login-input"
          type="email"
          placeholder="이메일 입력"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="login-input"
          type="password"
          placeholder="비밀번호 입력"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="login-button" type="submit" disabled={loading}>
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </form>

      <div className="footer-links">
        <a href="/find-id">아이디 찾기</a>
        <span>|</span>
        <a href="/find-password">비밀번호 찾기</a>
        <span>|</span>
        <a href="/register">회원가입</a>
      </div>

      <div className="sns-section">
        <div className="sns-label">SNS 계정으로 로그인</div>
        <div className="sns-icons">
          <div className="sns-circle" />
          <div className="sns-circle" />
          <div className="sns-circle" />
          <div className="sns-circle" />
          <div className="sns-circle" />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
