import React from "react";
import styled from "styled-components";
import { colors, media } from "../../styles/primitives";

const DashboardHeader: React.FC = () => {
  return (
    <Wrap>
      <Title>대시보드</Title>
      <Subtitle>실시간 재정 현황을 확인하세요</Subtitle>
    </Wrap>
  );
};

export default DashboardHeader;

const Wrap = styled.div`
  margin-bottom: 0;
`;

const Title = styled.h1`
  color: ${colors.text};
  font-size: 24px;
  margin-bottom: 6px;

  ${media.tablet} {
    font-size: 28px;
  }

  ${media.desktop} {
    font-size: 32px;
    margin-bottom: 8px;
  }
`;

const Subtitle = styled.p`
  color: ${colors.textMuted};
  font-size: 14px;

  ${media.desktop} {
    font-size: 16px;
  }
`;
