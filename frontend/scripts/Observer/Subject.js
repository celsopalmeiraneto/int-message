import ObserverList from './ObserverList.js';

class Subject {
  constructor() {
    this.observers = new ObserverList();
  }

  addObserver(observer) {
    this.observers.add(observer);
  }

  removeObserver(observer) {
    this.observers.removeAt(this.observers.indexOf(observer));
  }

  notify(news) {
    for (let observer of this.observers) {
      observer.update.call(observer.context, news);
    }
  }
}

export default Subject;
