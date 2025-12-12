import React, { useState } from "react";
import api from "../services/api";
import logo from "../assets/logo.png";
import "./RegisterPage.css";

const RegisterPage: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    try {
      setLoading(true);
      const { data } = await api.post("/auth/register", {
        name,
        email,
        password,
      });
      localStorage.setItem("token", data.token);
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "/groups";
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "회원가입에 실패했습니다.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <img src={logo} alt="우리회계 로고" className="register-logo" />
      <p className="register-subtitle">우리회계에 오신 것을 환영합니다</p>

      <form className="register-form" onSubmit={handleSubmit}>
        <input
          className="register-input"
          placeholder="이름 입력"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className="register-input"
          type="email"
          placeholder="이메일 입력"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="register-input"
          type="password"
          placeholder="비밀번호 입력"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="register-button" type="submit" disabled={loading}>
          {loading ? "가입 중..." : "가입하기"}
        </button>
      </form>

      <div className="footer-links">
        <a href="/">이미 계정이 있으신가요? 로그인</a>
      </div>
    </div>
  );
};

export default RegisterPage;
