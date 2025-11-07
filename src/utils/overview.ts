import type { TransactionsListResponse, MonthlyResponse, DuesListResponse } from "../types/api";
import api from "../services/api";

export function mapTransactions(items: TransactionsListResponse["items"] | undefined) {
    return ((items || []) as TransactionsListResponse["items"]).map((r) => ({
        id: r.id,
        type: r.type,
        amount: Number(r.amount),
        description: r.description,
        date: r.date,
        receiptUrl: r.receipt_url || undefined,
        category: ((r as any).category && String((r as any).category).trim()) || "기타",
        createdBy: r.created_by,
    }));
}

export function mapMonthly(data: MonthlyResponse["data"] | undefined) {
    return ((data || []) as MonthlyResponse["data"]).map((r) => ({
        month: r.month,
        income: Number(r.income),
        expense: Number(r.expense),
    }));
}

export function mapDues(items: DuesListResponse["items"] | undefined) {
    return ((items || []) as DuesListResponse["items"]).map((r) => ({
        userId: r.user_id,
        userName: r.user_name,
        isPaid: !!r.is_paid,
        paidAt: r.paid_at || undefined,
    }));
}

export async function downloadReportFile(
    kind: "pdf" | "xlsx",
    groupId: number,
    range: { from: string; to: string }
) {
    const path = kind === "pdf" ? "/reports/summary.pdf" : "/reports/summary.xlsx";
    const { data } = await api.get(path, {
        params: { groupId, from: range.from, to: range.to },
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
    a.download = `report_${groupId}_${range.from}_${range.to}.${kind}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
}


