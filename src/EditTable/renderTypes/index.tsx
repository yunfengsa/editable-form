import React from 'react';
import GenderSelect from './GenderSelect';
import Input from './Input';
import InputNumber from './InputNumber';
import PhoneInput from './PhoneInput';
import PureIndex from './PureIndex/index';

class RenderTypesFactory {
  /** 渲染类型集合 */
  public renderTypes = {
    // 纯文本录入
    Input,
    // 性别
    GenderSelect,
    // 数字输入
    InputNumber,
    // 手机输入
    PhoneInput,
    // 纯序号
    PureIndex,
  };
  /** 获取渲染类型 */
  public getRenderType(type: string): React.FC<any> {
    return (this.renderTypes as any)[type] || Input;
  }

  /** 注册自定义类型 */
  registerRenderType(type: string, Comp: React.FC<any>) {
    (this.renderTypes as any)[type] = Comp;
  }
}

export default new RenderTypesFactory();
