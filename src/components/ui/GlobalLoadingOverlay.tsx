import React from "react";
import LoadingOverlay from "./LoadingOverlay";
import { getLoadingCount, subscribeLoading } from "../../state/globalLoading";

const GlobalLoadingOverlay: React.FC = () => {
  const [count, setCount] = React.useState(getLoadingCount());

  React.useEffect(() => {
    const unsubscribe = subscribeLoading(setCount);
    return unsubscribe;
  }, []);

  return <LoadingOverlay visible={count > 0} label="요청 처리 중..." />;
};

export default GlobalLoadingOverlay;
