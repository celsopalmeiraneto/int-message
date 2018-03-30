import KeyItem from "./KeyItem.js";

import Observer from "./Observer/Observer.js";
import Subject from "./Observer/Subject.js";
import {translate} from "./Translator.js";

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
    this.DOMElement = this.render();

    this.subject = new Subject();
  }

  _changesOnItems(changedItem){
    let lang = changedItem.language.id.substr(0, 2);

    this.setDefaultLanguage(changedItem);
    this.replicateValueForSameLanguage(changedItem, lang);
    this.replicateValueForOtherLanguage(changedItem, lang)
      .then(() => {
        this.subject.notify(this);
      });

  }

  setDefaultLanguage(changedItem){
    this.items.forEach(item => {
      if(changedItem === item){
        item.setDefaultMarker(true);
      }else{
        item.setDefaultMarker(false);
      }
    });
  }

  replicateValueForSameLanguage(changedItem, language){
    this.items.forEach(item => {
      if(changedItem === item) return;

      if(item.language.id.startsWith(language)){
        item.value = changedItem.value;
      }
    });
  }

  async replicateValueForOtherLanguage(changedItem, language){
    let otherLanguages = this.getOtherLanguages(language);
    let translatedTexts = await this.translateTexts(changedItem.value, language, otherLanguages);

    translatedTexts.forEach(translation => {
      this.items.forEach(item => {
        if(changedItem === item || !item.language.id.startsWith(translation.language)) return;
        item.value = translation.text;
      });
    });
  }

  async translateTexts(text, myLanguage, otherLanguages){
    return await Promise.all(otherLanguages.map(async (otherLanguage) => {
      return {
        language: otherLanguage,
        text: await translate(text, myLanguage, otherLanguage)
      };
    }));
  }

  getOtherLanguages(myLanguage){
    return AVALABLE_LANGUAGES.reduce((acc, otherLanguage) => {
      let lang = otherLanguage.id.substr(0, 2);
      if(lang != myLanguage && !acc.includes(lang)){
        acc.push(lang);
      }
      return acc;
    }, []);
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
    this.DOMElement = group;
    return group;
  }

}


export default KeyGroup;
