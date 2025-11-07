import React from "react";
import { Card, SectionTitle } from "../../styles/primitives";
import { Skeleton } from "../Loading";
import DuesTable from "../shared/DuesTable";

type Due = { userId: number; userName: string; isPaid: boolean; paidAt?: string };

type Props = {
  loading: boolean;
  dues: Array<Due>;
  isAdmin: boolean;
  onToggle: (userId: number, next: boolean) => void;
};

const DuesSection: React.FC<Props> = ({ loading, dues, isAdmin, onToggle }) => {
  return (
    <Card style={{ marginTop: 20 }}>
      <SectionTitle>회비 납부 현황</SectionTitle>
      {loading ? (
        <div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 12,
              paddingBottom: 12,
              borderBottom: "1px solid #eee",
              marginBottom: 8,
            }}
          >
            <Skeleton height={18} width={120} />
            <Skeleton height={18} width={80} />
            <Skeleton height={18} width={80} />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 12,
                padding: "8px 0",
                borderBottom: "1px solid #f6f6f6",
              }}
            >
              <Skeleton height={16} />
              <Skeleton height={16} width={80} />
              <Skeleton height={16} width={100} />
            </div>
          ))}
        </div>
      ) : (
        <DuesTable dues={dues} isAdmin={isAdmin} onToggle={onToggle} />
      )}
    </Card>
  );
};

export default DuesSection;


