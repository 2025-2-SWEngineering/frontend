import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

type CategoryDatum = { category: string; income: number; expense: number; total: number };

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
  const pieData = data.map((d) => ({ name: d.category, value: Math.abs(d.total) }));
  return (
    <div style={{ width: "100%", height: 260 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} innerRadius={40}>
            {pieData.map((entry, index) => (
              <Cell key={`c-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v: number) => new Intl.NumberFormat("ko-KR").format(Number(v)) + "원"} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryChart;


