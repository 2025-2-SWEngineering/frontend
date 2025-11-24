import React, { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createTransactionApi, presignPut, uploadDirect } from "../api/client";
import { LoadingOverlay } from "../components/ui";
import { notifyError, notifySuccess } from "../utils/notify";
import "./TransactionCreatePage.css";

const CATEGORIES = [
  "식비",
  "교통/차량",
  "쇼핑",
  "문화/여가",
  "교육/학습",
  "의료/건강",
  "주거/통신",
  "기타",
];

const TransactionCreatePage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Create local preview
      const reader = new FileReader();
      reader.onload = (ev) => {
        setReceiptUrl(ev.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const uploadReceipt = async (file: File): Promise<string> => {
    // 1. Presign
    const { url, key } = await presignPut(file.name, file.type);
    
    // 2. Direct Upload (PUT to S3)
    // Note: In a real S3 scenario, we would use fetch/axios to PUT to 'url'.
    // However, the current backend implementation of 'uploadDirect' seems to handle multipart upload directly?
    // Let's check api/client.ts again. 
    // Wait, client.ts has 'uploadDirect' which posts to '/uploads/direct'.
    // And 'presignPut' returns url/key.
    // If we use 'uploadDirect', we send FormData.
    
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadDirect(fd);
    if (!result.url) throw new Error("Upload failed");
    return result.url;
  };

  const handleSubmit = async () => {
    if (!amount || !description || !category || !date) {
      notifyError("모든 필수 항목을 입력해주세요.");
      return;
    }

    if (!file && !receiptUrl) {
       notifyError("영수증을 첨부해주세요.");
       return;
    }

    try {
      setLoading(true);
      let finalReceiptUrl = receiptUrl;

      // Upload file if selected
      if (file) {
        finalReceiptUrl = await uploadReceipt(file);
      }

      await createTransactionApi({
        groupId: Number(groupId),
        type,
        amount: Number(amount),
        description,
        date,
        category,
        receiptUrl: finalReceiptUrl || "",
      });

      notifySuccess("거래 내역이 추가되었습니다.");
      navigate("/dashboard");
    } catch (e) {
      console.error(e);
      notifyError("거래 내역 추가에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transaction-create-container">
      <LoadingOverlay visible={loading} label="저장 중..." />
      
      <div className="create-header">
        <button className="back-button" onClick={() => navigate("/dashboard")}>
          {"<"}
        </button>
        <span className="header-title">거래 내역 추가</span>
      </div>

      <div className="create-content">
        {/* Type Toggle */}
        <div className="type-toggle">
          <div 
            className={`type-option expense ${type === "expense" ? "active" : ""}`}
            onClick={() => setType("expense")}
          >
            지출
          </div>
          <div 
            className={`type-option income ${type === "income" ? "active" : ""}`}
            onClick={() => setType("income")}
          >
            수입
          </div>
        </div>

        {/* Date */}
        <div className="form-group">
          <label className="form-label">날짜</label>
          <input
            type="date"
            className="form-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {/* Amount */}
        <div className="form-group">
          <label className="form-label">금액</label>
          <input
            type="number"
            className="form-input"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="form-label">{type === "expense" ? "지출처" : "수입처"}</label>
          <input
            type="text"
            className="form-input"
            placeholder="내용을 입력하세요"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Category */}
        <div className="form-group">
          <label className="form-label">카테고리</label>
          <select
            className="form-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">선택하세요</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Receipt Upload */}
        <div className="form-group">
          <label className="form-label">영수증 (필수)</label>
          <div 
            className="receipt-upload-area"
            onClick={() => fileInputRef.current?.click()}
          >
            {receiptUrl ? (
              <div className="receipt-preview">
                <img src={receiptUrl} alt="Receipt Preview" />
                <button 
                  className="remove-receipt"
                  onClick={(e) => {
                    e.stopPropagation();
                    setReceiptUrl(null);
                    setFile(null);
                  }}
                >
                  &times;
                </button>
              </div>
            ) : (
              <div className="upload-placeholder">
                <span className="upload-icon">📷</span>
                <span>영수증 사진을 등록해주세요</span>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
        </div>

        <button 
          className="submit-button"
          onClick={handleSubmit}
          disabled={!amount || !description || !category || !date || (!file && !receiptUrl)}
        >
          저장하기
        </button>
      </div>
    </div>
  );
};

export default TransactionCreatePage;
