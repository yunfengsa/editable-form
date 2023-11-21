import { CloseOutlined, InsertRowAboveOutlined,  InsertRowBelowOutlined, CheckOutlined, DeleteOutlined, MoreOutlined, PlusOutlined } from '@ant-design/icons';
import React from 'react';
import { ConfigProvider, Popover, Table } from 'antd';
// import DisableContext from 'antd/es/config-provider/DisabledContext';
import cs from 'classnames';
import { Observer, observer, useLocalObservable } from 'mobx-react';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useForm } from 'react-hook-form';

import LocalStore, { globalContext } from './models';

import FormItem from './components/HookForm/FormItem';
import RenderTypesFactory from './renderTypes';
import type { TCompRef, CompProps } from './type';

import ButtonLoading from './components/ButtonLoading';
import IButton from './components/IButton';

import './index.less';

/** 表格编辑器
 * 1. 支持竖向内容添加
 * 2. 可编辑类型参考renderTypes, Pure**为展示形
 * 3. 数据中必须包含id，用于当前行的唯一标识
 */
export default observer(
  forwardRef(
    <T,>(
      props: CompProps<T>,
      ref: TCompRef<T[]>,
    ) => {
      const {
        columns,
        value,
        onIfChanged,
        addButtonText = '添加一行',
        addButtonStyle,
        freedomAdd = true,
        forceAllRowDelete = false,
        disableEdit,
        disableText,
        deleteText,
        activeText,
        tableProps,
        isEdit = true,
        formDisabled = false,
        emptyPlaceHolder,
        hoverBorderColor = 'rgba(67, 186, 127, 0.8)',
        changeColor = 'rgba(242, 153, 74, 0.1)',
      } = props;
      const tableRef = useRef<any>();
      const Store = useLocalObservable(() => new LocalStore());
      // 首次进入，如果数据为空，则默认添加一项
      const hasAppend = useRef(false);
      // 这里要注意防止整体组件的重绘！！！
      const { dataSource } = Store;
      const useFormInstance = useForm();

      useImperativeHandle(ref, () => ({
        getFieldsValue: Store.getFieldsValue,
        validateFields: Store.validateFields,
        getStore: () => Store,
        reset: () => {
          Store.initValue(value);
          Store.setColumns(columns);
        },
      }), [value, columns, Store]);

      useEffect(() => {
        Store.setColumns(columns);
      }, [columns]);

      /** 数据发生变化，进行表格数据更新 */
      useEffect(() => {
        tableRef.current.scrollTo(0, 0);
        Store.initValue(value);
        return () => {
          hasAppend.current = false;
          Store.initValue([]);
        };
      }, [value, tableRef]);

      // 默认追加第一项
      useEffect(() => {
        if (props.loading === false && value.length === 0 && emptyPlaceHolder) {
          if (hasAppend.current === false) {
            hasAppend.current = true;
            Store.generateInitialValue({
              id: `_${Date.now()}`,
            }).then((v) => {
              Store.initValue([v]);
            });
          }
        }
      }, [value, props.loading, emptyPlaceHolder]);

      /** 表格数据是否发生变化 */
      useEffect(() => {
        if (onIfChanged) {
          Store.setOnIfChanged(onIfChanged);
        } else {
          Store.setOnIfChanged(undefined);
        }
        return () => {
          Store.setOnIfChanged(undefined);
        };
      }, [onIfChanged]);

      /** 卸载 */
      useEffect(() => {
        return () => {
          Store.onDestroy();
        };
      }, []);

      /** 生成table列表, 当前版本几乎变化发生变动 */
      const formateColumns = useMemo(
        () =>
          columns.map((i, columnIndex) => ({
            ...i,
            title: i.required ? (
              <span>
                <span className={'super-editable-requiredTitle'}>* </span>
                <span>{i.title}</span>
              </span>
            ) : (
              i.title
            ),
            align: i.align || 'center',
            dataIndex: 'id',
            className: i.className,
            render: (id: string, record: object, index: number) => {
              const renderType = i.type || 'Input';
              const Comp = typeof renderType === 'string' ? RenderTypesFactory.getRenderType(renderType) : renderType;
              return (
                <>
                  {columnIndex === 0 && (
                    <>
                      <FormItem id={id} hidden name={[id, 'id']} />
                      <FormItem
                        id={id}
                        hidden
                        name={[id, 'preserveDisabled']}
                      />
                    </>
                  )}
                  <FormItem
                    key={`${id}_${i.dataIndex}`}
                    {...i.formItemProps}
                    column={i}
                    pure={ typeof i.type === 'string' && i.type?.startsWith('Pure')}
                    name={[id, i.dataIndex]}
                    className={cs('super-editable-formItem', i.formItemProps?.className)}
                    hoverBorderColor={hoverBorderColor}
                    changeColor={changeColor}
                    index={index}
                    id={id}
                    record={record}
                    disabled={formDisabled}
                    RenderComponent={Comp}
                  ></FormItem>
                  {/* <RenderComp key={`${id}_${i.dataIndex}`} /> */}
                </>
              );
            },
          })),
        [columns, formDisabled],
      );

      // 行操作
      const RowOptionCmp = useMemo(() => {
        /** 操作区域 */
        const Cmp = observer((props: { index: number }) => {
          const keyV = props.index;
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const [showPop, setShowPop] = useState(false);
          const { dataSource: _dataSource } = Store;

          const currentData = _dataSource[+keyV];
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const currentDisabled = useFormInstance.watch(
            [currentData?.id, 'preserveDisabled'].join('.'),
          );
          const Options = [];
          const DeleteOption = (
            <>
              {_dataSource.length !== 0 && (
                <IButton
                  size="large"
                  className={'super-editable-but'}
                  icon={<DeleteOutlined />}
                  onClick={() => {
                    setShowPop(false);
                    Store.remove(+keyV);
                  }}
                >
                  <span
                    style={{
                      paddingRight: '2em',
                    }}
                  >
                    {deleteText || '删除行'}
                  </span>
                </IButton>
              )}
            </>
          );
          // 启动/禁用选项
          if (!!disableEdit) {
            Options.push(
              <>
                {currentDisabled ? (
                  <IButton
                    size="large"
                    className={'super-editable-but'}
                    onClick={async () => {
                      await Store.edit(
                        [currentData.id, 'preserveDisabled'],
                        false,
                      );
                      setShowPop(false);
                    }}
                    icon={<CheckOutlined />}
                  >
                    <span
                      style={{
                        width: '5em',
                        textAlign: 'left',
                      }}
                    >
                      {activeText || '启用'}
                    </span>
                  </IButton>
                ) : (
                  _dataSource.length - 1 !== +keyV && (
                    <IButton
                      size="large"
                      className={'super-editable-but'}
                      onClick={async () => {
                        await Store.edit(
                          [currentData.id, 'preserveDisabled'],
                          true,
                        );
                        setShowPop(false);
                      }}
                      icon={<CloseOutlined />}
                    >
                      <span
                        style={{
                          width: '5em',
                          textAlign: 'left',
                        }}
                      >
                        {disableText || '禁用'}
                      </span>
                    </IButton>
                  )
                )}
              </>,
            );
          }
          // 自由添加
          if (freedomAdd) {
            Options.push(
              <>
                <IButton
                  size="large"
                  className={'super-editable-but'}
                  onClick={async () => {
                    await Store.add('pre', +keyV);
                    setShowPop(false);
                  }}
                  icon={<InsertRowAboveOutlined />}
                >
                  上方插入行
                </IButton>
                <IButton
                  size="large"
                  className={'super-editable-but'}
                  icon={<InsertRowBelowOutlined />}
                  onClick={async () => {
                    await Store.add('after', +keyV);
                    setShowPop(false);
                  }}
                >
                  下方插入行
                </IButton>
              </>,
            );
            Options.push(DeleteOption);
          } else {
            if (forceAllRowDelete || +keyV === _dataSource.length - 1) {
              Options.push(DeleteOption);
            }
          }
          if (_dataSource.length === 0 || Options.length === 0 || !isEdit) {
            return (
              <td
                className={`super-editable-bodyOptionItem ant-table-cell ant-table-cell-fix-left ant-table-cell-fix-left-last`}
                style={{
                  position: 'sticky',
                  left: '0px',
                  background: '#FFF',
                  borderLeft: '0.5px solid rgba(0, 0, 0, 0.05)',
                }}
              />
            );
          }
          return (
            <Popover
              placement="leftTop"
              open={showPop}
              overlayInnerStyle={{
                borderRadius: 10,
              }}
              onOpenChange={setShowPop}
              content={
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    borderRadius: 10,
                  }}
                >
                  {Options}
                </div>
              }
            >
              <td
                className={`super-editable-bodyOptionItem ant-table-cell ant-table-cell-fix-left ant-table-cell-fix-left-last`}
                style={{
                  position: 'sticky',
                  left: '0px',
                  background: ' #FFF',
                  borderLeft: '0.5px solid rgba(0, 0, 0, 0.05)',
                }}
              >
                <MoreOutlined
                  style={{
                    color: 'rgba(0,0,0,0.7)',
                    visibility: Store.optionShowMap[keyV]
                      ? 'visible'
                      : 'hidden',
                  }}
                />
              </td>
            </Popover>
          );
        });
        return Cmp;
      }, [freedomAdd, forceAllRowDelete]);
      /** table 自定义 */
      const components = useMemo(
        () => ({
          header: {
            row: (props: React.HTMLAttributes<HTMLTableRowElement>) => {
              return (
                <tr {...props}>
                  <th
                    className="ant-table-cell ant-table-cell-fix-left ant-table-cell-fix-left-last"
                    style={{
                      padding: '0',
                      background: 'rgba(242, 243, 245)',
                      position: 'sticky',
                      left: '0px',
                      borderLeft: '0.5px solid rgba(0, 0, 0, 0.05)',
                    }}
                  ></th>
                  {props.children}
                </tr>
              );
            },
          },
          body: {
            row: (props: React.HTMLAttributes<HTMLTableRowElement>) => {
              return (
                <Observer>
                  {() => {
                    const keyV = (props as any)['data-row-key'];
                    const { dataSource: _dataSource } = Store;
                    const currentData = _dataSource[+keyV];
                    // eslint-disable-next-line react-hooks/rules-of-hooks
                    const currentDisabled = useFormInstance.watch(
                      [currentData?.id, 'preserveDisabled'].join('.'),
                    );
                    return (
                      <tr
                        {...props}
                        className={`super-editable-bodyCell ${props.className}`}
                        style={{
                          background: currentDisabled
                            ? 'rgba(242, 243, 245, 0.7)'
                            : undefined,
                        }}
                      >
                        <RowOptionCmp index={+keyV} />
                        {props.children}
                      </tr>
                    );
                  }}
                </Observer>
              );
            },
            wrapper: (props: React.HTMLAttributes<HTMLTableSectionElement>) => {
              const Comp = () => {
                const ref = useRef<any>();
                // 默认追加布局，第一列展示宽度为20
                useEffect(() => {
                  const parentNode = ref.current.parentNode;
                  const colgroupNodes =
                    parentNode.getElementsByTagName('colgroup')[0];
                  if (
                    !colgroupNodes.firstChild ||
                    (colgroupNodes.firstChild &&
                      colgroupNodes.firstChild.id !== 'place-holder-newColNode')
                  ) {
                    const newColNode = document.createElement('col');
                    newColNode.id = 'place-holder-newColNode';
                    newColNode.setAttribute('style', 'width: 16px');
                    colgroupNodes.insertBefore(
                      newColNode,
                      colgroupNodes.firstChild,
                    );
                  }
                }, []);

                return <tbody {...props} ref={ref} />;
              };
              return <Comp />;
            },
          },
        }),
        [],
      );

      return (
        <globalContext.Provider value={Store}>
          {/* <DisableContext.Provider value={formDisabled}> */}
          <form
            ref={() => {
              Store.setUseFormInstance(useFormInstance);
              // console.log(useFormInstance);
            }}
            // onSubmit={onSubmit}
          >
            <Observer>
              {() => (
                <div ref={tableRef} className={'super-editable-tabContent'}>
                  <ConfigProvider renderEmpty={() => null}>
                    <Table
                      pagination={false}
                      className={`super-editable-tableWrap ${dataSource.length <= 0 ? 'super-editable-no-content' : ''}`}
                      tableLayout={props.tableLayout}
                      disbaled={false}
                      rowKey={(r, index) => {
                        return `${index}`;
                      }}
                      onRow={(record, index) => {
                        return {
                          onMouseEnter: () => {
                            Store.onMouseEnter(index);
                          }, // 鼠标移入行
                          onMouseLeave: () => {
                            Store.onMouseLeave(index);
                          },
                        };
                      }}
                      bordered
                      columns={formateColumns}
                      dataSource={dataSource as object[]}
                      components={components}
                      loading={props.loading}
                      {...tableProps}
                    />
                  </ConfigProvider>
                </div>
              )}
            </Observer>
            {isEdit && (
              <ButtonLoading
                disabled={formDisabled}
                style={{
                  marginTop: 10,
                  marginBottom: 0,
                  ...addButtonStyle,
                }}
                onClick={async () => await Store.add('after', undefined)}
                icon={<PlusOutlined />}
              >
                {addButtonText}
              </ButtonLoading>
            )}
          </form>
          {/* </DisableContext.Provider> */}
        </globalContext.Provider>
      );
    },
  ),
);
