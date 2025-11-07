import React, { useState } from "react";
import styled from "styled-components";
import api from "../services/api";
import { Input, Button } from "../styles/primitives";
import { notifyError } from "../utils/notify";

const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const LoginBox = styled.div`
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 8px;
  font-size: 28px;
`;

const Subtitle = styled.p`
  color: #666;
  margin-bottom: 32px;
`;

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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
      window.location.href = "/groups";
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "로그인에 실패했습니다.";
      notifyError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LoginBox>
        <Title>우리회계</Title>
        <Subtitle>소규모 조직을 위한 회계 관리</Subtitle>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{ display: "block", marginBottom: "8px", color: "#333" }}
            >
              이메일
            </label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div style={{ marginBottom: "24px" }}>
            <label
              style={{ display: "block", marginBottom: "8px", color: "#333" }}
            >
              비밀번호
            </label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" disabled={loading} style={{ width: "100%", padding: 12, fontSize: 16 }}>
            {loading ? "로그인 중..." : "로그인"}
          </Button>
        </form>
        <div style={{ marginTop: 16, textAlign: "center" }}>
          <a href="/register" style={{ color: "#667eea" }}>
            계정이 없으신가요? 회원가입
          </a>
        </div>
      </LoginBox>
    </LoginContainer>
  );
};

export default LoginPage;
