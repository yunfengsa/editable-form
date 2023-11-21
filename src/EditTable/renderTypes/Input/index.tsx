import { Input, InputProps } from 'antd';
import React from 'react';

export default React.memo(
  (
    params: InputProps & {
      onChange?: (value: string) => void;
    },
  ) => {
    return (
      <Input
        {...params}
        bordered={false}
        style={{
          textAlign: 'center',
          minHeight: '32px',
          ...params.style,
        }}
        onChange={(e) => params.onChange?.(e.target.value)}
      />
    );
  },
);
