import { SpinProps } from 'antd';
import React from 'react';
import { UseControllerProps } from 'react-hook-form';
import RenderTypesFactory from './renderTypes';

export interface Column {
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

export type RefInstance<T> = {
  getFieldsValue: (props?: { filterInnerId?: boolean }) => T;
  validateFields: (props?: { filterInnerId?: boolean }) => Promise<T>;
  getStore: () => any;
  reset: () => void;
};

export type TCompRef<T> = React.Ref<RefInstance<T>>;

export interface CompProps<T> {
  /** 展示的列定义 */
  columns: Column[];
  /** 输入值，每一项必须要包含id，用于数据定位！！ */
  value: T[];
  /** 数据发生编辑的回调 */
  onIfChanged?: (changed: boolean) => void;
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
  tableProps?: any;
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
