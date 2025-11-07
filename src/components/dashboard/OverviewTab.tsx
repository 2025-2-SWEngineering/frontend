import React, { useEffect, useMemo, useState } from "react";
import {
  fetchGroups,
  fetchTxStats,
  fetchTransactions as apiFetchTransactions,
  fetchMonthly as apiFetchMonthly,
  fetchByCategory as apiFetchByCategory,
  fetchDues as apiFetchDues,
  fetchPreferences as apiFetchPreferences,
  updatePreferences as apiUpdatePreferences,
  setDues as apiSetDues,
} from "../../api/client";
import { isAdminFor } from "../../utils/group";
import CategorySettingsModal from "../CategorySettingsModal";
import StatsCards from "../StatsCards";
import ReportDownload from "../ReportDownload";
import LoadMore from "../LoadMore";
import TransactionForm from "../TransactionForm";
import { Skeleton, SkeletonLines } from "../Loading";
import { Card, SectionTitle, Input } from "../../styles/primitives";
import LoadingOverlay from "../LoadingOverlay";
import type {
  TransactionsListResponse,
  MonthlyResponse,
  DuesListResponse,
} from "../../types/api";
import api from "../../services/api";
import { toYmd, formatCurrencyKRW } from "../../utils/format";
import { useAsync } from "../../hooks/useAsync";
import { notifyError } from "../../utils/notify";
import OverviewHeaderControls from "./OverviewHeaderControls";
import MonthlySection from "./MonthlySection";
import CategorySection from "./CategorySection";
import RecentTransactionsSection from "./RecentTransactionsSection";
import DuesSection from "./DuesSection";

type GroupWithRole = {
  id: number;
  name: string;
  user_role?: "admin" | "member";
};

const OverviewTab: React.FC = () => {
  const [groups, setGroups] = useState<Array<GroupWithRole>>([]);
  const [groupId, setGroupId] = useState<number | null>(null);
  const [stats, setStats] = useState<{
    currentBalance: number;
    totalIncome: number;
    totalExpense: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<
    Array<{
      id: number;
      type: "income" | "expense";
      amount: number;
      description: string;
      date: string;
      receiptUrl?: string;
      category?: string;
      createdBy?: number;
    }>
  >([]);
  const [txPage, setTxPage] = useState(1);
  const [txHasMore, setTxHasMore] = useState(true);
  const [txMoreLoading, setTxMoreLoading] = useState(false);
  const [dues, setDues] = useState<
    Array<{
      userId: number;
      userName: string;
      isPaid: boolean;
      paidAt?: string;
    }>
  >([]);
  const [reportRange, setReportRange] = useState<{ from: string; to: string }>(
    () => {
      const today = new Date();
      const from = new Date(today.getFullYear(), today.getMonth(), 1)
        .toISOString()
        .slice(0, 10);
      return { from, to: today.toISOString().slice(0, 10) };
    }
  );
  const [monthly, setMonthly] = useState<
    Array<{ month: string; income: number; expense: number }>
  >([]);
  const [byCategory, setByCategory] = useState<
    Array<{ category: string; income: number; expense: number; total: number }>
  >([]);
  const [categoryRange, setCategoryRange] = useState<{
    from: string;
    to: string;
  }>(() => {
    const today = new Date();
    const fromDate = new Date(today.getFullYear(), today.getMonth() - 2, 1);
    return { from: toYmd(fromDate), to: toYmd(today) };
  });

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
    (async () => {
      try {
        setLoading(true);
        const groupsList = await fetchGroups();
        setGroups(groupsList);
        const saved = Number(localStorage.getItem("selectedGroupId") || 0);
        const first = (groupsList || [])[0]?.id ?? null;
        const gid =
          saved &&
          (groupsList as Array<GroupWithRole>).some((g) => g.id === saved)
            ? saved
            : first;
        if (gid) {
          setGroupId(gid);
        } else {
          // 선택 가능한 그룹이 없을 때는 초기 로딩 해제
          setLoading(false);
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  const { loading: overviewLoading, run: runOverview } = useAsync(async () => {
    if (!groupId) return;
    const statsData = await fetchTxStats(groupId);
    setStats(statsData);
    const listRes = await apiFetchTransactions(groupId, 20, 1);
    const mappedTx = (
      (listRes.items || []) as TransactionsListResponse["items"]
    ).map((r) => ({
      id: r.id,
      type: r.type,
      amount: Number(r.amount),
      description: r.description,
      date: r.date,
      receiptUrl: r.receipt_url || undefined,
      category:
        ((r as any).category && String((r as any).category).trim()) || "기타",
      createdBy: r.created_by,
    }));
    setItems(mappedTx);
    setTxHasMore((listRes.items || []).length === 20);
    const monthlyData = await apiFetchMonthly(groupId, 6);
    const m = ((monthlyData || []) as MonthlyResponse["data"]).map((r) => ({
      month: r.month,
      income: Number(r.income),
      expense: Number(r.expense),
    }));
    setMonthly(m);
    try {
      const prefRes = await apiFetchPreferences();
      setPrefs({
        receive_dues_reminders: !!prefRes?.receive_dues_reminders,
      });
    } catch {
      // ignore
    }
    const duesItems = await apiFetchDues(groupId);
    const mapped = ((duesItems || []) as DuesListResponse["items"]).map(
      (r) => ({
        userId: r.user_id,
        userName: r.user_name,
        isPaid: !!r.is_paid,
        paidAt: r.paid_at || undefined,
      })
    );
    setDues(mapped);
  }, [groupId]);

  useEffect(() => {
    if (!groupId) return;
    localStorage.setItem("selectedGroupId", String(groupId));
    setTxPage(1);
    setTxHasMore(true);
    runOverview();
  }, [groupId, runOverview]);

  useEffect(() => {
    setLoading(overviewLoading);
  }, [overviewLoading]);

  const { loading: categoryLoading } = useAsync(
    async () => {
      if (!groupId) return [] as Array<any>;
      if (!categoryRange.from || !categoryRange.to) return [] as Array<any>;
      if (categoryRange.from > categoryRange.to) return [] as Array<any>;
      const catRes = await apiFetchByCategory(groupId, {
        from: categoryRange.from,
        to: categoryRange.to,
      });
      const c = (catRes as Array<any>).map((r) => ({
        category: r.category,
        income: Number(r.income),
        expense: Number(r.expense),
        total: Number(r.total),
      }));
      setByCategory(c);
      return c;
    },
    [groupId, categoryRange.from, categoryRange.to],
    { immediate: true }
  );

  async function toggleDues(userId: number, next: boolean) {
    if (!groupId) return;
    try {
      await apiSetDues(groupId, userId, next);
      const duesItems = await apiFetchDues(groupId);
      const mapped = ((duesItems || []) as DuesListResponse["items"]).map(
        (r) => ({
          userId: r.user_id,
          userName: r.user_name,
          isPaid: !!r.is_paid,
          paidAt: r.paid_at || undefined,
        })
      );
      setDues(mapped);
    } catch (err: unknown) {
      const axiosLike = err as { response?: { data?: { message?: string } } };
      notifyError(
        axiosLike.response?.data?.message || "회비 상태 변경에 실패했습니다."
      );
    }
  }

  async function refreshTransactionsAndStats() {
    if (!groupId) return;
    const [statsData, listData] = await Promise.all([
      fetchTxStats(groupId),
      apiFetchTransactions(groupId, 20, 1),
    ]);
    setStats(statsData);
    const mappedTx = (
      (listData.items || []) as TransactionsListResponse["items"]
    ).map((r) => ({
      id: r.id,
      type: r.type,
      amount: Number(r.amount),
      description: r.description,
      date: r.date,
      receiptUrl: r.receipt_url || undefined,
      category:
        ((r as any).category && String((r as any).category).trim()) || "기타",
      createdBy: r.created_by,
    }));
    setItems(mappedTx);
    setTxPage(1);
    setTxHasMore((listData.items || []).length === 20);
  }

  async function refreshAll() {
    if (!groupId) return;
    await refreshTransactionsAndStats();
    const [monthlyData] = await Promise.all([apiFetchMonthly(groupId, 6)]);
    const m = ((monthlyData || []) as MonthlyResponse["data"]).map((r) => ({
      month: r.month,
      income: Number(r.income),
      expense: Number(r.expense),
    }));
    setMonthly(m);
  }

  async function downloadReport(kind: "pdf" | "xlsx") {
    if (!groupId) return;
    const path =
      kind === "pdf" ? "/reports/summary.pdf" : "/reports/summary.xlsx";
    try {
      const { data } = await api.get(path, {
        params: { groupId, from: reportRange.from, to: reportRange.to },
        responseType: "blob",
      });
      const blob = new Blob([data], {
        type:
          kind === "pdf"
            ? "application/pdf"
            : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `report_${groupId}_${reportRange.from}_${reportRange.to}.${kind}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      notifyError("보고서 생성에 실패했습니다.");
    }
  }

  return (
    <>
      <LoadingOverlay visible={loading} label="데이터 불러오는 중..." />
      <Card style={{ marginBottom: 20 }}>
        <OverviewHeaderControls
          groups={groups}
          groupId={groupId}
          isAdmin={isAdminFor(groups, groupId)}
          prefs={prefs}
          onChangeGroup={(gid) => setGroupId(gid)}
          onAcceptedInvite={async (gid) => {
            setGroupId(gid);
            const list = await fetchGroups();
            setGroups(list || []);
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

      <ReportDownload
        range={reportRange}
        onChange={setReportRange}
        onDownload={downloadReport}
      />

      <RecentTransactionsSection
        loading={loading}
        items={items}
        groupId={groupId || 0}
        isAdmin={isAdminFor(groups, groupId)}
        currentUserId={currentUser?.id}
        onAfterChange={refreshAll}
      />

      <LoadMore
        visible={txHasMore}
        loading={txMoreLoading}
        onClick={async () => {
          if (!groupId) return;
          try {
            setTxMoreLoading(true);
            const next = txPage + 1;
            const res = await apiFetchTransactions(groupId, 20, next);
            const mapped = (
              (res.items || []) as TransactionsListResponse["items"]
            ).map((r) => ({
              id: r.id,
              type: r.type,
              amount: Number(r.amount),
              description: r.description,
              date: r.date,
              receiptUrl: r.receipt_url || undefined,
              category:
                ((r as any).category && String((r as any).category).trim()) ||
                "기타",
              createdBy: r.created_by,
            }));
            setItems((prev) => [...prev, ...mapped]);
            setTxPage(next);
            setTxHasMore((res.items || []).length === 20);
          } finally {
            setTxMoreLoading(false);
          }
        }}
      />

      <DuesSection
        loading={loading}
        dues={dues}
        isAdmin={
          !!(
            groupId &&
            groups.find((g) => g.id === groupId)?.user_role === "admin"
          )
        }
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
