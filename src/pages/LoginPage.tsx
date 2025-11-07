import React, { useState } from "react";
import styled from "styled-components";
import api from "../services/api";
import { Input, Button, colors, media } from "../styles/primitives";
import { notifyError } from "../utils/notify";

const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 16px;
  background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%);
`;

const LoginBox = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;

  ${media.tablet} {
    padding: 32px;
  }

  ${media.desktop} {
    padding: 40px;
  }
`;

const Title = styled.h1`
  color: ${colors.text};
  margin-bottom: 8px;
  font-size: 24px;

  ${media.tablet} {
    font-size: 26px;
  }

  ${media.desktop} {
    font-size: 28px;
  }
`;

const Subtitle = styled.p`
  color: ${colors.textMuted};
  margin-bottom: 32px;
  font-size: 14px;

  ${media.desktop} {
    font-size: 16px;
  }
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
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "로그인에 실패했습니다.";
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
            <label style={{ display: "block", marginBottom: "8px", color: colors.text }}>
              이메일
            </label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", marginBottom: "8px", color: colors.text }}>
              비밀번호
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: 12, fontSize: 16 }}
          >
            {loading ? "로그인 중..." : "로그인"}
          </Button>
        </form>
        <div style={{ marginTop: 16, textAlign: "center" }}>
          <a href="/register" style={{ color: colors.primary }}>
            계정이 없으신가요? 회원가입
          </a>
        </div>
      </LoginBox>
    </LoginContainer>
  );
};

export default LoginPage;
