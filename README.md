# @onehacker/editable-form

[![NPM version](https://img.shields.io/npm/v/@onehacker/editable-form.svg?style=flat)](https://npmjs.org/package/@onehacker/editable-form)
[![NPM downloads](http://img.shields.io/npm/dm/@onehacker/editable-form.svg?style=flat)](https://npmjs.org/package/@onehacker/editable-form)

基于 react-hook-form 和 antd@5 的可编辑表格，可自由添加行，删除行，编辑行，校验行，自定义单元格组件等。

https://github.com/yunfengsa/editable-form/assets/10361986/7e816479-17c7-4596-8317-91ff19ace236

demo 地址：[https://onehacker.top/\_gdemo/editable-form](https://onehacker.top/_gdemo/editable-form)

## Usage

npm install @onehacker/editable-form --save

```tsx
import Editable, { RefInstance } from '@onehacker/editable-form';
import { Button, Divider, Space } from 'antd';
import React, { useRef, useState } from 'react';

type Value = {
  id: string | number;
  name: string;
};
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
  const currentRef = useRef<RefInstance<Value[]>>(null);
  return (
    <Editable
      freedomAdd={true}
      tableLayout="fixed"
      ref={currentRef}
      columns={[
        {
          title: '序号',
          dataIndex: 'id',
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
  );
};
```

## Options

#### 组件参数

```tsx
interface CompProps<T> {
  /** 展示的列定义 */
  columns: Column[];
  /** 输入值，每一项必须要包含id，用于数据定位！！ */
  value: T[];
  /** 数据发生编辑的回调 */
  onIfChanged?: (changed: boolean) => void;
  /** 加载态 */
  loading?: boolean | SpinProps;
  /** 添加按钮文案 */
  addButtonText?: string;
  /** 添加按钮行样式 */
  addButtonStyle?: React.CSSProperties;
  /** 是否支持表格内容自由添加删除，默认为true */
  freedomAdd?: boolean;
  /** 在不支持自由添加的时候，默认只有最后一行可删除，打开此项，则所有项可删 */
  forceAllRowDelete?: boolean;
  tableLayout?: 'auto' | 'fixed';
  /** 是否可以操作禁用 */
  disableEdit?: boolean;
  disableText?: string;
  deleteText?: string;
  activeText?: string;
  /** 表格项  */
  tableProps?: TableProps<any>;
  /** 编辑态 */
  isEdit?: boolean;
  /** 表单禁用 */
  formDisabled?: boolean;
  // 无数据的时候，是否默认追加一项
  emptyPlaceHolder?: boolean;
  // hover时候的边框颜色
  hoverBorderColor?: string;
  // 发生修改时候的颜色
  changeColor?: string;
  // 是否展示修改的内容
  changeVisible?: boolean;
}
```

#### 列定义

基于 antd table 的 colums 进行部分调整，其中 formItemsProps.rules 为[react-hook-form](https://react-hook-form.com/)的校验规则，其他属性参考 antd table 的 columns

```

Column {
  /** 列名称 */
  title: string;
  /** 对应字段 */
  dataIndex: number | string;
  /** 对齐方式 */
  align?: 'left' | 'center' | 'right';
  /** 列宽度 */
  width?: number | string;
  // 单元格的Form.Item 属性，例如校验等
  formItemProps?: {
    rules?: UseControllerProps['rules'];
    className?: any;
  };
  // 标题是否展示必填
  required?: boolean;
  /** 透传给FormItem组件 */
  props?: any;
  // 添加行的默认填入值
  initialValue?: (v: any, index?: number) => Promise<any>;
  key?: string;
  /**
   * 当前支持的单元格类型，参考RenderTypesFactory.renderTypes
   * 或者自定义组件
   * 需要拓展类型使用RenderTypesFactory.registerRenderType
   */
  type?: keyof typeof RenderTypesFactory.renderTypes | React.FC<any>;
  // 默认禁用后，当前行内容不展示，开启使用组件自身的disable状态进行显示
  selfDisable?: boolean;
  className?: string;
}

```

#### 默认内置 type 类型

Input 输入

InputNumber 数字输入

PureIndex 纯序号

> 约定将 Purexxx 类型组件作为展示型组件，不可编辑

GenderSelect 性别选择

**自定义组件类型**

```tsx
import Editable, {
  RefInstance,
  RenderTypesFactory,
} from '@onehacker/editable-form';

RenderTypesFactory.registerRenderType(
  'Custom',
  (props: { value: any; onChange: (v: any) => void }) => {
    return <div>自定义组件</div>;
  },
);
```

## Development

```bash
# install dependencies
$ npm install

# develop library by docs demo
$ npm start

# build library source code
$ npm run build

# build library source code in watch mode
$ npm run build:watch

# build docs
$ npm run docs:build

# check your project for potential problems
$ npm run doctor
```

## LICENSE

MIT
