import React from "react";
import styled from "styled-components";
import { removeTransaction } from "../../api/client";
import { Button, Badge, AmountText, colors, media } from "../../styles/primitives";
import { formatDisplayDateTime, formatCurrencyKRW } from "../../utils/format";
import { notifyError, confirmAsync } from "../../utils/notify";
import api from "../../services/api";

type Item = {
  id: number;
  type: "income" | "expense";
  amount: number;
  description: string;
  date: string;
  receiptUrl?: string;
  category?: string;
  createdBy?: number;
};

type Props = {
  items: Array<Item>;
  groupId: number;
  isAdmin: boolean;
  currentUserId?: number;
  onAfterChange: () => Promise<void> | void;
};

const TransactionsList: React.FC<Props> = ({
  items,
  groupId,
  isAdmin,
  currentUserId,
  onAfterChange,
}) => {
  const openReceipt = async (receiptUrl: string) => {
    if (/^https?:\/\//i.test(receiptUrl)) {
      window.open(receiptUrl, "_blank");
      return;
    }
    try {
      const { data } = await api.get("/uploads/presign/get", {
        params: { key: receiptUrl },
      });
      window.open(data.url, "_blank");
    } catch {
      notifyError("영수증 링크 생성에 실패했습니다.");
    }
  };

  const canDelete = (it: Item) => isAdmin || (!!currentUserId && currentUserId === it.createdBy);

  const handleDelete = async (id: number) => {
    if (!groupId) return;
    if (!(await confirmAsync("이 거래를 삭제할까요?"))) return;
    try {
      await removeTransaction(id, groupId);
      await onAfterChange();
    } catch (err: unknown) {
      const axiosLike = err as { response?: { data?: { message?: string } } };
      notifyError(axiosLike.response?.data?.message || "삭제에 실패했습니다.");
    }
  };

  // 날짜 표시는 유틸 함수로 통일

  if (items.length === 0) {
    return <p style={{ color: colors.muted }}>아직 거래 내역이 없습니다.</p>;
  }

  return (
    <List>
      {items.map((it) => (
        <Row key={it.id}>
          <AmountText $type={it.type}>
            {it.type === "income" ? "+ " : "- "}
            {formatCurrencyKRW(it.amount)}
          </AmountText>
          <Meta>
            <Badge>{(it.category && it.category.trim()) || "기타"}</Badge>
            <span>{it.description}</span>
          </Meta>
          <When>{formatDisplayDateTime(it.date)}</When>
          <ActionButtons>
            {it.receiptUrl && (
              <Button
                $variant="outline"
                onClick={() => openReceipt(it.receiptUrl!)}
                style={{ padding: "2px 8px" }}
              >
                영수증
              </Button>
            )}
            {canDelete(it) && (
              <Button
                $variant="outline"
                onClick={() => handleDelete(it.id)}
                style={{
                  padding: "2px 8px",
                  borderColor: colors.dangerSoft,
                  color: colors.danger,
                }}
              >
                삭제
              </Button>
            )}
          </ActionButtons>
        </Row>
      ))}
    </List>
  );
};

export default TransactionsList;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const Row = styled.li`
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid ${colors.border};
  transition: background 0.15s ease;
  flex-wrap: wrap;
  gap: 8px;

  ${media.mobile} {
    flex-direction: column;
    align-items: flex-start;
    padding: 16px 0;
  }

  &:hover {
    background: ${colors.bgSoft};
  }
`;

const Meta = styled.span`
  color: ${colors.text};
  flex: 1;
  margin-left: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;

  ${media.mobile} {
    margin-left: 0;
    width: 100%;
    flex-wrap: wrap;
  }
`;

const When = styled.span`
  color: ${colors.muted};
  min-width: 120px;
  text-align: right;

  ${media.mobile} {
    min-width: auto;
    text-align: left;
    font-size: 13px;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;

  ${media.mobile} {
    width: 100%;
    justify-content: flex-end;
    margin-top: 8px;
  }
`;
