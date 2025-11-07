import React, { useState } from "react";
import styled from "styled-components";
import api from "../services/api";
import { notifyError } from "../utils/notify";
import { Input, Button, colors, media } from "../styles/primitives";

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 16px;
  background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%);
`;

const Box = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 420px;

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
  margin-bottom: 24px;
  font-size: 14px;

  ${media.desktop} {
    font-size: 16px;
  }
`;

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
      notifyError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Box>
        <Title>회원가입</Title>
        <Subtitle>우리회계에 오신 것을 환영합니다</Subtitle>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 8, color: colors.text }}>이름</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 8, color: colors.text }}>이메일</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", marginBottom: 8, color: colors.text }}>
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
            {loading ? "가입 중..." : "가입하기"}
          </Button>
          <div style={{ marginTop: 16, textAlign: "center" }}>
            <a href="/" style={{ color: colors.primary }}>
              이미 계정이 있으신가요? 로그인
            </a>
          </div>
        </form>
      </Box>
    </Container>
  );
};

export default RegisterPage;
