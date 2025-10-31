import React from "react";
import api from "../services/api";
import { removeTransaction } from "../api/client";

type Item = {
  id: number;
  type: "income" | "expense";
  amount: number;
  description: string;
  date: string;
  receiptUrl?: string;
  category?: string;
  createdBy?: number;
};

type Props = {
  items: Array<Item>;
  groupId: number;
  isAdmin: boolean;
  currentUserId?: number;
  onAfterChange: () => Promise<void> | void;
};

const TransactionsList: React.FC<Props> = ({
  items,
  groupId,
  isAdmin,
  currentUserId,
  onAfterChange,
}) => {
  const openReceipt = async (receiptUrl: string) => {
    if (/^https?:\/\//i.test(receiptUrl)) {
      window.open(receiptUrl, "_blank");
      return;
    }
    try {
      const { data } = await api.get("/uploads/presign/get", {
        params: { key: receiptUrl },
      });
      window.open(data.url, "_blank");
    } catch {
      alert("영수증 링크 생성에 실패했습니다.");
    }
  };

  const canDelete = (it: Item) =>
    isAdmin || (!!currentUserId && currentUserId === it.createdBy);

  const handleDelete = async (id: number) => {
    if (!groupId) return;
    if (!confirm("이 거래를 삭제할까요?")) return;
    try {
      await removeTransaction(id, groupId);
      await onAfterChange();
    } catch (err: unknown) {
      const axiosLike = err as { response?: { data?: { message?: string } } };
      alert(axiosLike.response?.data?.message || "삭제에 실패했습니다.");
    }
  };

  const fmtYmdHm = (s: string) => {
    const d = new Date(s);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${y}-${m}-${day} ${hh}:${mm}`;
  };

  if (items.length === 0) {
    return <p style={{ color: "#999" }}>아직 거래 내역이 없습니다.</p>;
  }

  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {items.map((it) => (
        <li
          key={it.id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "10px 0",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <span
            style={{
              color: it.type === "income" ? "#16a34a" : "#dc2626",
              fontWeight: 600,
              minWidth: 120,
            }}
          >
            {it.type === "income" ? "+ " : "- "}
            {new Intl.NumberFormat("ko-KR").format(it.amount)}원
          </span>
          <span
            style={{
              color: "#333",
              flex: 1,
              marginLeft: 12,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              style={{
                background: "#f3f4f6",
                border: "1px solid #e5e7eb",
                color: "#4b5563",
                borderRadius: 999,
                padding: "2px 8px",
                fontSize: 13,
                whiteSpace: "nowrap",
              }}
            >
              {(it.category && it.category.trim()) || "기타"}
            </span>
            <span>{it.description}</span>
          </span>
          <span style={{ color: "#999", minWidth: 120, textAlign: "right" }}>
            {/^[\d]{4}-\d{2}-\d{2}$/.test(it.date)
              ? `${it.date} 00:00`
              : fmtYmdHm(it.date)}
          </span>
          {it.receiptUrl && (
            <button
              onClick={() => openReceipt(it.receiptUrl!)}
              style={{
                marginLeft: 12,
                color: "#667eea",
                background: "transparent",
                border: "1px solid #c7d2fe",
                borderRadius: 6,
                padding: "2px 8px",
                cursor: "pointer",
              }}
            >
              영수증
            </button>
          )}
          {canDelete(it) && (
            <button
              onClick={() => handleDelete(it.id)}
              style={{
                marginLeft: 12,
                color: "#ef4444",
                background: "transparent",
                border: "1px solid #fca5a5",
                borderRadius: 6,
                padding: "2px 8px",
                cursor: "pointer",
              }}
            >
              삭제
            </button>
          )}
        </li>
      ))}
    </ul>
  );
};

export default TransactionsList;
