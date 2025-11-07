import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Card, Button, colors, media } from "../../styles/primitives";
import { fetchNotificationLogs, testDuesReminder } from "../../api/client";
import type { NotificationLogDTO, DuesReminderTestResult } from "../../types/api";
import { notifyError, notifySuccess, confirmAsync } from "../../utils/notify";
import { formatDisplayDateTime } from "../../utils/format";

type Props = {
  groupId: number;
};

const NotificationTest: React.FC<Props> = ({ groupId }) => {
  const [logs, setLogs] = useState<NotificationLogDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<DuesReminderTestResult[] | null>(null);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const logsData = await fetchNotificationLogs(groupId);
      setLogs(logsData);
    } catch (err) {
      notifyError("알림 로그를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (groupId) {
      loadLogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  const handleTest = async () => {
    if (!groupId) return;
    const ok = await confirmAsync(
      "회비 납부 알림을 테스트로 발송하시겠습니까?\n미납자가 있는 회원들에게 알림이 전송됩니다.",
    );
    if (!ok) return;

    try {
      setTesting(true);
      setTestResults(null);
      const result = await testDuesReminder(groupId);
      setTestResults(result.results);
      notifySuccess(`테스트 완료: ${result.results.filter((r) => r.sent).length}명에게 알림 발송`);
      await loadLogs(); // 로그 새로고침
    } catch (err) {
      const axiosLike = err as { response?: { data?: { message?: string } } };
      notifyError(axiosLike.response?.data?.message || "알림 테스트에 실패했습니다.");
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card style={{ marginTop: 20 }}>
      <SectionHeader>
        <SectionTitle>알림 테스트</SectionTitle>
        <Button onClick={handleTest} disabled={testing || !groupId}>
          {testing ? "테스트 중..." : "회비 알림 테스트"}
        </Button>
      </SectionHeader>

      {testResults && (
        <TestResults>
          <TestResultsTitle>테스트 결과</TestResultsTitle>
          <TestResultsList>
            {testResults.map((result) => (
              <TestResultItem key={result.user_id} $success={result.sent}>
                <div>
                  <strong>{result.user_name}</strong> ({result.email})
                </div>
                {result.sent ? (
                  <SuccessBadge>발송 완료</SuccessBadge>
                ) : (
                  <ReasonText>{result.reason || "발송 실패"}</ReasonText>
                )}
              </TestResultItem>
            ))}
          </TestResultsList>
        </TestResults>
      )}

      <LogsSection>
        <LogsHeader>
          <SectionTitle style={{ margin: 0 }}>알림 로그</SectionTitle>
          <Button onClick={loadLogs} disabled={loading} $variant="outline" style={{ minWidth: 80 }}>
            {loading ? "로딩..." : "새로고침"}
          </Button>
        </LogsHeader>

        {loading ? (
          <LoadingText>로딩 중...</LoadingText>
        ) : logs.length === 0 ? (
          <EmptyText>알림 로그가 없습니다.</EmptyText>
        ) : (
          <LogsList>
            {logs.map((log) => (
              <LogItem key={log.id}>
                <LogInfo>
                  <LogType>{log.type === "dues_reminder" ? "회비 알림" : log.type}</LogType>
                  <LogMessage>{log.message}</LogMessage>
                  {log.user_name && <LogUser>{log.user_name}</LogUser>}
                </LogInfo>
                <LogTime>{formatDisplayDateTime(log.sent_at)}</LogTime>
              </LogItem>
            ))}
          </LogsList>
        )}
      </LogsSection>
    </Card>
  );
};

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 12px;
  flex-wrap: wrap;

  ${media.mobile} {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SectionTitle = styled.h2`
  margin: 0;
  color: ${colors.text};
  font-size: 18px;
  font-weight: 700;
`;

const TestResults = styled.div`
  margin-bottom: 24px;
  padding: 16px;
  background: ${colors.bgLighter};
  border-radius: 8px;
`;

const TestResultsTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: ${colors.text};
`;

const TestResultsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TestResultItem = styled.div<{ $success: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: ${colors.white};
  border-radius: 8px;
  border: 1px solid ${(p) => (p.$success ? colors.success : colors.border)};
  gap: 12px;
  flex-wrap: wrap;

  ${media.mobile} {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const SuccessBadge = styled.span`
  padding: 4px 12px;
  background: ${colors.success};
  color: white;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
`;

const ReasonText = styled.span`
  color: ${colors.textMuted};
  font-size: 13px;
`;

const LogsSection = styled.div`
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid ${colors.border};
`;

const LogsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 12px;
  flex-wrap: wrap;

  ${media.mobile} {
    flex-direction: column;
    align-items: stretch;
  }
`;

const LogsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const LogItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px;
  background: ${colors.bgLighter};
  border-radius: 8px;
  gap: 12px;
  flex-wrap: wrap;

  ${media.mobile} {
    flex-direction: column;
  }
`;

const LogInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const LogType = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${colors.primary};
  text-transform: uppercase;
`;

const LogMessage = styled.span`
  font-size: 14px;
  color: ${colors.text};
`;

const LogUser = styled.span`
  font-size: 12px;
  color: ${colors.textMuted};
`;

const LogTime = styled.span`
  font-size: 12px;
  color: ${colors.textMuted};
  white-space: nowrap;

  ${media.mobile} {
    align-self: flex-end;
  }
`;

const LoadingText = styled.p`
  color: ${colors.textMuted};
  text-align: center;
  padding: 20px;
  margin: 0;
`;

const EmptyText = styled.p`
  color: ${colors.textMuted};
  text-align: center;
  padding: 20px;
  margin: 0;
`;

export default NotificationTest;
