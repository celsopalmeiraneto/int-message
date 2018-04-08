class ObserverList {
  constructor() {
    this.observerList = [];
  }

  add(obj) {
    return this.observerList.push(obj);
  }

  count() {
    return this.observerList.length;
  }

  get(index) {
    if (index > -1 && index < this.observerList.length) {
      return this.observerList[index];
    }
  }

  indexOf(obj, startIndex = 0) {
    let i = startIndex;

    while (i < this.observerList.length) {
      if (this.observerList[i] === obj) return i;
      i++;
    }

    return -1;
  }

  removeAt(index) {
    this.observerList.splice(index, 1);
  }

  * [Symbol.iterator]() {
    for (let observer of this.observerList) {
      yield observer;
    }
  }
}

export default ObserverList;
