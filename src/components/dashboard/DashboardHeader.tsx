import React from "react";
import styled from "styled-components";

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
  color: #333;
  font-size: 32px;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 16px;
`;
