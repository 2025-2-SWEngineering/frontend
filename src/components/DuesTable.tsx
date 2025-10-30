import React from "react";

type Dues = {
  userId: number;
  userName: string;
  isPaid: boolean;
  paidAt?: string;
};

type Props = {
  dues: Array<Dues>;
  isAdmin: boolean;
  onToggle: (userId: number, next: boolean) => void;
};

const DuesTable: React.FC<Props> = ({ dues, isAdmin, onToggle }) => {
  if (dues.length === 0) {
    return <p style={{ color: "#999" }}>회원 정보가 없습니다.</p>;
  }
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th
            style={{
              textAlign: "left",
              padding: 8,
              color: "#666",
              borderBottom: "1px solid #eee",
            }}
          >
            이름
          </th>
          <th
            style={{
              textAlign: "center",
              padding: 8,
              color: "#666",
              borderBottom: "1px solid #eee",
            }}
          >
            상태
          </th>
          <th
            style={{
              textAlign: "right",
              padding: 8,
              color: "#666",
              borderBottom: "1px solid #eee",
            }}
          >
            납부일
          </th>
        </tr>
      </thead>
      <tbody>
        {dues.map((d) => (
          <tr key={d.userId}>
            <td style={{ padding: 8, borderBottom: "1px solid #f6f6f6" }}>
              {d.userName}
            </td>
            <td
              style={{
                padding: 8,
                borderBottom: "1px solid #f6f6f6",
                textAlign: "center",
              }}
            >
              {isAdmin ? (
                <label style={{ cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={d.isPaid}
                    onChange={(e) => onToggle(d.userId, e.target.checked)}
                    style={{ marginRight: 6 }}
                  />
                  {d.isPaid ? "완납" : "미납"}
                </label>
              ) : (
                <span style={{ color: d.isPaid ? "#16a34a" : "#dc2626" }}>
                  {d.isPaid ? "완납" : "미납"}
                </span>
              )}
            </td>
            <td
              style={{
                padding: 8,
                borderBottom: "1px solid #f6f6f6",
                textAlign: "right",
                color: "#999",
              }}
            >
              {d.paidAt ? d.paidAt.slice(0, 10) : "-"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DuesTable;
