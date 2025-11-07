import React from "react";

type SkeletonProps = {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: React.CSSProperties;
  className?: string;
};

export const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height = 16,
  borderRadius = 8,
  style,
  className,
}) => {
  return (
    <div
      className={className}
      style={{
        width,
        height,
        borderRadius,
        background: "#f3f4f6",
        border: "1px solid #e5e7eb",
        ...style,
      }}
    />
  );
};

export const SkeletonLines: React.FC<{
  count?: number;
  lineHeight?: number;
  gap?: number;
  widths?: Array<number | string>;
}> = ({ count = 3, lineHeight = 14, gap = 8, widths }) => {
  return (
    <div>
      {Array.from({ length: count }).map((_, idx) => (
        <Skeleton
          key={idx}
          height={lineHeight}
          width={widths?.[idx] ?? "100%"}
          style={{ marginBottom: idx === count - 1 ? 0 : gap }}
        />
      ))}
    </div>
  );
};


