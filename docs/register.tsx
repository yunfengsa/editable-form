import Editable, { RefInstance, RenderTypesFactory} from '@onehacker/editable-form';
import { Button, Divider, Select, SelectProps, Space } from 'antd';
import React, { useRef, useState } from 'react';

type Value = {
  id: string | number;
  name: string;
  class: number;
}
const value: Value[] = [
  {
    id: 1,
    name: '张三',
    class: 1,
  },
  {
    id: 2,
    name: '李四',
    class: 2,
  },
];

const ClassSelect = (props: SelectProps) => <Select bordered={false} style={{
  width: '100%',
}} options={[{
  label: '一班',
  value: 1,
}, {
  label: '二班',
  value: 2,
}, {
  label: '三班',
  value: 3,
}]} {...props} />


RenderTypesFactory.registerRenderType('ClassSelect', ClassSelect)

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
            title: '班级',
            dataIndex: 'class',
            type: 'ClassSelect',
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
