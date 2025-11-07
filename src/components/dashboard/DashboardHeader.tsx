import React from "react";
import styled from "styled-components";
import { colors } from "../../styles/primitives";

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
  margin-bottom: 32px;
`;

const Title = styled.h1`
  color: ${colors.text};
  font-size: 32px;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  color: ${colors.textMuted};
  font-size: 16px;
`;
