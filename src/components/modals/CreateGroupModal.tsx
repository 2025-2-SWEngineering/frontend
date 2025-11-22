import React, { useState } from "react";
import { createNewGroup } from "../../api/client";
import { notifyError } from "../../utils/notify";
import "../../pages/GroupSelectPage.css";

interface CreateGroupModalProps {
  onClose: () => void;
  onCreated: (groupId: number) => void;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ onClose, onCreated }) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setLoading(true);
      const group = await createNewGroup(name.trim());
      if (group?.id) {
        onCreated(group.id);
      }
    } catch (error) {
      notifyError("그룹 생성에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">새 그룹 생성</h2>
        <form onSubmit={handleSubmit}>
          <input
            className="modal-input"
            placeholder="그룹 이름 (예: 가족, 동창회)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <div className="modal-actions">
            <button type="button" className="modal-button cancel" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="modal-button confirm" disabled={loading}>
              {loading ? "생성 중..." : "생성"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
