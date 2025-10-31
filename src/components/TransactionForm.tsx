import React, { useEffect, useState } from "react";
import api from "../services/api";
import {
  getUploadMode,
  presignPut,
  uploadDirect,
  createTransactionApi,
} from "../api/client";

type Props = {
  groupId: number;
  onSubmitted: () => Promise<void> | void;
};

const TransactionForm: React.FC<Props> = ({ groupId, onSubmitted }) => {
  const [form, setForm] = useState<{
    type: "income" | "expense";
    amount: string;
    description: string;
    date: string;
    category?: string;
    file?: File | null;
  }>({
    type: "income",
    amount: "",
    description: "",
    date: new Date().toISOString().slice(0, 10),
  });
  const [storageMode, setStorageMode] = useState<"s3" | "local" | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const cached = localStorage.getItem("file_storage_mode");
        if (cached === "s3" || cached === "local") {
          setStorageMode(cached as "s3" | "local");
        } else {
          const { data } = await api.get("/uploads/mode");
          if (data?.mode === "s3" || data?.mode === "local") {
            setStorageMode(data.mode);
            localStorage.setItem("file_storage_mode", data.mode);
          }
        }
      } catch {
        // ignore, will fallback in submit
      }
    })();
  }, []);

  async function fetchModeFresh(): Promise<"s3" | "local"> {
    const mode = await getUploadMode();
    setStorageMode(mode);
    localStorage.setItem("file_storage_mode", mode);
    return mode;
  }

  async function uploadReceiptWithAutoSwitch(file: File): Promise<string> {
    const name = file.name || "file";
    const ext = (name.split(".").pop() || "").toLowerCase();
    let ctype = file.type || "";
    if (!ctype) {
      if (ext === "jpg" || ext === "jpeg") ctype = "image/jpeg";
      else if (ext === "png") ctype = "image/png";
      else if (ext === "pdf") ctype = "application/pdf";
      else ctype = "application/octet-stream";
    }
    const ensureMode = async () => storageMode ?? (await fetchModeFresh());
    let mode = await ensureMode();
    // Helper: presign path
    const tryPresign = async (): Promise<string> => {
      const presign = await presignPut(name, ctype);
      const putRes = await fetch(presign.url, {
        method: "PUT",
        headers: { "Content-Type": ctype },
        body: file,
      });
      if (!putRes.ok) {
        const err = new Error("S3_PUT_FAILED");
        // @ts-ignore
        err.code = "S3_PUT_FAILED";
        throw err;
      }
      return presign.key as string;
    };
    // Helper: direct path
    const tryDirect = async (): Promise<string> => {
      const fd = new FormData();
      fd.append("file", file);
      const data = await uploadDirect(fd);
      return (data.url as string) || (data.key as string);
    };

    try {
      if (mode === "s3") {
        return await tryPresign();
      } else {
        return await tryDirect();
      }
    } catch (err: unknown) {
      const axiosLike = err as
        | { response?: { status?: number; data?: { message?: string } } }
        | undefined;
      const status = axiosLike?.response?.status;
      const message = axiosLike?.response?.data?.message || "";
      // 503 모드 불일치 시 반대로 전환 후 1회 재시도
      if (status === 503) {
        if (/S3 저장 모드/.test(message)) {
          setStorageMode("s3");
          localStorage.setItem("file_storage_mode", "s3");
          return await tryPresign();
        }
        if (/로컬 저장 모드/.test(message)) {
          setStorageMode("local");
          localStorage.setItem("file_storage_mode", "local");
          return await tryDirect();
        }
      }
      // presign 성공 후 PUT 실패(CORS 등) 시 로컬로 폴백
      if ((err as { code?: string })?.code === "S3_PUT_FAILED") {
        const fd = new FormData();
        fd.append("file", file);
        const data = await uploadDirect(fd);
        setStorageMode("local");
        localStorage.setItem("file_storage_mode", "local");
        return (data.url as string) || (data.key as string);
      }
      // 기타 오류는 상위에서 처리
      throw err;
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!groupId) return;
    const amountNum = Number(form.amount);
    if (!amountNum || amountNum <= 0) {
      alert("금액을 올바르게 입력하세요.");
      return;
    }
    if (!form.description.trim()) {
      alert("설명은 필수입니다.");
      return;
    }
    try {
      let receiptUrl: string | undefined;
      if (form.file) {
        receiptUrl = await uploadReceiptWithAutoSwitch(form.file);
      }
      await createTransactionApi({
        groupId,
        type: form.type,
        amount: amountNum,
        description: form.description,
        date: form.date,
        category: form.category?.trim() || undefined,
        receiptUrl,
      });
      await onSubmitted();
      setForm((prev) => ({ ...prev, amount: "", description: "", file: null }));
    } catch (err: unknown) {
      const axiosLike = err as {
        response?: { data?: { message?: string; details?: string[] } };
      };
      const details = axiosLike.response?.data?.details;
      const message =
        axiosLike.response?.data?.message || "거래 등록에 실패했습니다.";
      alert(
        details && Array.isArray(details)
          ? `${message}\n- ${details.join("\n- ")}`
          : message
      );
    }
  }

  return (
    <div
      style={{
        background: "white",
        padding: 24,
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
        marginTop: 20,
      }}
    >
      <h2 style={{ marginBottom: 16, color: "#333" }}>거래 등록</h2>
      <form onSubmit={submit}>
        {/* 1행: 수입/지출, 금액, 설명, 날짜 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "120px 1fr 2fr 1fr",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <select
            value={form.type}
            onChange={(e) =>
              setForm({ ...form, type: e.target.value as "income" | "expense" })
            }
            style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }}
          >
            <option value="income">수입</option>
            <option value="expense">지출</option>
          </select>
          <input
            type="number"
            placeholder="금액"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }}
          />
          <input
            type="text"
            placeholder="설명"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }}
          />
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }}
          />
        </div>

        {/* 2행: 카테고리, 파일첨부, 등록 버튼 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 2fr 140px",
            gap: 12,
          }}
        >
          <input
            type="text"
            placeholder="항목(카테고리)"
            value={form.category || ""}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }}
          />
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) =>
              setForm({ ...form, file: e.target.files?.[0] || null })
            }
            style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }}
          />
          <button
            type="submit"
            style={{
              padding: 10,
              borderRadius: 8,
              background: "#667eea",
              color: "#fff",
              border: "none",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            등록
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;
