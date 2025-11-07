import React from "react";
import styled from "styled-components";
import { Card, SectionTitle, Input, colors, media } from "../../styles/primitives";
import { Skeleton } from "../ui/Loading";
import CategoryChart from "../CategoryChart";

type Range = { from: string; to: string };

type Props = {
  loading: boolean;
  categoryLoading: boolean;
  range: Range;
  onChangeRange: (next: Range) => void;
  data: Array<{ category: string; income: number; expense: number; total: number }>;
};

const CategorySection: React.FC<Props> = ({
  loading,
  categoryLoading,
  range,
  onChangeRange,
  data,
}) => {
  return (
    <Card style={{ marginBottom: 20 }}>
      <SectionHeader>
        <SectionTitle style={{ margin: 0 }}>항목별 집계</SectionTitle>
        <DateRangeInputs>
          <Input
            type="date"
            value={range.from}
            onChange={(e) => onChangeRange({ ...range, from: e.target.value })}
          />
          <Separator>~</Separator>
          <Input
            type="date"
            value={range.to}
            onChange={(e) => onChangeRange({ ...range, to: e.target.value })}
          />
        </DateRangeInputs>
      </SectionHeader>
      {loading || categoryLoading ? (
        <SkeletonGrid>
          <Skeleton height={300} />
          <Skeleton height={300} />
        </SkeletonGrid>
      ) : data.length === 0 ? (
        <p style={{ color: colors.muted }}>데이터가 없습니다.</p>
      ) : (
        <CategoryChart data={data} />
      )}
    </Card>
  );
};

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 12px;
  flex-wrap: wrap;

  ${media.mobile} {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
`;

const DateRangeInputs = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;

  ${media.mobile} {
    width: 100%;
    flex-direction: column;
    gap: 12px;
  }

  input {
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

const SkeletonGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;

  ${media.desktop} {
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }
`;

export default CategorySection;
