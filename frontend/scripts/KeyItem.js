import Subject from './Observer/Subject.js';

const KEYB_ALLOWED_KEYS = ['Key', 'Digit',
'Space', 'Numpad',
'Backspace', 'Delete'];

export default class KeyItem {
  constructor(key, language, visible) {
    this.key = key;
    this.language = language;
    this.subject = new Subject();
    this.translatable = false;
    this.visible = visible;
    this._input = null;
    this._value = '';
    this._chkTranslatable = null;

    this.keyUpQueue = 0;

    this.DOMElement = this.render();
  }

  static deserialize(string) {
    let obj = JSON.parse(string);
    let item = new KeyItem(obj.key, obj.language, obj.visible);
    item.value = obj.value;
    return item;
  }

  disableInput() {
    this._input.disabled = true;
    return this;
  }

  enableInput() {
    this._input.disabled = false;
    return this;
  }

  isTranslatable() {
    return this.translatable;
  }

  isKeyValid(keyCode) {
    for (let allowedKey of KEYB_ALLOWED_KEYS) {
      if (keyCode.includes(allowedKey)) return true;
    }
    return false;
  }

  render() {
    if (this.DOMElement) return this.DOMElement;
    const itemTemplate = `<label class="mr-2"></label>
    <span class="badge badge-primary d-none">Padrão</span>
    <div class="input-group input-group-sm">
      <div class="input-group-prepend">
        <div class="input-group-text">
          <input type="checkbox" class="mr-1">Traduzir
        </div>
      </div>
      <input type="text" class="form-control form-control-sm translationText">
    </div>`;

    let item = this.DOMElement = document.createElement('div');
    item.innerHTML = itemTemplate;
    item.classList.add('form-group');

    this._input = item.children.item(2).children.item(1);
    this._chkTranslatable = item.querySelector('input[type=checkbox]');
    this._chkTranslatable.onchange = this._ChkChange.bind(this);
    this.setTranslatableTo(true);

    this.setVisibilityTo(this.visible);
    item.firstChild.onclick = this._LabelOnClick.bind(this);

    item.children.item(0).textContent = this.language.text;
    this._input.dataset.key = this.key;
    this._input.dataset.id = this.language.id;

    this._input.onkeyup = this._InputOnKeyUp.bind(this);

    return item;
  }

  static serialize(item) {
    return JSON.stringify({
      key: item.key,
      language: item.language,
      value: item.value,
      visible: item.visible,
    });
  }

  setDefaultMarker(val) {
    if (this.DOMElement == null) return;
    if (val === true ) {
      this.DOMElement.children.item(1).classList.remove('d-none');
    } else {
      this.DOMElement.children.item(1).classList.add('d-none');
    }
    return this;
  }

  setTranslatableTo(value) {
    this._chkTranslatable.checked = this.translatable = value;
    return this;
  }

  setVisibilityTo(value) {
    this.visible = value;
    if (value) {
      this.DOMElement.firstChild.classList.remove('labelSecondaryLanguage');
      this.DOMElement.children.item(2).style.display = '';
    } else {
      this.DOMElement.firstChild.classList.add('labelSecondaryLanguage');
      this.DOMElement.children.item(2).style.display = 'none';
    }
    return this;
  }

  get value() {
    return this._value;
  }

  set value(val) {
    this._value = val;
    if (this.DOMElement != null) {
      this._input.value = val;
    }
  }

  _ChkChange(e) {
    this.translatable = e.target.checked;
  }

  _InputOnKeyUp(e) {
    if (!this.isKeyValid(e.code)) return false;
    this.keyUpQueue++;

    setTimeout(()=>{
      this.keyUpQueue--;
      if (this.keyUpQueue <= 0) {
        this.value = e.target.value;
        this.subject.notify(this);
      }
    }, 600);
  }

  _LabelOnClick(e) {
    this.setVisibilityTo(!this.visible);
  }
}
