import React from "react";
import { Card, SectionTitle } from "../../styles/primitives";
import { Skeleton } from "../Loading";
import TransactionsList from "../shared/TransactionsList";

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
  loading: boolean;
  items: Array<Item>;
  groupId: number;
  isAdmin: boolean;
  currentUserId?: number;
  onAfterChange: () => Promise<void> | void;
};

const RecentTransactionsSection: React.FC<Props> = ({
  loading,
  items,
  groupId,
  isAdmin,
  currentUserId,
  onAfterChange,
}) => {
  return (
    <Card>
      <SectionTitle>최근 거래 내역</SectionTitle>
      {loading ? (
        <div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 0",
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              <Skeleton width={120} height={22} />
              <Skeleton width={80} height={22} />
              <Skeleton height={22} />
            </div>
          ))}
        </div>
      ) : (
        <TransactionsList
          items={items}
          groupId={groupId}
          isAdmin={isAdmin}
          currentUserId={currentUserId}
          onAfterChange={onAfterChange}
        />
      )}
    </Card>
  );
};

export default RecentTransactionsSection;


