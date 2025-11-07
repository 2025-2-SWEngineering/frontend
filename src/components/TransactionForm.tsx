import React, { useEffect, useRef, useState } from "react";
import api from "../services/api";
import { getGroupCategories, setGroupCategories } from "../utils/category";
import {
  getUploadMode,
  presignPut,
  uploadDirect,
  createTransactionApi,
  parseReceipt,
} from "../api/client";
import DateTimeModal from "./DateTimeModal";
import uploadClient from "../services/uploadClient";

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
    date: new Date().toISOString(),
  });
  const [storageMode, setStorageMode] = useState<"s3" | "local" | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDtModal, setShowDtModal] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB

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

  useEffect(() => {
    if (!groupId) return;
    try {
      setSuggestions(getGroupCategories(groupId));
    } catch {
      setSuggestions([]);
    }
  }, [groupId]);

  // 카테고리 설정 저장 시 실시간 반영
  useEffect(() => {
    const onUpdated = () => {
      try {
        setSuggestions(getGroupCategories(groupId));
      } catch {
        setSuggestions([]);
      }
    };
    window.addEventListener(
      "group-categories-updated",
      onUpdated as EventListener
    );
    return () =>
      window.removeEventListener(
        "group-categories-updated",
        onUpdated as EventListener
      );
  }, [groupId]);

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
      const putRes = await uploadClient.put(presign.url, file, {
        headers: { "Content-Type": ctype },
      });
      if (!(putRes.status >= 200 && putRes.status < 300)) {
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
    if (!form.category || !form.category.trim()) {
      alert("카테고리를 선택하세요.");
      return;
    }
    if (form.type === "expense" && !form.file) {
      alert("지출 등록 시 영수증 파일 첨부가 필수입니다.");
      return;
    }
    if (form.file && form.file.size > MAX_FILE_SIZE) {
      alert("파일 크기 제한: 3MB 이하만 업로드 가능합니다.");
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
      setForm((prev) => ({
        ...prev,
        amount: "",
        description: "",
        file: null,
        date: new Date().toISOString(),
      }));
      if (fileInputRef.current) fileInputRef.current.value = "";
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

  async function handleOcr() {
    try {
      if (!form.file) {
        alert("먼저 영수증 이미지를 선택하세요.");
        return;
      }
      if (form.file.size > MAX_FILE_SIZE) {
        alert("파일 크기 제한: 3MB 이하만 업로드 가능합니다.");
        return;
      }
      const ext = (form.file.name.split(".").pop() || "").toLowerCase();
      const mime =
        form.file.type ||
        (ext === "png"
          ? "image/png"
          : ext === "jpg" || ext === "jpeg"
          ? "image/jpeg"
          : ext === "pdf"
          ? "application/pdf"
          : "");
      if (
        !/^image\//i.test(mime) &&
        !/^application\/(pdf|x-pdf|acrobat)$/i.test(mime)
      ) {
        alert("OCR은 이미지 또는 PDF만 지원합니다.");
        return;
      }
      setOcrLoading(true);
      const fd = new FormData();
      fd.append("file", form.file);
      const result = await parseReceipt(fd);
      const next: typeof form = { ...form };
      if (typeof result.amount === "number" && isFinite(result.amount)) {
        next.amount = String(result.amount);
        if (Number(next.amount) > 0 && form.type !== "expense") {
          next.type = "expense"; // 영수증은 보통 지출
        }
      }
      if (result.description && !form.description)
        next.description = result.description;
      if (result.merchant && !form.description)
        next.description = result.merchant;
      if (result.date) next.date = result.date;
      if (result.categorySuggestion) {
        next.category = result.categorySuggestion;
        const suggested = String(result.categorySuggestion).trim();
        if (suggested && !suggestions.includes(suggested)) {
          alert(
            `OCR AI에서는 해당 카테고리를 "${suggested}"로 추천합니다. 카테고리를 신설하거나 기타로 설정해주세요`
          );
        }
      }
      setForm(next);
    } catch (e: unknown) {
      const axiosLike = e as { response?: { data?: { message?: string } } };
      const msg =
        axiosLike?.response?.data?.message || "OCR 분석에 실패했습니다.";
      alert(msg);
    } finally {
      setOcrLoading(false);
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: 16,
        }}
      >
        {" "}
        <h2 style={{ marginBottom: 16, color: "#333" }}>거래 등록</h2>
        {form.file ? (
          <button
            type="button"
            onClick={handleOcr}
            disabled={ocrLoading}
            style={{
              padding: 10,
              borderRadius: 8,
              borderColor: ocrLoading ? "#ddd" : "#667eea",
              border: "1px solid #ddd",
              background: "#fff",
              cursor: ocrLoading ? "default" : "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {ocrLoading ? "분석중..." : "영수증 AI 분석"}
          </button>
        ) : null}
      </div>

      <form onSubmit={submit}>
        {/* 1행: 수입/지출, 금액, 설명, 날짜 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "120px 1fr 2fr 1.5fr",
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
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              readOnly
              value={(function fmt(v: string) {
                try {
                  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return `${v} 00:00`;
                  const d = new Date(v);
                  const y = d.getFullYear();
                  const m = String(d.getMonth() + 1).padStart(2, "0");
                  const day = String(d.getDate()).padStart(2, "0");
                  const hh = String(d.getHours()).padStart(2, "0");
                  const mm = String(d.getMinutes()).padStart(2, "0");
                  return `${y}-${m}-${day} ${hh}:${mm}`;
                } catch {
                  return v;
                }
              })(form.date)}
              style={{
                padding: 10,
                border: "1px solid #ddd",
                borderRadius: 8,
                flex: 1,
                background: "#f9fafb",
              }}
            />
            <button
              type="button"
              onClick={() => setShowDtModal(true)}
              style={{
                padding: 10,
                borderRadius: 8,
                border: "1px solid #ddd",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              시간 설정
            </button>
          </div>
        </div>

        {/* 2행: 카테고리, 파일첨부, 등록 버튼 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 2fr 240px",
            gap: 12,
          }}
        >
          <select
            value={form.category || ""}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }}
          >
            <option value="">카테고리 선택</option>
            {suggestions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
            <option value="기타">기타</option>
          </select>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="file"
              accept="image/*,application/pdf"
              ref={fileInputRef}
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                if (f && f.size > MAX_FILE_SIZE) {
                  alert("파일 크기 제한: 3MB 이하만 업로드 가능합니다.");
                  e.target.value = "";
                  setForm({ ...form, file: null });
                  return;
                }
                setForm({ ...form, file: f });
              }}
              style={{
                padding: 10,
                border: "1px solid #ddd",
                borderRadius: 8,
                flex: 1,
              }}
            />
          </div>
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
      <DateTimeModal
        visible={showDtModal}
        initialIso={form.date}
        onClose={() => setShowDtModal(false)}
        onSave={(iso) => setForm({ ...form, date: iso })}
      />
    </div>
  );
};

export default TransactionForm;
