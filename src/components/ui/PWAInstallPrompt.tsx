import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Button, colors, media } from "../../styles/primitives";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

// 모바일 기기 감지
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// iOS 감지
const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

// Android Chrome 감지
const isAndroidChrome = () => {
  return /Android/.test(navigator.userAgent) && /Chrome/.test(navigator.userAgent);
};

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    // 이미 설치되어 있는지 확인
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    const mobile = isMobile();
    setIsMobileDevice(mobile);

    // 데스크톱: beforeinstallprompt 이벤트 사용
    if (!mobile) {
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        const dismissed = localStorage.getItem("pwa-install-dismissed");
        if (!dismissed) {
          setShowPrompt(true);
        }
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

      return () => {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      };
    } else {
      // 모바일: 로컬 스토리지 확인 후 안내 표시
      const dismissed = localStorage.getItem("pwa-install-dismissed");
      const dismissedTime = dismissed ? parseInt(dismissed, 10) : 0;
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;

      // 24시간이 지났거나 처음 방문한 경우
      if (!dismissed || now - dismissedTime > oneDay) {
        // 약간의 지연 후 표시 (사용자가 페이지를 본 후)
        const timer = setTimeout(() => {
          setShowPrompt(true);
        }, 3000);

        return () => clearTimeout(timer);
      }
    }
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

  if (isInstalled || !showPrompt) {
    return null;
  }

  // 모바일인 경우 설치 안내 메시지
  if (isMobileDevice && !deferredPrompt) {
    const getInstallInstructions = () => {
      if (isIOS()) {
        return {
          title: "홈 화면에 추가",
          description: "Safari에서 공유 버튼(□↑)을 누르고 '홈 화면에 추가'를 선택하세요.",
          steps: [
            "1. Safari 하단의 공유 버튼(□↑) 클릭",
            "2. '홈 화면에 추가' 선택",
            "3. 홈 화면에서 앱 실행",
          ],
        };
      } else if (isAndroidChrome()) {
        return {
          title: "홈 화면에 추가",
          description: "Chrome 메뉴에서 '홈 화면에 추가'를 선택하세요.",
          steps: [
            "1. Chrome 주소창 옆 메뉴(⋮) 클릭",
            "2. '홈 화면에 추가' 선택",
            "3. 홈 화면에서 앱 실행",
          ],
        };
      } else {
        return {
          title: "홈 화면에 추가",
          description: "브라우저 메뉴에서 '홈 화면에 추가' 또는 '앱 설치' 옵션을 찾아주세요.",
          steps: [],
        };
      }
    };

    const instructions = getInstallInstructions();

    return (
      <PromptContainer>
        <PromptContent>
          <PromptText>
            <PromptTitle>{instructions.title}</PromptTitle>
            <PromptDescription>{instructions.description}</PromptDescription>
            {instructions.steps.length > 0 && (
              <StepsList>
                {instructions.steps.map((step, index) => (
                  <StepItem key={index}>{step}</StepItem>
                ))}
              </StepsList>
            )}
          </PromptText>
          <PromptActions>
            <DismissButton onClick={handleDismiss}>확인</DismissButton>
          </PromptActions>
        </PromptContent>
      </PromptContainer>
    );
  }

  // 데스크톱: beforeinstallprompt 사용
  if (!deferredPrompt) {
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

const StepsList = styled.ul`
  margin: 12px 0 0 0;
  padding-left: 20px;
  list-style: decimal;
  color: ${colors.textMuted};
  font-size: 13px;
  line-height: 1.6;
`;

const StepItem = styled.li`
  margin-bottom: 4px;
`;

export default PWAInstallPrompt;
