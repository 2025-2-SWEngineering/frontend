import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
} from "recharts";

type Datum = { month: string; income: number; expense: number };

type Props = {
  data: Array<Datum>;
};

const MonthlyBars: React.FC<Props> = ({ data }) => {
  return (
    <div style={{ width: "100%", height: 260 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(v: number) => new Intl.NumberFormat("ko-KR").format(Number(v)) + "원"} />
          <Legend />
          <Bar dataKey="income" name="수입" fill="#16a34a" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expense" name="지출" fill="#dc2626" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyBars;
