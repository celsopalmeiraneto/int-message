import KeyGroup from "./KeyGroup.js";
import Observer from "./Observer/Observer.js";

(() => {
  var translationKeys, translationsBox, translationResult, observer;
  var searchCounter = 0;

  var groups = [];

  document.addEventListener("DOMContentLoaded", () =>{
    populateGlobalVars();
  }, false);


  function translationKeyKeyUp(){
    searchCounter++;
    setTimeout(populateFormDispatcher, 500);
  }

  function populateFormDispatcher(){
    searchCounter--;
    if(searchCounter === 0) return populateForm();
  }

  function populateGlobalVars(){
    translationKeys = document.getElementById("translationKeys");
    translationKeys.onkeyup = translationKeyKeyUp;

    translationsBox = document.getElementById("translationsBox");
    translationResult = document.getElementById("translationResult");
    translationResult.onfocus = copyToClipboardOnFocus;

    observer = new Observer(this);
    observer.update = generateResults;
  }

  function copyToClipboardOnFocus(e){
    e.target.select();
    if(document.execCommand("copy")){
      var alert = document.getElementById("copyAlert");
      alert.style.display = "block";
      setTimeout(()=>{
        alert.style.display = "none";
      }, 2000);
    }
  }

  function populateForm(){
    translationsBox.innerHTML = ""; // TODO: Make a delta of changes and apply just where it's necessary.

    var keys = parseKeys();
    keys.forEach(key => {
      let group = new KeyGroup(key);
      group.subject.addObserver(observer);
      groups.push(group);
      translationsBox.appendChild(group.render());
    });
  }

  function getTranslationFields(){
    return Array.from(document.getElementsByClassName("translationText"));
  }

  function parseKeys(){
    return translationKeys.value.split("\n").reduce((acc, v) => {
      if(typeof v === "string" && v.trim() !== ""){
        acc.push(v.trim());
      }
      return acc;
    }, []);
  }

  function generateResults(){
    let translations = getTranslationFields();

    let result = "BEGIN\n" + translations.reduce((acc, v) => {
      if(v && v.value && v.value.trim() !== ""){
        acc += `    PR_ATUALIZA_INT_MESSAGE('${v.dataset.id}', '${v.dataset.key}', '${v.value}', 'S');\n`;
        return acc;
      }
      return acc;
    }, "");

    translationResult.value = result + "COMMIT;\n END;";
  }
})();
