import React from "react";
import { Table, Th, Td, colors } from "../../styles/primitives";
import { formatYmd } from "../../utils/format";

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
    return <p style={{ color: colors.muted }}>회원 정보가 없습니다.</p>;
  }
  return (
    <Table>
      <thead>
        <tr>
          <Th style={{ textAlign: "left" }}>이름</Th>
          <Th style={{ textAlign: "center" }}>상태</Th>
          <Th style={{ textAlign: "right" }}>납부일</Th>
        </tr>
      </thead>
      <tbody>
        {dues.map((d) => (
          <tr key={d.userId}>
            <Td>{d.userName}</Td>
            <Td style={{ textAlign: "center" }}>
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
                <span style={{ color: d.isPaid ? colors.income : colors.expense }}>
                  {d.isPaid ? "완납" : "미납"}
                </span>
              )}
            </Td>
            <Td style={{ textAlign: "right", color: colors.muted }}>
              {d.paidAt ? formatYmd(d.paidAt) : "-"}
            </Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default DuesTable;
