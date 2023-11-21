import React from 'react';
import { UseFormReturn } from 'react-hook-form';

import { NamePath } from 'antd/lib/form/interface';
import { cloneDeep, get, isEqual, omitBy } from 'lodash';
import { makeAutoObservable, observe, runInAction } from 'mobx';
import { v4 as uuidv4 } from 'uuid';

import GlobalStore from './global';

import { Column } from '../type';

/** 数据管理 */
export default class Store {
  constructor() {
    makeAutoObservable(this, {
      useFormInstance: false,
      setUseFormInstance: false,
      _onIfChangedRef: false,
      setOnIfChanged: false,
      originData: false,
    });
    observe(
      this,
      'valuesChanged',
      (changed) => {
        this._onIfChangedRef?.(!!changed.newValue);
        this.globalStore.setChangeMap(this.uid, !!changed.newValue);
      },
      true,
    );
  }
  globalStore = new GlobalStore();
  useFormInstance?: UseFormReturn;
  uid = uuidv4();
  dataSource: (any & {
    // 用于标识唯一数据，必须要有
    id: string | number;
    // 内部保留数据，用于标识当前行是否禁用
    preserveDisabled?: boolean;
  })[] = [];
  values: [] = [];
  columns: Column[] = [];
  _onIfChangedRef?: (changed: boolean) => void;

  originData: any = {};
  originDataSource: any[] = [];

  /** 控制选项是否显示 */
  optionShowMap: {
    [key: string]: boolean;
  } = {};

  /** 变化的内容区域 */
  changedItemMap: {
    [key: string]: boolean;
  } = {};

  get valuesChanged() {
    return (
      this.dataSource.length !== this.originDataSource.length ||
      !isEqual(
        this.dataSource.map((i) => i.id),
        this.originDataSource.map((i) => i.id),
      ) ||
      Object.values(this.changedItemMap).some((v) => v === true)
    );
  }

  setOnIfChanged(fn?: (changed: boolean) => void) {
    this._onIfChangedRef = fn;
  }

  setChangedItem = (key: string, value: any) => {
    const _path = key.split('_');
    const originData = get(this.originData, _path);
    if (isEqual(value, originData)) {
      this.changedItemMap = {
        ...this.changedItemMap,
        [key]: false,
      };
    } else {
      this.changedItemMap = {
        ...this.changedItemMap,
        [key]: true,
      };
      // this.changedItemMap[key] = true;
    }
  };

  /** 生成初始值 */
  generateInitialValue = async (initialValue?: any, index?: number) => {
    const targetV = {};
    await (async () => {
      for (const c of this.columns) {
        let v = undefined;
        if (c.initialValue) {
          const currentAllValue = this.getFieldsValue();
          v = await c.initialValue(currentAllValue, index);
        }
        (targetV as any)[c.dataIndex] = v;
      }
    })();
    return {
      ...targetV,
      ...(initialValue || {}),
    };
  };

  setColumns = (v: Column[]) => {
    this.columns = v;
  };

  setFieldValue = (namePath: NamePath, v: any) => {
    this.optionShowMap = {};
    this.useFormInstance?.setValue(
      Array.isArray(namePath) ? namePath.join('.') : `${namePath}`,
      v,
    );
    // this.form.current?.setFieldValue(namePath, v);
  };

  /** value发生变化进行数据重置 */
  initValue = (
    v: Array<
      any & {
        id: string;
      }
    >,
  ) => {
    this.useFormInstance?.reset({});
    const cloneV = cloneDeep(v);
    const objectValue = cloneV.reduce((pre: any, next: any) => {
      return {
        ...pre,
        [next.id]: {
          ...next,
          preserveDisabled: !!next.preserveDisabled,
        },
      };
    }, {});
    this.originData = cloneDeep(objectValue);
    this.originDataSource = cloneDeep(v);
    // 设置form数据
    this.useFormInstance?.reset(objectValue);
    // 设置table数据
    this.dataSource = v;
    this.optionShowMap = {};
    this.changedItemMap = {};
  };

  /** 设置表单实例的引用 */
  setUseFormInstance = (instance: any) => {
    this.useFormInstance = instance;
  };

  /**
   * 添加
   */
  add = async (position: 'pre' | 'after', index: number | undefined) => {
    const uId = `_${Date.now()}`;
    /** 添加在最后 */
    if (index === undefined && position === 'after') {
      const res = await this.generateInitialValue(
        {
          id: uId,
        },
        index,
      );
      this.setFieldValue(uId, res);
      runInAction(() => {
        this.dataSource = [
          ...this.dataSource,
          {
            id: uId,
          },
        ];
      });
      return;
    }
    if (index !== undefined) {
      const dataSourceArray = this.dataSource.slice();
      dataSourceArray.splice(position === 'pre' ? index : index + 1, 0, {
        id: uId,
      });
      const res = await this.generateInitialValue(
        {
          id: uId,
        },
        index,
      );
      this.setFieldValue(uId, res);
      runInAction(() => {
        this.dataSource = dataSourceArray;
      });
      return;
    }
  };

  /**
   * 删除
   */
  remove = (index: number) => {
    const copyDataSource = this.dataSource.slice();
    const currentId = copyDataSource[index].id;
    if (index !== undefined) {
      copyDataSource.splice(index, 1);
      this.setFieldValue(currentId, undefined);
      this.changedItemMap = omitBy(this.changedItemMap, (_, key) =>
        key.startsWith(`${currentId}_`),
      );
      this.dataSource = copyDataSource;
      return;
    }
  };

  // /** 修改 */
  edit = (namePath: string[], v: any) => {
    this.setChangedItem(namePath.join('_'), v);
    this.setFieldValue(namePath, v);
  };

  /** 获取所有值 */
  getFieldsValue = (props?: { filterInnerId?: boolean }) => {
    const { filterInnerId = true } = props || {};
    // const allFormValue = this.form.current?.getFieldsValue();
    const allFormValue = this.useFormInstance?.getValues() ?? {};
    return this.dataSource.map((i, index) => ({
      ...(allFormValue[i.id] || {}),
      no: index,
      // 过滤内置id
      id:
        filterInnerId &&
        i.id &&
        typeof i.id === 'string' &&
        i.id.startsWith('_')
          ? undefined
          : i.id,
    }));
  };

  /** 校验并获取所有值 */
  validateFields = async (props?: {
    filterInnerId?: boolean;
  }) => {
    const { filterInnerId = true } = props || {};
    return new Promise<any[]>((resolve, reject) => {
      this.useFormInstance?.handleSubmit(
        (allFormValue: any) => {
          resolve(
            this.dataSource.map((i, index) => ({
              ...(allFormValue[i.id] || {}),
              no: index,
              // 过滤内置id
              id:
                filterInnerId && i.id && typeof i.id === 'string' && i.id.startsWith('_')
                  ? undefined
                  : i.id,
            })),
          );
        },
        (err: object) => {
          console.log(err);
          reject(err);
        },
      )();
    });
  };

  onMouseEnter = (index?: number) => {
    if (index !== undefined) {
      this.optionShowMap = {
        ...this.optionShowMap,
        [index]: true,
      };
    }
  };

  onMouseLeave = (index?: number) => {
    if (index !== undefined) {
      this.optionShowMap = {
        ...this.optionShowMap,
        [index]: false,
      };
    }
  };

  /** unload */
  onDestroy = () => {
    this.globalStore.setChangeMap(this.uid, false);
  };
}

export const globalContext = React.createContext<Store | null>(null);

export const disableContext = React.createContext<boolean>(false);
