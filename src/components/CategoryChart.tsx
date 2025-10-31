import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

type CategoryDatum = {
  category: string;
  income: number;
  expense: number;
  total: number;
};

type Props = {
  data: Array<CategoryDatum>;
};

const COLORS = [
  "#0ea5e9",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#8b5cf6",
  "#14b8a6",
  "#f97316",
  "#84cc16",
  "#e11d48",
  "#6366f1",
];

const CategoryChart: React.FC<Props> = ({ data }) => {
  const nf = new Intl.NumberFormat("ko-KR");
  const totalSum = data.reduce((acc, d) => acc + Math.abs(d.total || 0), 0);
  const pieData = data.map((d) => ({
    name: d.category,
    value: Math.abs(d.total),
    raw: d,
  }));
  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            outerRadius={110}
            innerRadius={56}
            labelLine={false}
            label={(d) => `${d.name}`}
          >
            {pieData.map((entry, index) => (
              <Cell key={`c-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v: number, _n, payload: any) => {
              const raw = payload?.payload?.raw as CategoryDatum | undefined;
              if (!raw) return [nf.format(Number(v)) + "원", payload?.name];
              return [
                `${nf.format(raw.total)}원 (수입 ${nf.format(
                  raw.income
                )} / 지출 ${nf.format(raw.expense)})`,
                raw.category,
              ];
            }}
            contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb" }}
          />
          <Legend
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ paddingTop: 8 }}
          />
          {/* center text */}
          {/* Recharts allows arbitrary elements in charts */}
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            style={{ pointerEvents: "none" }}
          >
            <tspan fontSize="12" fill="#6b7280">
              총액
            </tspan>
            <tspan
              x="50%"
              dy="1.2em"
              fontSize="14"
              fontWeight={700}
              fill="#111827"
            >
              {nf.format(totalSum)}원
            </tspan>
          </text>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryChart;
