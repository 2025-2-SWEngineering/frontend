import React, { useEffect, useState } from "react";

type Props = {
  visible: boolean;
  initialIso?: string; // ISO string or YYYY-MM-DD
  onClose: () => void;
  onSave: (isoString: string) => void;
};

function parseToLocalParts(input?: string): { date: string; time: string } {
  try {
    if (!input) {
      const now = new Date();
      const date = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 10);
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      return { date, time: `${hh}:${mm}` };
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
      return { date: input, time: "00:00" };
    }
    const d = new Date(input);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return { date: `${y}-${m}-${day}`, time: `${hh}:${mm}` };
  } catch {
    const now = new Date();
    const date = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10);
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    return { date, time: `${hh}:${mm}` };
  }
}

const DateTimeModal: React.FC<Props> = ({ visible, initialIso, onClose, onSave }) => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  useEffect(() => {
    if (!visible) return;
    const p = parseToLocalParts(initialIso);
    setDate(p.date);
    setTime(p.time);
  }, [visible, initialIso]);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(420px, 96vw)",
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          padding: 20,
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: 12, color: "#111827" }}>거래 시간 설정</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }}
          />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
          <button onClick={onClose} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}>취소</button>
          <button
            onClick={() => {
              if (!date || !time) return;
              // local -> ISO
              const iso = new Date(`${date}T${time}:00`).toISOString();
              onSave(iso);
              onClose();
            }}
            style={{ padding: "8px 12px", borderRadius: 8, background: "#111827", color: "#fff", border: "none", cursor: "pointer" }}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateTimeModal;


