import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { formatNumberKR } from "../utils/format";
import { colors } from "../styles/primitives";

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
  colors.primary,
  colors.info,
  colors.amber,
  colors.income,
  colors.expense,
  colors.violet,
  colors.teal,
  colors.orange,
  colors.lime,
  colors.indigo,
];

const CategoryChart: React.FC<Props> = ({ data }) => {
  const incomeTotal = data.reduce((acc, d) => acc + Math.max(0, d.income || 0), 0);
  const expenseTotal = data.reduce((acc, d) => acc + Math.max(0, d.expense || 0), 0);
  const incomeData = data
    .filter((d) => (d.income || 0) > 0)
    .map((d) => ({ name: d.category, value: Math.max(0, d.income || 0) }));
  const expenseData = data
    .filter((d) => (d.expense || 0) > 0)
    .map((d) => ({ name: d.category, value: Math.max(0, d.expense || 0) }));
  return (
    <div
      style={{
        width: "100%",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16,
      }}
    >
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={incomeData}
              dataKey="value"
              nameKey="name"
              outerRadius={110}
              innerRadius={56}
              labelLine={false}
              label={(d) => `${d.name}`}
            >
              {incomeData.map((entry, index) => (
                <Cell key={`inc-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v: number, n: string) => [formatNumberKR(Number(v)) + "원", n]}
              contentStyle={{ borderRadius: 8, border: `1px solid ${colors.border}` }}
            />
            {/* <Legend verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: 8 }} /> */}
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ pointerEvents: "none" }}
            >
              <tspan fontSize="12" fill={colors.gray500}>
                수입 합계
              </tspan>
              <tspan x="50%" dy="1.2em" fontSize="14" fontWeight={700} fill={colors.dark}>
                {formatNumberKR(incomeTotal)}원
              </tspan>
            </text>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={expenseData}
              dataKey="value"
              nameKey="name"
              outerRadius={110}
              innerRadius={56}
              labelLine={false}
              label={(d) => `${d.name}`}
            >
              {expenseData.map((entry, index) => (
                <Cell key={`exp-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v: number, n: string) => [formatNumberKR(Number(v)) + "원", n]}
              contentStyle={{ borderRadius: 8, border: `1px solid ${colors.border}` }}
            />
            {/* <Legend verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: 8 }} /> */}
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ pointerEvents: "none" }}
            >
              <tspan fontSize="12" fill={colors.gray500}>
                지출 합계
              </tspan>
              <tspan x="50%" dy="1.2em" fontSize="14" fontWeight={700} fill={colors.dark}>
                {formatNumberKR(expenseTotal)}원
              </tspan>
            </text>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CategoryChart;
