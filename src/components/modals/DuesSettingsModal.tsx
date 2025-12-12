import React, { useState, useEffect } from "react";
import {
  ModalBackdrop,
  ModalCard,
  SectionTitle,
  Input,
  Button,
  Flex,
  Spacer,
} from "../../styles/primitives";
import { formatCurrencyKRW } from "../../utils/format";

interface DuesSettingsModalProps {
  onClose: () => void;
  groupId: number;
  onResetAll: () => void;
  isAdmin: boolean;
}

const DuesSettingsModal: React.FC<DuesSettingsModalProps> = ({ onClose, groupId, onResetAll, isAdmin }) => {
  const [amount, setAmount] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(`dues_amount_${groupId}`);
    if (saved) {
      setAmount(saved);
    }
  }, [groupId]);

  const handleSubmit = () => {
    const val = parseInt(amount.replace(/,/g, ""), 10);
    if (isNaN(val) || val < 0) {
      alert("유효한 금액을 입력해주세요.");
      return;
    }
    localStorage.setItem(`dues_amount_${groupId}`, val.toString());
    alert("회비 금액이 설정되었습니다.");
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers
    const val = e.target.value.replace(/[^0-9]/g, "");
    setAmount(val);
  };

  return (
    <ModalBackdrop onClick={onClose}>
      <ModalCard onClick={(e) => e.stopPropagation()}>
        <SectionTitle>회비 설정</SectionTitle>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
            회비 금액 (원)
          </label>
          <Input value={amount} onChange={handleChange} placeholder="금액 입력" type="text" />
          <div style={{ marginTop: 8, fontSize: "14px", color: "#666" }}>
            {amount ? formatCurrencyKRW(parseInt(amount, 10)) : "0원"}
          </div>
        </div>

        <div style={{ fontSize: "13px", color: "#888", marginBottom: 20, lineHeight: 1.5 }}>
          * 회비 금액을 설정하면, 멤버가 &apos;납부&apos; 상태로 변경될 때 자동으로 해당 금액만큼
          수입 내역이 추가됩니다.
          <br />
          (이 설정은 현재 브라우저에만 저장됩니다.)
        </div>

        {isAdmin && (
          <Button 
            $variant="outline" 
            style={{ width: "100%", borderColor: "#e03e3e", color: "#e03e3e", marginBottom: 20 }}
            onClick={() => {
              if (window.confirm("정말로 모든 멤버의 회비 납부 상태를 '미납'으로 초기화하시겠습니까?\n(이 작업은 되돌릴 수 없습니다.)")) {
                onResetAll();
                onClose();
              }
            }}
          >
            회비 납부 전부 초기화
          </Button>
        )}

        <Spacer $size={20} />

        <Flex $gap={10}>
          <Button $variant="outline" onClick={onClose} style={{ flex: 1 }}>
            취소
          </Button>
          <Button onClick={handleSubmit} style={{ flex: 1 }}>
            저장
          </Button>
        </Flex>
      </ModalCard>
    </ModalBackdrop>
  );
};

export default DuesSettingsModal;
