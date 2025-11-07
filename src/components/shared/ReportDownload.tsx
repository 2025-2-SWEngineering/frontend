import React from "react";
import styled from "styled-components";
import { Card, SectionTitle, Button, Input, colors, media } from "../../styles/primitives";

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
      <ReportControls>
        <Label>기간</Label>
        <DateInputs>
          <Input
            type="date"
            value={range.from}
            onChange={(e) => onChange({ ...range, from: e.target.value })}
          />
          <Separator>~</Separator>
          <Input
            type="date"
            value={range.to}
            onChange={(e) => onChange({ ...range, to: e.target.value })}
          />
        </DateInputs>
        <ButtonGroup>
          <Button $variant="dark" onClick={() => onDownload("pdf")}>
            PDF
          </Button>
          <Button onClick={() => onDownload("xlsx")} style={{ background: colors.info }}>
            Excel
          </Button>
        </ButtonGroup>
      </ReportControls>
    </Card>
  );
};

const ReportControls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;

  ${media.mobile} {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
`;

const Label = styled.span`
  color: ${colors.textMuted};
  white-space: nowrap;

  ${media.mobile} {
    font-weight: 600;
  }
`;

const DateInputs = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;

  ${media.mobile} {
    width: 100%;
    flex-direction: column;
    gap: 12px;
  }

  input {
    flex: 1;
    min-width: 0;

    ${media.mobile} {
      width: 100%;
    }
  }
`;

const Separator = styled.span`
  color: ${colors.textMuted};
  white-space: nowrap;

  ${media.mobile} {
    display: none;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  white-space: nowrap;

  ${media.mobile} {
    width: 100%;

    button {
      flex: 1;
    }
  }
`;

export default ReportDownload;
