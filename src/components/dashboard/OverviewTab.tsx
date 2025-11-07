import React, { useEffect, useMemo, useState } from "react";
import { updatePreferences as apiUpdatePreferences } from "../../api/client";
import { isAdminFor } from "../../utils/group";
import { CategorySettingsModal } from "../modals";
import { StatsCards, LoadMore, LoadingOverlay } from "../ui";
import { ReportDownload } from "../shared";
import TransactionForm from "../forms/TransactionForm";
import { Card, SectionTitle, Input } from "../../styles/primitives";
import { formatCurrencyKRW } from "../../utils/format";
import { notifyError } from "../../utils/notify";
import {
  HeaderControls,
  MonthlySection,
  CategorySection,
  RecentTransactionsSection,
  DuesSection,
} from "../overview";
import { downloadReportFile } from "../../utils/overview";
import { useGroupsSelection } from "../../hooks/useGroupsSelection";
import { useOverviewData } from "../../hooks/useOverviewData";
import { useCategoryAgg } from "../../hooks/useCategoryAgg";

const OverviewTab: React.FC = () => {
  const {
    groups,
    groupId,
    setGroupId,
    reloadGroups,
    loading: groupsLoading,
  } = useGroupsSelection();
  const [loading, setLoading] = useState(true);
  const {
    loading: overviewLoading,
    stats,
    items,
    monthly,
    dues,
    txHasMore,
    txMoreLoading,
    loadMore,
    refreshAll,
    toggleDues,
  } = useOverviewData(groupId);
  const [reportRange, setReportRange] = useState<{ from: string; to: string }>(() => {
    const today = new Date();
    const from = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
    return { from, to: today.toISOString().slice(0, 10) };
  });
  const {
    range: categoryRange,
    setRange: setCategoryRange,
    data: byCategory,
    loading: categoryLoading,
  } = useCategoryAgg(groupId);

  const [prefs, setPrefs] = useState<{
    receive_dues_reminders: boolean;
  } | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const currentUser = useMemo(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const formatted = useMemo(() => {
    return {
      currentBalance: formatCurrencyKRW(stats?.currentBalance ?? 0),
      totalIncome: formatCurrencyKRW(stats?.totalIncome ?? 0),
      totalExpense: formatCurrencyKRW(stats?.totalExpense ?? 0),
    };
  }, [stats]);

  useEffect(() => {
    if (!groupsLoading && !groupId) setLoading(false);
  }, [groupsLoading, groupId]);

  useEffect(() => {
    setLoading(overviewLoading || groupsLoading);
  }, [overviewLoading, groupsLoading]);

  useEffect(() => {
    if (!groupId) return;
    localStorage.setItem("selectedGroupId", String(groupId));
  }, [groupId]);

  // categoryLoading handled via useCategoryAgg

  // toggleDues / refreshAll provided via useOverviewData

  async function downloadReport(kind: "pdf" | "xlsx") {
    if (!groupId) return;
    try {
      await downloadReportFile(kind, groupId, reportRange);
    } catch (e) {
      notifyError("보고서 생성에 실패했습니다.");
    }
  }

  return (
    <>
      <LoadingOverlay visible={loading} label="데이터 불러오는 중..." />
      <Card style={{ marginBottom: 20 }}>
        <HeaderControls
          groups={groups}
          groupId={groupId}
          isAdmin={isAdminFor(groups, groupId)}
          prefs={prefs}
          onChangeGroup={(gid) => setGroupId(gid)}
          onAcceptedInvite={async (gid) => {
            setGroupId(gid);
            await reloadGroups();
          }}
          onTogglePrefs={async (next) => {
            setPrefs({ receive_dues_reminders: next });
            try {
              await apiUpdatePreferences({ receive_dues_reminders: next });
            } catch {
              setPrefs({ receive_dues_reminders: !next });
              notifyError("알림 설정 변경에 실패했습니다.");
            }
          }}
          onOpenCategory={() => setShowCategoryModal(true)}
        />
      </Card>

      <StatsCards
        loading={loading}
        currentBalance={formatted.currentBalance}
        totalIncome={formatted.totalIncome}
        totalExpense={formatted.totalExpense}
      />

      <MonthlySection loading={loading} data={monthly} />

      <CategorySection
        loading={loading}
        categoryLoading={categoryLoading}
        range={categoryRange}
        onChangeRange={setCategoryRange}
        data={byCategory}
      />

      <ReportDownload range={reportRange} onChange={setReportRange} onDownload={downloadReport} />

      <RecentTransactionsSection
        loading={loading}
        items={items}
        groupId={groupId || 0}
        isAdmin={isAdminFor(groups, groupId)}
        currentUserId={currentUser?.id}
        onAfterChange={refreshAll}
      />

      <LoadMore visible={txHasMore} loading={txMoreLoading} onClick={loadMore} />

      <DuesSection
        loading={loading}
        dues={dues}
        isAdmin={!!(groupId && groups.find((g) => g.id === groupId)?.user_role === "admin")}
        onToggle={toggleDues}
      />

      <TransactionForm groupId={groupId || 0} onSubmitted={refreshAll} />

      {groupId && (
        <CategorySettingsModal
          groupId={groupId}
          visible={showCategoryModal}
          onClose={() => setShowCategoryModal(false)}
        />
      )}
    </>
  );
};

export default OverviewTab;
