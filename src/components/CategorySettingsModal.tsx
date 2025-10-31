import React, { useEffect, useMemo, useState } from "react";
import { getGroupCategories, setGroupCategories } from "../utils/category";

type Props = {
  groupId: number;
  visible: boolean;
  onClose: () => void;
};

const CategorySettingsModal: React.FC<Props> = ({ groupId, visible, onClose }) => {
  const [list, setList] = useState<string[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (!visible) return;
    setList(getGroupCategories(groupId));
    setInput("");
  }, [groupId, visible]);

  const canSave = useMemo(() => list.length >= 0, [list]);

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
          width: "min(450px, 96vw)",
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          padding: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <h2 style={{ margin: 0, color: "#111827" }}>카테고리 설정</h2>
          {/* <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#6b7280" }}>닫기</button> */}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: 8 }}>
          <input
            type="text"
            placeholder="카테고리 추가"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const v = input.trim();
                if (!v) return;
                setList((prev) => Array.from(new Set([...prev, v])));
                setInput("");
              }
            }}
            style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }}
          />
          <button
            onClick={() => {
              const v = input.trim();
              if (!v) return;
              setList((prev) => Array.from(new Set([...prev, v])));
              setInput("");
            }}
            style={{
              padding: 10,
              borderRadius: 8,
              background: "#4f46e5",
              color: "#fff",
              border: "none",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            추가
          </button>
        </div>

        <div style={{ marginTop: 12, maxHeight: 360, overflow: "auto", border: "1px solid #eee", borderRadius: 8 }}>
          {list.length === 0 ? (
            <div style={{ padding: 16, color: "#6b7280" }}>등록된 카테고리가 없습니다. 위 입력창에서 추가하세요.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {list.map((c, idx) => (
                  <tr key={`${c}-${idx}`}>
                    <td style={{ padding: 10, borderBottom: "1px solid #f5f5f5" }}>{c}</td>
                    <td style={{ padding: 10, borderBottom: "1px solid #f5f5f5", textAlign: "right", width: 140 }}>
                      <button
                        onClick={() => {
                          const name = prompt("이름 변경", c) || "";
                          const v = name.trim();
                          if (!v) return;
                          setList((prev) => {
                            const next = prev.slice();
                            next[idx] = v;
                            return Array.from(new Set(next));
                          });
                        }}
                        style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: "pointer", marginRight: 6 }}
                      >
                        이름변경
                      </button>
                      <button
                        onClick={() => setList((prev) => prev.filter((_, i) => i !== idx))}
                        style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #ef4444", color: "#ef4444", background: "#fff", cursor: "pointer" }}
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
          <button onClick={onClose} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}>취소</button>
          <button
            onClick={() => {
              if (!canSave) return;
              setGroupCategories(groupId, list);
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

export default CategorySettingsModal;


