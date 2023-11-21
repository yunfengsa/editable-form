import { Select, SelectProps } from 'antd';
import React, { useRef, useState } from 'react';
/** 性别选择器 */
export default (props: SelectProps) => {
  const [placement, setPlacement] = useState<any>('bottomLeft');
  const anchorDom = useRef<HTMLDivElement>(null);
  return (
    <>
      <div ref={anchorDom} />
      <Select
        style={{
          width: '100%',
        }}
        {...props}
        onDropdownVisibleChange={(open) => {
          if (open) {
            if (
              (anchorDom.current?.getBoundingClientRect?.()?.y ?? 0) >
              window.innerHeight - 100
            ) {
              setPlacement('topLeft');
            } else {
              setPlacement('bottomLeft');
            }
          }
        }}
        bordered={false}
        placement={placement}
        options={[
          {
            label: '男',
            value: '男',
          },
          {
            label: '女',
            value: '女',
          },
        ]}
      />
    </>
  );
};
