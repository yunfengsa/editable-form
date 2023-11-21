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
        onChange={(v) =>
          params.onChange?.(v.target.value.replace(/[^0-9]/gi, ''))
        }
        bordered={false}
        maxLength={11}
        style={{
          minHeight: '32px',
          textAlign: 'center',
          ...params.style,
        }}
      />
    );
  },
);
