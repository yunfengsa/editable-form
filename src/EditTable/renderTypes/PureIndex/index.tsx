import React from "react";

/** 递增需要 */
export default (props: { index?: number; onChange?: (v: number) => void }) => {
  return (
    <span
      style={{
        lineHeight: '32px',
      }}
    >
      {(props.index ?? 0) + 1}
    </span>
  );
};
