import React from 'react';
import { observer } from 'mobx-react';
import { FC, useContext, useEffect, useState } from 'react';
import { Controller, UseControllerProps } from 'react-hook-form';
import type { Column } from '../../type';

import { globalContext } from '../../models';

interface Params {
  name: (string | number)[];
  hidden?: boolean;
  className?: string;
  index?: number;
  id: string | number;
  RenderComponent?: FC<any>;
  /** 纯展示组件 */
  pure?: boolean;
  column?: Column;
  record?: any;
  rules?: UseControllerProps['rules'];
  disabled?: boolean;
  hoverBorderColor?: string;
  changeColor?: string;
  changeVisible?: boolean;
}

export default observer((props: Params) => {
  const {
    name,
    hidden,
    className,
    RenderComponent = () => <></>,
    index,
    pure,
    id,
    hoverBorderColor,
    changeColor,
    changeVisible = true,
    ...rest
  } = props;
  const Store = useContext(globalContext);
  const innerDisabled = Store?.useFormInstance?.watch(
    [id, 'preserveDisabled'].join('.'),
  );

  const [formItemChanged, setFormItemChanged] = useState(
    Store?.changedItemMap[name.join('_')],
  );
  const [isFocus, setIsFocus] = useState(false);
  const [hover, setHover] = useState(false);
  useEffect(() => {
    setFormItemChanged(Store?.changedItemMap[name.join('_')]);
  }, [Store?.changedItemMap[name.join('_')]]);
  // const errors = Store?.useFormInstance?.formState.errors;
  // console.log('??', formItemChanged);
  return (
    <Controller
      control={Store?.useFormInstance?.control}
      name={name.join('.')}
      rules={props.rules}
      render={({ field, fieldState }) => {
        const isError = !!(fieldState.error && fieldState.error.message);
        const { onChange } = field;
        if (hidden) {
          return <></>;
        }
        if (innerDisabled && !props.column?.selfDisable) {
          return (
            <div
              style={{
                display: 'inline-block',
                minHeight: '32px',
                lineHeight: '32px',
              }}
            >
              -
            </div>
          );
        }
        return (
          <>
            <div
              style={{
                pointerEvents: 'none',
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                top: 0,
                border: isError
                  ? '1px solid red'
                  : isFocus || hover
                  ? `1px solid ${hoverBorderColor}`
                  : '1px solid transparent',
                background: formItemChanged ? changeColor : '',
              }}
            />
            <div
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => {
                setHover(false);
              }}
              onFocus={() => {
                setIsFocus(true);
              }}
              onBlur={() => {
                setIsFocus(false);
              }}
              className={className}
              style={{
                boxSizing: 'border-box',
                // border: isFocus
                //   ? '1px solid rgba(67, 186, 127, 0.8)'
                //   : '1px solid transparent',
                // background: formItemChanged ? 'rgba(242, 153, 74, 0.1)' : '',
                pointerEvents: pure ? 'none' : undefined,
              }}
            >
              <RenderComponent
                {...field}
                {...rest}
                {...props.column?.props}
                index={index}
                onChange={(v: unknown) => {
                  onChange(v);
                  if (changeVisible) {
                    Store?.setChangedItem(name.join('_'), v);
                  }
                }}
              />
              {fieldState.error && fieldState.error.message && (
                <div className="ant-form-item-explain-error">
                  {fieldState.error.message}
                </div>
              )}
            </div>
          </>
        );
      }}
    ></Controller>
  );
});
