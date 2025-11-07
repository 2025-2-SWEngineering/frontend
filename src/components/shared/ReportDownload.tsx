import React from "react";
import { Card, SectionTitle, Button, Input, Flex, colors } from "../../styles/primitives";

type Range = { from: string; to: string };

type Props = {
  range: Range;
  onChange: (next: Range) => void;
  onDownload: (kind: "pdf" | "xlsx") => void;
};

const ReportDownload: React.FC<Props> = ({ range, onChange, onDownload }) => {
  return (
    <Card style={{ marginBottom: 20 }}>
      <SectionTitle>보고서 다운로드</SectionTitle>
      <Flex $gap={12} $center>
        <span style={{ color: colors.textMuted }}>기간</span>
        <Input
          type="date"
          value={range.from}
          onChange={(e) => onChange({ ...range, from: e.target.value })}
          style={{ width: 160 }}
        />
        <span>~</span>
        <Input
          type="date"
          value={range.to}
          onChange={(e) => onChange({ ...range, to: e.target.value })}
          style={{ width: 160 }}
        />
        <Button $variant="dark" onClick={() => onDownload("pdf")}>
          PDF
        </Button>
        <Button onClick={() => onDownload("xlsx")} style={{ background: colors.info }}>
          Excel
        </Button>
      </Flex>
    </Card>
  );
};

export default ReportDownload;
