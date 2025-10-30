import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import {
  fetchGroups,
  fetchTxStats,
  fetchTransactions as apiFetchTransactions,
  fetchMonthly as apiFetchMonthly,
  fetchDues as apiFetchDues,
  fetchPreferences as apiFetchPreferences,
  updatePreferences as apiUpdatePreferences,
  setDues as apiSetDues,
} from "../api/client";
import { isAdminFor } from "../utils/group";
import InviteAcceptor from "../components/InviteAcceptor";
import MonthlyBars from "../components/MonthlyBars";
import DashboardHeader from "../components/DashboardHeader";
import GroupSelector from "../components/GroupSelector";
import PreferencesToggle from "../components/PreferencesToggle";
import StatsCards from "../components/StatsCards";
import ReportDownload from "../components/ReportDownload";
import TransactionsList from "../components/TransactionsList";
import LoadMore from "../components/LoadMore";
import DuesTable from "../components/DuesTable";
import TransactionForm from "../components/TransactionForm";
import GroupMembers from "../components/GroupMembers";
import type {
  GroupsListResponse,
  GroupSummaryDTO,
  TransactionsListResponse,
  TransactionsStatsResponse,
  MonthlyResponse,
  DuesListResponse,
} from "../types/api";

const DashboardContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

// 스타일 컴포넌트는 컨테이너만 유지

const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"overview" | "group">("overview");
  type GroupWithRole = {
    id: number;
    name: string;
    user_role?: "admin" | "member";
  };
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
      } catch (e) {
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
          const prefRes = await apiFetchPreferences();
          setPrefs({
            receive_dues_reminders: !!prefRes?.receive_dues_reminders,
          });
        } catch (e) {
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

  async function downloadReport(kind: "pdf" | "xlsx") {
    if (!groupId) return;
    const token = localStorage.getItem("token");
    const endpoint =
      kind === "pdf" ? "/api/reports/summary.pdf" : "/api/reports/summary.xlsx";
    const url = `${endpoint}?groupId=${groupId}&from=${reportRange.from}&to=${reportRange.to}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      alert("보고서 생성에 실패했습니다.");
      return;
    }
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `report_${groupId}_${reportRange.from}_${reportRange.to}.${kind}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  return (
    <DashboardContainer>
      <DashboardHeader
        onLogout={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          window.location.href = "/";
        }}
      />
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button
          onClick={() => setActiveTab("overview")}
          style={{
            padding: "6px 10px",
            borderRadius: 8,
            border: "1px solid #ddd",
            background: activeTab === "overview" ? "#eef2ff" : "#fff",
            cursor: "pointer",
          }}
        >
          요약
        </button>
        <button
          onClick={() => setActiveTab("group")}
          style={{
            padding: "6px 10px",
            borderRadius: 8,
            border: "1px solid #ddd",
            background: activeTab === "group" ? "#eef2ff" : "#fff",
            cursor: "pointer",
          }}
        >
          그룹
        </button>
      </div>

      {activeTab === "group" ? (
        <>
          <GroupSelector
            groups={groups}
            groupId={groupId}
            onChange={(gid) => setGroupId(gid)}
            isAdmin={isAdminFor(groups, groupId)}
          />
          <div style={{ height: 12 }} />
          {groupId && (
            <GroupMembers
              groupId={groupId}
              isAdmin={isAdminFor(groups, groupId)}
            />
          )}
        </>
      ) : (
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
              } catch (err) {
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
            <h2 style={{ marginBottom: 16, color: "#333" }}>
              월별 수입/지출 추이
            </h2>
            {monthly.length === 0 ? (
              <p style={{ color: "#999" }}>데이터가 없습니다.</p>
            ) : (
              <MonthlyBars data={monthly} />
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
              onAfterChange={refreshTransactionsAndStats}
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

          <TransactionForm
            groupId={groupId || 0}
            onSubmitted={refreshTransactionsAndStats}
          />
        </>
      )}
    </DashboardContainer>
  );
};

export default DashboardPage;
