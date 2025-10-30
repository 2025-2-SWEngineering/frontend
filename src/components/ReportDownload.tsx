import React from "react";

type Range = { from: string; to: string };

type Props = {
  range: Range;
  onChange: (next: Range) => void;
  onDownload: (kind: "pdf" | "xlsx") => void;
};

const ReportDownload: React.FC<Props> = ({ range, onChange, onDownload }) => {
  return (
    <div
      style={{
        background: "white",
        padding: 24,
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
        marginBottom: 20,
      }}
    >
      <h2 style={{ marginBottom: 16, color: "#333" }}>보고서 다운로드</h2>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <span style={{ color: "#666" }}>기간</span>
        <input
          type="date"
          value={range.from}
          onChange={(e) => onChange({ ...range, from: e.target.value })}
          style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }}
        />
        <span>~</span>
        <input
          type="date"
          value={range.to}
          onChange={(e) => onChange({ ...range, to: e.target.value })}
          style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }}
        />
        <button
          onClick={() => onDownload("pdf")}
          style={{
            padding: "8px 12px",
            background: "#111827",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          PDF
        </button>
        <button
          onClick={() => onDownload("xlsx")}
          style={{
            padding: "8px 12px",
            background: "#0ea5e9",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Excel
        </button>
      </div>
    </div>
  );
};

export default ReportDownload;
