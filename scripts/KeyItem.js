import Subject from "./Observer/Subject.js";

class KeyItem {
  constructor(key, language) {
    this.key = key;
    this.language = language;
    this.visible = true;
    this._value = "";

    this.DOMElement = null;
    this.subject = new Subject();
  }

  get value(){
    return this._value;
  }

  set value(val){
    this._value = val;
    if(this.DOMElement != null){
      this.DOMElement.children.item(1).value = val;
    }
  }

  render(){
    const itemTemplate = `<label>Tradução</label>
              <input type="text" class="form-control form-control-sm translationText" value="">`;

    let item = document.createElement("div");
    item.innerHTML = itemTemplate;
    item.classList.add("form-group");

    item.style.display = this.visible ? item.style.display : "none";

    item.children.item(0).textContent = this.language.text;
    item.children.item(1).dataset.key = this.key;
    item.children.item(1).dataset.id = this.language.id;

    item.onkeyup = (e) => {
      this.value = e.target.value;
      this.subject.notify(this);
    };

    this.DOMElement = item;
    return item;
  }
}

export default KeyItem;
