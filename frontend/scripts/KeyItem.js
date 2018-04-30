import Subject from './Observer/Subject.js';

const KEYB_ALLOWED_KEYS = ['Key', 'Digit',
'Space', 'Numpad',
'Backspace', 'Delete'];

export default class KeyItem {
  constructor(key, language, visible) {
    this.key = key;
    this.language = language;
    this.visible = visible;
    this._value = '';

    this.keyUpQueue = 0;

    this.DOMElement = this.render();
    this.subject = new Subject();
  }

  disableInput() {
    this.DOMElement.children.item(2).disabled = true;
    return this;
  }

  enableInput() {
    this.DOMElement.children.item(2).disabled = false;
    return this;
  }

  get value() {
    return this._value;
  }

  set value(val) {
    this._value = val;
    if (this.DOMElement != null) {
      this.DOMElement.children.item(2).value = val;
    }
  }

  setDefaultMarker(val) {
    if (this.DOMElement == null) return;
    if (val === true ) {
      this.DOMElement.children.item(1).classList.remove('d-none');
    } else {
      this.DOMElement.children.item(1).classList.add('d-none');
    }
  }

  render() {
    if (this.DOMElement) return this.DOMElement;
    const itemTemplate = `<label class="mr-2">Tradução</label>
    <span class="badge badge-primary d-none">Padrão</span>
    <input type="text" class="form-control form-control-sm translationText">`;

    let item = document.createElement('div');
    item.innerHTML = itemTemplate;
    item.classList.add('form-group');

    item.style.display = this.visible ? item.style.display : 'none';

    item.children.item(0).textContent = this.language.text;
    item.children.item(2).dataset.key = this.key;
    item.children.item(2).dataset.id = this.language.id;

    item.onkeyup = (e) => {
      if (!this.isKeyValid(e.code)) return false;
      this.keyUpQueue++;

      setTimeout(()=>{
        this.keyUpQueue--;
        if (this.keyUpQueue <= 0) {
          this.value = e.target.value;
          this.subject.notify(this);
        }
      }, 600);
    };

    this.DOMElement = item;
    return item;
  }

  isKeyValid(keyCode) {
    for (let allowedKey of KEYB_ALLOWED_KEYS) {
      if (keyCode.includes(allowedKey)) return true;
    }
    return false;
  }

  static serialize(item) {
    return JSON.stringify({
      key: item.key,
      language: item.language,
      value: item.value,
      visible: item.visible,
    });
  }

  static deserialize(string) {
    let obj = JSON.parse(string);
    let item = new KeyItem(obj.key, obj.language, obj.visible);
    item.value = obj.value;
    return item;
  }
}
