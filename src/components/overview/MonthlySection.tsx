import React from "react";
import { Card, SectionTitle } from "../../styles/primitives";
import { Skeleton } from "../Loading";
import MonthlyBars from "../MonthlyBars";

type Props = {
  loading: boolean;
  data: Array<{ month: string; income: number; expense: number }>;
};

const MonthlySection: React.FC<Props> = ({ loading, data }) => {
  return (
    <Card style={{ marginBottom: 20 }}>
      <SectionTitle>월별 수입/지출 추이</SectionTitle>
      {loading ? (
        <Skeleton height={300} />
      ) : data.length === 0 ? (
        <p style={{ color: "#999" }}>데이터가 없습니다.</p>
      ) : (
        <MonthlyBars data={data} />
      )}
    </Card>
  );
};

export default MonthlySection;


