import React, { useState, useEffect } from "react";
import { createTransactionApi, uploadDirect, getUploadMode, presignPut } from "../../api/client";
import {
  ModalBackdrop,
  ModalCard,
  SectionTitle,
  Input,
  Button,
  Flex,
  Spacer,
} from "../../styles/primitives";
import axios from "axios";

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
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadMode, setUploadMode] = useState<"s3" | "local">("local");

  useEffect(() => {
    getUploadMode().then(setUploadMode).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !date) {
      alert("필수 항목을 입력해주세요.");
      return;
    }

    if (type === "expense" && !file) {
      alert("지출 내역은 영수증이 필수입니다.");
      return;
    }

    try {
      setLoading(true);
      let receiptUrl = "";

      if (file) {
        if (uploadMode === "local") {
          const formData = new FormData();
          formData.append("file", file);
          const uploadRes = await uploadDirect(formData);
          if (uploadRes.url) {
            receiptUrl = uploadRes.url;
          } else if (uploadRes.key) {
             receiptUrl = uploadRes.key;
          }
        } else {
          // S3 Mode
          const { url, key } = await presignPut(file.name, file.type);
          await axios.put(url, file, {
            headers: { "Content-Type": file.type },
          });
          receiptUrl = key; // For S3, we usually store the key
        }
      }

      await createTransactionApi({
        groupId,
        type,
        amount: Number(amount),
        description,
        date: new Date(date).toISOString(),
        category: category || (type === "income" ? "기타 수입" : "기타 지출"),
        receiptUrl: receiptUrl || undefined,
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
    <ModalBackdrop onClick={onClose}>
      <ModalCard onClick={(e) => e.stopPropagation()}>
        <SectionTitle>거래 내역 추가</SectionTitle>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>유형</label>
            <Flex $gap={10}>
              <Button
                type="button"
                $variant={type === "expense" ? "danger" : "outline"}
                onClick={() => setType("expense")}
                style={{ flex: 1 }}
              >
                지출
              </Button>
              <Button
                type="button"
                $variant={type === "income" ? "primary" : "outline"}
                onClick={() => setType("income")}
                style={{ flex: 1 }}
              >
                수입
              </Button>
            </Flex>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>날짜</label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>금액</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              required
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>내용</label>
            <Input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="내용을 입력하세요"
              required
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>카테고리</label>
            <Input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="식비, 교통비 등"
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
              영수증 {type === "expense" && <span style={{ color: "red" }}>*</span>}
            </label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setFile(e.target.files[0]);
                }
              }}
            />
          </div>

          <Spacer $size={20} />

          <Flex $gap={10}>
            <Button type="button" $variant="outline" onClick={onClose} style={{ flex: 1 }}>
              취소
            </Button>
            <Button type="submit" disabled={loading} style={{ flex: 1 }}>
              {loading ? "저장 중..." : "저장"}
            </Button>
          </Flex>
        </form>
      </ModalCard>
    </ModalBackdrop>
  );
};

export default TransactionCreateModal;

