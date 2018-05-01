import KeyItem from './KeyItem.js';

import Observer from './Observer/Observer.js';
import Subject from './Observer/Subject.js';
import {translate} from './Translator.js';

const AVALABLE_LANGUAGES = [
  {id: 'pt-BR', text: 'Português - Brasil'},
  {id: 'pt-PT', text: 'Português - Portugal'},
  {id: 'en-US', text: 'Inglês - Estados Unidos'},
  {id: 'en-GB', text: 'Inglês - Reino Unido'},
  {id: 'es-UY', text: 'Espanhol'},
];

export default class KeyGroup {
  constructor(key, items = null) {
    this.key = key;

    let insertedLanguages = [];
    this.items = items || AVALABLE_LANGUAGES.map((v) => {
      let lang = v.id.substr(0, 2);
      let ret = new KeyItem(this.key, v, !insertedLanguages.includes(lang));
      insertedLanguages.push(lang);
      return ret;
    });

    this.observer = new Observer(this);
    this.observer.update = this._changesOnItems;

    this.DOMElement = this.render();
    this.subject = new Subject();
  }

  _changesOnItems(changedItem) {
    let lang = changedItem.language.id.substr(0, 2);

    this.setDefaultLanguage(changedItem);
    this.replicateValueForSameLanguage(changedItem, lang);
    this.replicateValueForOtherLanguage(changedItem, lang)
      .then(() => {
        this.subject.notify(this);
      });
  }

  setDefaultLanguage(changedItem) {
    this.items.forEach((item) => {
      if (changedItem === item) {
        item.setDefaultMarker(true);
      } else {
        item.setDefaultMarker(false);
      }
    });
  }

  replicateValueForSameLanguage(changedItem, language) {
    this.items.forEach((item) => {
      if (changedItem === item) return;

      if (item.isTranslatable() && item.language.id.startsWith(language)) {
        item.value = changedItem.value;
      }
    });
  }

  async replicateValueForOtherLanguage(changedItem, language) {
    let otherLanguages = this.getOtherLanguages(language);

    let disabledItems = this.items.filter((v) => {
      return v.isTranslatable() &&
        otherLanguages.includes(v.language.id.substr(0, 2));
    })
    .map((v) => v.disableInput());

    let translatedTexts =
    await this.translateTexts(changedItem.value, language, otherLanguages);

    disabledItems.map((v) => {
      v.value = translatedTexts.find((translation) => {
        return v.language.id.startsWith(translation.language);
      });
      v.value = v.value ? v.value.text : '';
      return v;
    })
    .forEach((v) => v.enableInput());
  }

  async translateTexts(text, myLanguage, otherLanguages) {
    return await Promise.all(otherLanguages.map(async (otherLanguage) => {
      let returnObject = {
        language: otherLanguage,
        text: await translate(text, myLanguage, otherLanguage),
      };

      if (!returnObject.text) {
        returnObject.text = await translate(text, myLanguage, otherLanguage);
      }
      return returnObject;
    }));
  }

  getOtherLanguages(myLanguage) {
    return AVALABLE_LANGUAGES.reduce((acc, otherLanguage) => {
      let lang = otherLanguage.id.substr(0, 2);
      if (lang != myLanguage && !acc.includes(lang)) {
        acc.push(lang);
      }
      return acc;
    }, []);
  }


  render() {
    if (this.DOMElement) return this.DOMElement;

    let headerKey = document.createElement('h5');
    headerKey.textContent = this.key;

    let group = document.createElement('div');
    group.classList.add('list-group');
    group.classList.add('list-group-flush');

    let groupItem = document.createElement('div');
    groupItem.classList.add('list-group-item');
    groupItem.append(headerKey);

    this.items.forEach((v) => {
      v.subject.addObserver(this.observer);
      groupItem.appendChild(v.render());
    });

    group.append(groupItem);
    this.DOMElement = group;
    return group;
  }

  static serialize(item) {
    return JSON.stringify({
      key: item.key,
      items: JSON.stringify(item.items.map((v) => KeyItem.serialize(v))),
    });
  }

  static deserialize(string) {
    let obj = JSON.parse(string);
    let items = JSON.parse(obj.items).map((v) => KeyItem.deserialize(v));

    return new KeyGroup(obj.key, items);
  }
}
