import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Button, colors, media } from "../../styles/primitives";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 이미 설치되어 있는지 확인
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // 설치 프롬프트 이벤트 리스너
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // 로컬 스토리지에서 이전에 거부했는지 확인
      const dismissed = localStorage.getItem("pwa-install-dismissed");
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowPrompt(false);
      setDeferredPrompt(null);
    } else {
      // 사용자가 거부한 경우 24시간 동안 다시 표시하지 않음
      localStorage.setItem("pwa-install-dismissed", Date.now().toString());
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("pwa-install-dismissed", Date.now().toString());
    setShowPrompt(false);
  };

  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <PromptContainer>
      <PromptContent>
        <PromptText>
          <PromptTitle>앱 설치</PromptTitle>
          <PromptDescription>우리회계를 홈 화면에 추가하여 더 빠르게 접근하세요.</PromptDescription>
        </PromptText>
        <PromptActions>
          <Button onClick={handleInstall} style={{ minWidth: 80 }}>
            설치
          </Button>
          <DismissButton onClick={handleDismiss}>나중에</DismissButton>
        </PromptActions>
      </PromptContent>
    </PromptContainer>
  );
};

const PromptContainer = styled.div`
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  width: calc(100% - 32px);
  max-width: 400px;

  ${media.mobile} {
    bottom: 16px;
    width: calc(100% - 24px);
  }
`;

const PromptContent = styled.div`
  background: ${colors.white};
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const PromptText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const PromptTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: ${colors.text};
`;

const PromptDescription = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${colors.textMuted};
  line-height: 1.4;
`;

const PromptActions = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
`;

const DismissButton = styled.button`
  padding: 10px 16px;
  border: 1px solid ${colors.border};
  border-radius: 8px;
  background: ${colors.white};
  color: ${colors.text};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  min-height: 44px;
  transition: background 0.2s ease;

  &:hover {
    background: ${colors.bgSoft};
  }

  &:active {
    opacity: 0.8;
  }
`;

export default PWAInstallPrompt;
