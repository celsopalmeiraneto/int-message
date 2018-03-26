import KeyItem from "./KeyItem.js";

import Observer from "./Observer/Observer.js";
import Subject from "./Observer/Subject.js";

const AVALABLE_LANGUAGES = [
  { id: "pt-BR", text: "Português - Brasil" },
  { id: "pt-PT", text: "Português - Portugal" },
  { id: "en-US", text: "Inglês - Estados Unidos" },
  { id: "en-GB", text: "Inglês - Reino Unido" },
  { id: "es-UY", text: "Espanhol" }
];

class KeyGroup {
  constructor(key){
    this.key = key;
    this.items = AVALABLE_LANGUAGES.map(v => {
      return new KeyItem(this.key, v);
    });

    this.observer = new Observer(this);
    this.observer.update = this._changesOnItems;

    this.subject = new Subject();
  }

  _changesOnItems(e){
    let lang = e.language.id.substr(0, 2);
    this.items.forEach(v => {
      if(e === v || !v.language.id.startsWith(lang)) return;
      v.value = e.value;
    });

    this.subject.notify(this);
  }

  render(){
    let insertedLanguages = [];

    let headerKey = document.createElement("h5");
    headerKey.textContent = this.key;

    let group = document.createElement("div");
    group.classList.add("list-group");
    group.classList.add("list-group-flush");

    let groupItem = document.createElement("div");
    groupItem.classList.add("list-group-item");
    groupItem.append(headerKey);

    this.items.forEach(v => {
      v.subject.addObserver(this.observer);
      let lang = v.language.id.substr(0, 2);

      if(insertedLanguages.includes(lang)){
        v.visible = false;
      }else{
        insertedLanguages.push(lang);
      }

      groupItem.appendChild(v.render());
    });

    group.append(groupItem);
    return group;
  }

}


export default KeyGroup;
