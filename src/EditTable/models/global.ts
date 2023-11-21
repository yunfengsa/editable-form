import { makeAutoObservable } from 'mobx';

/** 全局数据，用于检查是否存在未提交内容表单 */
export default class Store {
  constructor() {
    makeAutoObservable(this);
  }

  unlockRef: () => void = () => {};

  get changed() {
    return Object.values(this.changeMap).some((v) => v === true);
  }

  changeMap: { [key: string | number]: boolean } = {};

  // 校验是否存在表单变化
  checkIfChanged = () => {
    return new Promise((resolve, reject) => {
      if (this.changed) {
        resolve(true);
      } else {
        reject();
      }
    });
  };

  setChangeMap = (key: string | number, changed: boolean) => {
    this.changeMap[key] = changed;
  };
}
