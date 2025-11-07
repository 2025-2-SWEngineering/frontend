import React, { useEffect, useState } from "react";
import { ModalBackdrop, ModalCard, Button, Input } from "../styles/primitives";

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
    <ModalBackdrop role="dialog" aria-modal="true" onClick={onClose}>
      <ModalCard onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginTop: 0, marginBottom: 12, color: "#111827" }}>거래 시간 설정</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <Input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
          <Button $variant="outline" onClick={onClose}>취소</Button>
          <Button
            onClick={() => {
              if (!date || !time) return;
              const iso = new Date(`${date}T${time}:00`).toISOString();
              onSave(iso);
              onClose();
            }}
          >
            저장
          </Button>
        </div>
      </ModalCard>
    </ModalBackdrop>
  );
};

export default DateTimeModal;


