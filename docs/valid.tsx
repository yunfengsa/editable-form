import Editable, { RefInstance } from '@onehacker/editable-form';
import { Button, Divider, Space } from 'antd';
import React, { useRef, useState } from 'react';

type Value = {
  id: string | number;
  name: string;
}
const value: Value[] = [
  {
    id: 1,
    name: '',
  },
  {
    id: 2,
    name: '李四李四李四李四李四李四李四李四李四',
  },
];
export default () => {
  const currentRef = useRef<RefInstance<Value>>(null);
  const [log, setLog] = useState({});
  return (
    <>
      <Editable
        freedomAdd={true}
        tableLayout="fixed"
        ref={currentRef}
        columns={[
          {
            title: '序号',
            type: 'PureIndex',
          },
          {
            title: '姓名',
            dataIndex: 'name',
            type: 'Input',
            formItemProps: {
              rules: {
                required: '请输入姓名',
                maxLength: {
                  value: 10,
                  message: '姓名最多10个字符',
                },
              },
            },
          },
        ]}
        value={value}
      />
      <Divider />
      <Space style={{
        marginTop: 20,
      }}>
        <Button type='primary' onClick={() => currentRef.current.validateFields().then(res => {
          console.log(res)
          setLog(res)
        })}>校验并输出</Button>
        <Button onClick={() => currentRef.current.reset()}>重置数据</Button>
      </Space>
      <div style={
        {
          whiteSpace: 'pre',
        }
      }>log: {JSON.stringify(log, undefined, ' ')}</div>
    </>
  );
};
