import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Cell,
} from "recharts";
import { formatNumberKR } from "../utils/format";
import { colors } from "../styles/primitives";

type Datum = { month: string; income: number; expense: number };

type Props = {
  data: Array<Datum>;
};

const MonthlyBars: React.FC<Props> = ({ data }) => {
  const currency = (v: number) => formatNumberKR(Number(v)) + "원";
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const p = payload[0]?.payload || {};
      const isIncome = !!p.isIncomeDominant;
      return (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            padding: 10,
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 6 }}>{label}</div>
          <div>수입: {currency(Number(p.income || 0))}</div>
          <div>지출: {currency(Number(p.expense || 0))}</div>
          <div style={{ marginTop: 6, color: isIncome ? "#16a34a" : "#dc2626" }}>
            {isIncome ? "순수익" : "순지출"}: {currency(Number(p.net || 0))}
          </div>
        </div>
      );
    }
    return null;
  };
  const mapped = React.useMemo(
    () =>
      (data || []).map((d) => {
        const income = Number(d.income || 0);
        const expense = Number(d.expense || 0);
        const isIncomeDominant = income >= expense;
        const net = Math.abs(income - expense);
        return { month: d.month, net, isIncomeDominant, income, expense };
      }),
    [data],
  );
  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <BarChart
          data={mapped}
          margin={{ top: 12, right: 24, left: 8, bottom: 12 }}
          barGap={6}
          barCategoryGap={20}
        >
          <defs>
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.income} stopOpacity={0.9} />
              <stop offset="100%" stopColor={colors.income} stopOpacity={0.6} />
            </linearGradient>
            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.expense} stopOpacity={0.9} />
              <stop offset="100%" stopColor={colors.expense} stopOpacity={0.6} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="month" tickMargin={8} />
          <YAxis tickFormatter={(v) => new Intl.NumberFormat("ko-KR").format(Number(v))} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="net" name="순변동" radius={[6, 6, 0, 0]} maxBarSize={42}>
            {mapped.map((d, idx) => (
              <Cell
                key={`${d.month}-${idx}`}
                fill={d.isIncomeDominant ? "url(#incomeGradient)" : "url(#expenseGradient)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyBars;
