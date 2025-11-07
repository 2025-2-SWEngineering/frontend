import React from "react";
import { Card, SectionTitle, Input } from "../../styles/primitives";
import { Skeleton } from "../ui/Loading";
import CategoryChart from "../CategoryChart";

type Range = { from: string; to: string };

type Props = {
  loading: boolean;
  categoryLoading: boolean;
  range: Range;
  onChangeRange: (next: Range) => void;
  data: Array<{ category: string; income: number; expense: number; total: number }>;
};

const CategorySection: React.FC<Props> = ({
  loading,
  categoryLoading,
  range,
  onChangeRange,
  data,
}) => {
  return (
    <Card style={{ marginBottom: 20 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <SectionTitle style={{ margin: 0 }}>항목별 집계</SectionTitle>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Input
            type="date"
            value={range.from}
            onChange={(e) => onChangeRange({ ...range, from: e.target.value })}
          />
          <span style={{ color: "#777" }}>~</span>
          <Input
            type="date"
            value={range.to}
            onChange={(e) => onChangeRange({ ...range, to: e.target.value })}
          />
        </div>
      </div>
      {loading || categoryLoading ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Skeleton height={300} />
          <Skeleton height={300} />
        </div>
      ) : data.length === 0 ? (
        <p style={{ color: "#999" }}>데이터가 없습니다.</p>
      ) : (
        <CategoryChart data={data} />
      )}
    </Card>
  );
};

export default CategorySection;
