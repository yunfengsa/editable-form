import { InputNumber, InputNumberProps } from 'antd';
import React from 'react';

import './index.less';

export default React.memo((params: InputNumberProps) => {
  return (
    <InputNumber
      {...params}
      min={0}
      bordered={false}
      className="super-editable-input-number-wrap"
    />
  );
});
