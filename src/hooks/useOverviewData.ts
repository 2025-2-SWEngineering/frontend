import React from "react";
import {
  fetchTxStats,
  fetchTransactions as apiFetchTransactions,
  fetchMonthly as apiFetchMonthly,
  fetchDues as apiFetchDues,
  setDues as apiSetDues,
} from "../api/client";
import type { TransactionsListResponse, MonthlyResponse, DuesListResponse } from "../types/api";

export function useOverviewData(groupId: number | null) {
  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState<{
    currentBalance: number;
    totalIncome: number;
    totalExpense: number;
  } | null>(null);
  const [items, setItems] = React.useState<
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
  const [monthly, setMonthly] = React.useState<
    Array<{ month: string; income: number; expense: number }>
  >([]);
  const [dues, setDues] = React.useState<
    Array<{ userId: number; userName: string; isPaid: boolean; paidAt?: string }>
  >([]);
  const [txPage, setTxPage] = React.useState(1);
  const [txHasMore, setTxHasMore] = React.useState(true);
  const [txMoreLoading, setTxMoreLoading] = React.useState(false);

  const loadInitial = React.useCallback(async () => {
    if (!groupId) return;
    try {
      setLoading(true);
      const statsData = await fetchTxStats(groupId);
      setStats(statsData);
      const listRes = await apiFetchTransactions(groupId, 20, 1);
      const mappedTx = ((listRes.items || []) as TransactionsListResponse["items"]).map((r) => ({
        id: r.id,
        type: r.type,
        amount: Number(r.amount),
        description: r.description,
        date: r.date,
        receiptUrl: r.receipt_url || undefined,
        category: ((r as any).category && String((r as any).category).trim()) || "기타",
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
      const duesItems = await apiFetchDues(groupId);
      const mapped = ((duesItems || []) as DuesListResponse["items"]).map((r) => ({
        userId: r.user_id,
        userName: r.user_name,
        isPaid: !!r.is_paid,
        paidAt: r.paid_at || undefined,
      }));
      setDues(mapped);
      setTxPage(1);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  React.useEffect(() => {
    if (!groupId) return;
    loadInitial();
  }, [groupId, loadInitial]);

  const loadMore = React.useCallback(async () => {
    if (!groupId) return;
    try {
      setTxMoreLoading(true);
      const next = txPage + 1;
      const res = await apiFetchTransactions(groupId, 20, next);
      const mapped = ((res.items || []) as TransactionsListResponse["items"]).map((r) => ({
        id: r.id,
        type: r.type,
        amount: Number(r.amount),
        description: r.description,
        date: r.date,
        receiptUrl: r.receipt_url || undefined,
        category: ((r as any).category && String((r as any).category).trim()) || "기타",
        createdBy: r.created_by,
      }));
      setItems((prev) => [...prev, ...mapped]);
      setTxPage(next);
      setTxHasMore((res.items || []).length === 20);
    } finally {
      setTxMoreLoading(false);
    }
  }, [groupId, txPage]);

  const refreshAll = React.useCallback(async () => {
    if (!groupId) return;
    await loadInitial();
  }, [groupId, loadInitial]);

  const toggleDues = React.useCallback(
    async (userId: number, next: boolean) => {
      if (!groupId) return;
      await apiSetDues(groupId, userId, next);
      const duesItems = await apiFetchDues(groupId);
      const mapped = ((duesItems || []) as DuesListResponse["items"]).map((r) => ({
        userId: r.user_id,
        userName: r.user_name,
        isPaid: !!r.is_paid,
        paidAt: r.paid_at || undefined,
      }));
      setDues(mapped);
    },
    [groupId],
  );

  return {
    loading,
    stats,
    items,
    monthly,
    dues,
    txHasMore,
    txMoreLoading,
    loadMore,
    refreshAll,
    toggleDues,
  } as const;
}
