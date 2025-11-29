import React, { useState } from "react";
import { createTransactionApi } from "../../api/client";
import "./Modal.css"; // Reuse existing modal styles if possible, or create new ones

interface TransactionCreateModalProps {
  groupId: number;
  onClose: () => void;
  onSuccess: () => void;
}

const TransactionCreateModal: React.FC<TransactionCreateModalProps> = ({
  groupId,
  onClose,
  onSuccess,
}) => {
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !date) {
      alert("필수 항목을 입력해주세요.");
      return;
    }

    try {
      setLoading(true);
      await createTransactionApi({
        groupId,
        type,
        amount: Number(amount),
        description,
        date: new Date(date).toISOString(),
        category: category || (type === "income" ? "기타 수입" : "기타 지출"),
      });
      alert("거래 내역이 추가되었습니다.");
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert("거래 내역 추가에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">거래 내역 추가</span>
          <button className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
              <label>유형</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    checked={type === "expense"}
                    onChange={() => setType("expense")}
                  />
                  지출
                </label>
                <label>
                  <input
                    type="radio"
                    checked={type === "income"}
                    onChange={() => setType("income")}
                  />
                  수입
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>날짜</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>금액</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                required
              />
            </div>

            <div className="form-group">
              <label>내용</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="내용을 입력하세요"
                required
              />
            </div>

            <div className="form-group">
              <label>카테고리</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="식비, 교통비 등"
              />
            </div>

            <div className="modal-actions">
              <button type="button" className="cancel-btn" onClick={onClose}>
                취소
              </button>
              <button type="submit" className="save-btn" disabled={loading}>
                {loading ? "저장 중..." : "저장"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TransactionCreateModal;
