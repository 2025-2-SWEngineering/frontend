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
  const currency = (v: number) =>
    new Intl.NumberFormat("ko-KR").format(Number(v)) + "원";
  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 12, right: 24, left: 8, bottom: 12 }}
          barGap={6}
          barCategoryGap={20}
        >
          <defs>
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#16a34a" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#16a34a" stopOpacity={0.6} />
            </linearGradient>
            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#dc2626" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#dc2626" stopOpacity={0.6} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="month" tickMargin={8} />
          <YAxis
            tickFormatter={(v) =>
              new Intl.NumberFormat("ko-KR").format(Number(v))
            }
          />
          <Tooltip
            formatter={(v: number) => currency(v)}
            contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb" }}
          />
          <Legend
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ paddingTop: 8 }}
          />
          <Bar
            dataKey="income"
            name="수입"
            fill="url(#incomeGradient)"
            radius={[6, 6, 0, 0]}
            maxBarSize={42}
          />
          <Bar
            dataKey="expense"
            name="지출"
            fill="url(#expenseGradient)"
            radius={[6, 6, 0, 0]}
            maxBarSize={42}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyBars;
