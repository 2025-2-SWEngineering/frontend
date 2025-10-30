import React from "react";

type Datum = { month: string; income: number; expense: number };

type Props = {
  data: Array<Datum>;
};

const MonthlyBars: React.FC<Props> = ({ data }) => {
  const max = Math.max(1, ...data.map((d) => Math.max(d.income, d.expense)));
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "100px 1fr",
        rowGap: 10,
        columnGap: 12,
      }}
    >
      {data.map((d) => (
        <React.Fragment key={d.month}>
          <div style={{ color: "#666" }}>{d.month}</div>
          <div>
            <div
              style={{
                height: 10,
                background: "#e5e7eb",
                borderRadius: 6,
                overflow: "hidden",
                marginBottom: 6,
              }}
            >
              <div
                style={{
                  width: `${(d.income / max) * 100}%`,
                  background: "#16a34a",
                  height: "100%",
                }}
              />
            </div>
            <div
              style={{
                height: 10,
                background: "#e5e7eb",
                borderRadius: 6,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${(d.expense / max) * 100}%`,
                  background: "#dc2626",
                  height: "100%",
                }}
              />
            </div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

export default MonthlyBars;
