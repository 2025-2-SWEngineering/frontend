import React, { useState } from "react";
import "./ReportModal.css";

interface ReportModalProps {
  onClose: () => void;
  groupId: number;
  groupName: string;
  onDownload: (format: "pdf" | "xlsx", from: string, to: string) => Promise<void>;
}

type PeriodPreset = "1month" | "3months" | "6months" | "custom";

const ReportModal: React.FC<ReportModalProps> = ({ onClose, groupName, onDownload }) => {
  const [periodPreset, setPeriodPreset] = useState<PeriodPreset>("1month");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [format, setFormat] = useState<"pdf" | "xlsx">("pdf");
  const [loading, setLoading] = useState(false);

  const getDateRange = (): { from: string; to: string } => {
    const today = new Date();
    const to = today.toISOString().slice(0, 10);

    if (periodPreset === "custom") {
      return { from: customFrom, to: customTo || to };
    }

    const months = periodPreset === "1month" ? 1 : periodPreset === "3months" ? 3 : 6;
    const fromDate = new Date(today.getFullYear(), today.getMonth() - months, today.getDate());
    const from = fromDate.toISOString().slice(0, 10);

    return { from, to };
  };

  const handleDownload = async () => {
    const { from, to } = getDateRange();
    
    if (!from || !to) {
      alert("기간을 선택해주세요.");
      return;
    }

    if (from > to) {
      alert("시작일이 종료일보다 늦을 수 없습니다.");
      return;
    }

    setLoading(true);
    try {
      await onDownload(format, from, to);
      onClose();
    } catch (e) {
      console.error(e);
      alert("보고서 다운로드에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content report-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">📊 보고서 다운로드</span>
          <button className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          <div className="report-group-name">
            <strong>그룹:</strong> {groupName}
          </div>

          <div className="report-section">
            <label className="report-label">기간 선택</label>
            <div className="period-presets">
              <button
                type="button"
                className={`preset-btn ${periodPreset === "1month" ? "active" : ""}`}
                onClick={() => setPeriodPreset("1month")}
              >
                1개월
              </button>
              <button
                type="button"
                className={`preset-btn ${periodPreset === "3months" ? "active" : ""}`}
                onClick={() => setPeriodPreset("3months")}
              >
                3개월
              </button>
              <button
                type="button"
                className={`preset-btn ${periodPreset === "6months" ? "active" : ""}`}
                onClick={() => setPeriodPreset("6months")}
              >
                6개월
              </button>
              <button
                type="button"
                className={`preset-btn ${periodPreset === "custom" ? "active" : ""}`}
                onClick={() => setPeriodPreset("custom")}
              >
                직접 입력
              </button>
            </div>

            {periodPreset === "custom" && (
              <div className="custom-date-range">
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="date-input"
                />
                <span className="date-separator">~</span>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="date-input"
                />
              </div>
            )}
          </div>

          <div className="report-section">
            <label className="report-label">파일 형식</label>
            <div className="format-options">
              <label className="format-option">
                <input
                  type="radio"
                  name="format"
                  value="pdf"
                  checked={format === "pdf"}
                  onChange={() => setFormat("pdf")}
                />
                <span className="format-icon">📄</span>
                <span>PDF</span>
              </label>
              <label className="format-option">
                <input
                  type="radio"
                  name="format"
                  value="xlsx"
                  checked={format === "xlsx"}
                  onChange={() => setFormat("xlsx")}
                />
                <span className="format-icon">📊</span>
                <span>Excel</span>
              </label>
            </div>
          </div>

          <div className="report-info">
            <p>📋 보고서에 포함되는 내용:</p>
            <ul>
              <li>총 수입 / 총 지출 / 현재 잔액</li>
              <li>거래 내역 상세</li>
            </ul>
          </div>

          <button
            className="download-btn"
            onClick={handleDownload}
            disabled={loading}
          >
            {loading ? "다운로드 중..." : `${format.toUpperCase()} 다운로드`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
