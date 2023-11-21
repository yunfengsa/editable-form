import Editable, { RefInstance } from '@onehacker/editable-form';
import { Button, Divider, Space } from 'antd';
import React, { useRef, useState } from 'react';

type Value = {
  id: string | number;
  name: string;
  age: number | string;
  address: string;
  gender: string;
}
const value: Value[] = [
  {
    id: 1,
    name: '张三',
    age: '181',
    address: '西湖区湖底公园1号',
    gender: '男',
  },
  {
    id: 2,
    name: '李四',
    age: 1,
    address: '西湖区湖底公园2号',
    gender: '男',
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
          },
          {
            title: '年龄',
            dataIndex: 'age',
            type: 'Input',
          },
          {
            title: '性别',
            dataIndex: 'gender',
            type: 'GenderSelect',
          },
          {
            title: '地址',
            dataIndex: 'address',
            type: 'Input',
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
        })}>console.log当前表单内容</Button>
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
