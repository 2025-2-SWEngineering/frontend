import React, { useEffect, useMemo, useState } from "react";
import { getGroupCategories, setGroupCategories } from "../../utils/category";
import {
  ModalBackdrop,
  ModalCard,
  Button,
  Input,
  Table,
  Td,
  colors,
} from "../../styles/primitives";

type Props = {
  groupId: number;
  visible: boolean;
  onClose: () => void;
};

const CategorySettingsModal: React.FC<Props> = ({ groupId, visible, onClose }) => {
  const [list, setList] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");

  useEffect(() => {
    if (!visible) return;
    setList(getGroupCategories(groupId));
    setInput("");
  }, [groupId, visible]);

  const canSave = useMemo(() => list.length >= 0, [list]);

  if (!visible) return null;

  return (
    <ModalBackdrop role="dialog" aria-modal="true" onClick={onClose}>
      <ModalCard onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <h2 style={{ margin: 0, color: colors.dark }}>카테고리 설정</h2>
          {/* <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#6b7280" }}>닫기</button> */}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: 8 }}>
          <Input
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
          />
          <Button
            onClick={() => {
              const v = input.trim();
              if (!v) return;
              setList((prev) => Array.from(new Set([...prev, v])));
              setInput("");
            }}
          >
            추가
          </Button>
        </div>

        <div
          style={{
            marginTop: 12,
            maxHeight: 360,
            overflow: "auto",
            border: `1px solid ${colors.divider}`,
            borderRadius: 8,
          }}
        >
          {list.length === 0 ? (
            <div style={{ padding: 16, color: colors.gray500 }}>
              등록된 카테고리가 없습니다. 위 입력창에서 추가하세요.
            </div>
          ) : (
            <Table>
              <tbody>
                {list.map((c, idx) => (
                  <tr key={`${c}-${idx}`}>
                    <Td style={{ padding: 10 }}>
                      {editingIdx === idx ? (
                        <div style={{ display: "flex", gap: 6 }}>
                          <Input
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            style={{ flex: 1 }}
                          />
                          <Button
                            onClick={() => {
                              const v = editingValue.trim();
                              if (!v) return;
                              setList((prev) => {
                                const next = prev.slice();
                                next[idx] = v;
                                return Array.from(new Set(next));
                              });
                              setEditingIdx(null);
                              setEditingValue("");
                            }}
                          >
                            저장
                          </Button>
                          <Button
                            $variant="outline"
                            onClick={() => {
                              setEditingIdx(null);
                              setEditingValue("");
                            }}
                          >
                            취소
                          </Button>
                        </div>
                      ) : (
                        <span>{c}</span>
                      )}
                    </Td>
                    <Td style={{ padding: 10, textAlign: "right", width: 200 }}>
                      {editingIdx === idx ? null : (
                        <>
                          <Button
                            onClick={() => {
                              setEditingIdx(idx);
                              setEditingValue(c);
                            }}
                            $variant="outline"
                            style={{ marginRight: 6 }}
                          >
                            이름변경
                          </Button>
                          <Button
                            $variant="outline"
                            onClick={() => setList((prev) => prev.filter((_, i) => i !== idx))}
                          >
                            삭제
                          </Button>
                        </>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
          <Button $variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button
            onClick={() => {
              if (!canSave) return;
              setGroupCategories(groupId, list);
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

export default CategorySettingsModal;
