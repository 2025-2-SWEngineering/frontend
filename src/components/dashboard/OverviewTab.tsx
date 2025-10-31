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
import InviteAcceptor from "../InviteAcceptor";
import MonthlyBars from "../MonthlyBars";
import CategoryChart from "../CategoryChart";
import GroupSelector from "../GroupSelector";
import PreferencesToggle from "../PreferencesToggle";
import StatsCards from "../StatsCards";
import ReportDownload from "../ReportDownload";
import TransactionsList from "../TransactionsList";
import LoadMore from "../LoadMore";
import DuesTable from "../DuesTable";
import TransactionForm from "../TransactionForm";
import type {
  TransactionsListResponse,
  MonthlyResponse,
  DuesListResponse,
} from "../../types/api";
import api from "../../services/api";

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
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<
    Array<{
      id: number;
      type: "income" | "expense";
      amount: number;
      description: string;
      date: string;
      receiptUrl?: string;
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
  const [prefs, setPrefs] = useState<{
    receive_dues_reminders: boolean;
  } | null>(null);
  const currentUser = useMemo(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const formatted = useMemo(() => {
    const nf = new Intl.NumberFormat("ko-KR");
    return {
      currentBalance: nf.format(stats?.currentBalance ?? 0) + "원",
      totalIncome: nf.format(stats?.totalIncome ?? 0) + "원",
      totalExpense: nf.format(stats?.totalExpense ?? 0) + "원",
    };
  }, [stats]);

  useEffect(() => {
    (async () => {
      try {
        const groupsList = await fetchGroups();
        setGroups(groupsList);
        const saved = Number(localStorage.getItem("selectedGroupId") || 0);
        const first = (groupsList || [])[0]?.id ?? null;
        const gid =
          saved &&
          (groupsList as Array<GroupWithRole>).some((g) => g.id === saved)
            ? saved
            : first;
        if (gid) setGroupId(gid);
      } catch {
        // ignore
      }
    })();
  }, []);

  useEffect(() => {
    if (!groupId) return;
    localStorage.setItem("selectedGroupId", String(groupId));
    setTxPage(1);
    setTxHasMore(true);
    (async () => {
      try {
        setLoading(true);
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
          const catRes = await apiFetchByCategory(groupId, {
            from: reportRange.from,
            to: reportRange.to,
          });
          const c = (catRes as Array<any>).map((r) => ({
            category: r.category,
            income: Number(r.income),
            expense: Number(r.expense),
            total: Number(r.total),
          }));
          setByCategory(c);
        } catch {}
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
      } finally {
        setLoading(false);
      }
    })();
  }, [groupId]);

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
      alert(
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
      createdBy: r.created_by,
    }));
    setItems(mappedTx);
    setTxPage(1);
    setTxHasMore((listData.items || []).length === 20);
  }

  async function refreshAll() {
    if (!groupId) return;
    await refreshTransactionsAndStats();
    const [monthlyData, catRes] = await Promise.all([
      apiFetchMonthly(groupId, 6),
      apiFetchByCategory(groupId, {
        from: reportRange.from,
        to: reportRange.to,
      }),
    ]);
    const m = ((monthlyData || []) as MonthlyResponse["data"]).map((r) => ({
      month: r.month,
      income: Number(r.income),
      expense: Number(r.expense),
    }));
    setMonthly(m);
    const c = (catRes as Array<any>).map((r) => ({
      category: r.category,
      income: Number(r.income),
      expense: Number(r.expense),
      total: Number(r.total),
    }));
    setByCategory(c);
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
      alert("보고서 생성에 실패했습니다.");
    }
  }

  return (
    <>
      <GroupSelector
        groups={groups}
        groupId={groupId}
        onChange={(gid) => setGroupId(gid)}
        isAdmin={isAdminFor(groups, groupId)}
      />

      <div style={{ marginTop: 8 }}>
        <InviteAcceptor
          onAccepted={(gid) => {
            setGroupId(gid);
            (async () => {
              const list = await fetchGroups();
              setGroups(list || []);
            })();
          }}
        />
      </div>

      <PreferencesToggle
        checked={!!prefs?.receive_dues_reminders}
        onToggle={async (next) => {
          setPrefs({ receive_dues_reminders: next });
          try {
            await apiUpdatePreferences({ receive_dues_reminders: next });
          } catch {
            setPrefs({ receive_dues_reminders: !next });
            alert("알림 설정 변경에 실패했습니다.");
          }
        }}
      />

      <StatsCards
        loading={loading}
        currentBalance={formatted.currentBalance}
        totalIncome={formatted.totalIncome}
        totalExpense={formatted.totalExpense}
      />

      <div
        style={{
          background: "white",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
          marginBottom: 20,
        }}
      >
        <h2 style={{ marginBottom: 16, color: "#333" }}>월별 수입/지출 추이</h2>
        {monthly.length === 0 ? (
          <p style={{ color: "#999" }}>데이터가 없습니다.</p>
        ) : (
          <MonthlyBars data={monthly} />
        )}
      </div>

      <div
        style={{
          background: "white",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
          marginBottom: 20,
        }}
      >
        <h2 style={{ marginBottom: 16, color: "#333" }}>항목별 집계</h2>
        {byCategory.length === 0 ? (
          <p style={{ color: "#999" }}>데이터가 없습니다.</p>
        ) : (
          <CategoryChart data={byCategory} />
        )}
      </div>

      <ReportDownload
        range={reportRange}
        onChange={setReportRange}
        onDownload={downloadReport}
      />

      <div
        style={{
          background: "white",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
        }}
      >
        <h2 style={{ marginBottom: 16, color: "#333" }}>최근 거래 내역</h2>
        <TransactionsList
          items={items}
          groupId={groupId || 0}
          isAdmin={isAdminFor(groups, groupId)}
          currentUserId={currentUser?.id}
          onAfterChange={refreshAll}
        />
      </div>

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

      <div
        style={{
          background: "white",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
          marginTop: 20,
        }}
      >
        <h2 style={{ marginBottom: 16, color: "#333" }}>회비 납부 현황</h2>
        <DuesTable
          dues={dues}
          isAdmin={
            !!(
              groupId &&
              groups.find((g) => g.id === groupId)?.user_role === "admin"
            )
          }
          onToggle={toggleDues}
        />
      </div>

      <TransactionForm groupId={groupId || 0} onSubmitted={refreshAll} />
    </>
  );
};

export default OverviewTab;
