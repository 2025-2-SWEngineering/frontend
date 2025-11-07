import React from "react";
import { fetchByCategory as apiFetchByCategory } from "../api/client";
import { toYmd } from "../utils/format";

export function useCategoryAgg(groupId: number | null) {
  const [range, setRange] = React.useState<{ from: string; to: string }>(() => {
    const today = new Date();
    const fromDate = new Date(today.getFullYear(), today.getMonth() - 2, 1);
    return { from: toYmd(fromDate), to: toYmd(today) };
  });
  const [data, setData] = React.useState<
    Array<{ category: string; income: number; expense: number; total: number }>
  >([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      if (!groupId) return;
      if (!range.from || !range.to) return;
      if (range.from > range.to) return;
      try {
        setLoading(true);
        const catRes = await apiFetchByCategory(groupId, { from: range.from, to: range.to });
        const c = (catRes as Array<any>).map((r) => ({
          category: r.category,
          income: Number(r.income),
          expense: Number(r.expense),
          total: Number(r.total),
        }));
        setData(c);
      } finally {
        setLoading(false);
      }
    })();
  }, [groupId, range.from, range.to]);

  return { range, setRange, data, loading } as const;
}
