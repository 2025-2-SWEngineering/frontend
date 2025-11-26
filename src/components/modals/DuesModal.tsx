import React, { useState, useEffect } from "react";
import { ModalBackdrop, ModalCard, SectionTitle, Input, Select, Button, Flex, Spacer } from "../../styles/primitives";

interface DuesModalProps {
  onClose: () => void;
  onSave: (data: { name: string; isPaid: boolean; date: string; isGuest: boolean; userId?: number }) => void;
  initialData?: {
    name: string;
    isPaid: boolean;
    date: string;
    isGuest: boolean;
    userId?: number;
  };
  existingMemberNames: string[];
}

const DuesModal: React.FC<DuesModalProps> = ({ onClose, onSave, initialData, existingMemberNames }) => {
  const [name, setName] = useState(initialData?.name || "");
  const [isPaid, setIsPaid] = useState(initialData?.isPaid || false);
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split("T")[0]);
  const [isGuest, setIsGuest] = useState(initialData?.isGuest ?? true); // Default to guest for new add

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setIsPaid(initialData.isPaid);
      setDate(initialData.date);
      setIsGuest(initialData.isGuest);
    }
  }, [initialData]);

  const handleSubmit = () => {
    if (!name.trim()) {
      alert("이름을 입력해주세요.");
      return;
    }
    // If adding a new person and name exists in members, warn or handle?
    // User said "Add" is for "1번" (non-members). So we treat them as guests.
    
    onSave({
      name,
      isPaid,
      date,
      isGuest,
      userId: initialData?.userId,
    });
  };

  const isEditing = !!initialData;

  return (
    <ModalBackdrop onClick={onClose}>
      <ModalCard onClick={(e) => e.stopPropagation()}>
        <SectionTitle>{isEditing ? "회비 내역 수정" : "회비 내역 추가"}</SectionTitle>
        
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>이름</label>
          <Input 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="이름 입력"
            disabled={isEditing && !isGuest} // Disable name edit for existing real members
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>상태</label>
          <Select 
            value={isPaid ? "paid" : "unpaid"} 
            onChange={(e) => setIsPaid(e.target.value === "paid")}
          >
            <option value="unpaid">미납</option>
            <option value="paid">납부</option>
          </Select>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>납부일</label>
          <Input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <Spacer size={20} />

        <Flex gap={10}>
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

export default DuesModal;
