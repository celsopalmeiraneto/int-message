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
    setTimeout(()=>{
      searchCounter--;
      if(searchCounter === 0) return populateForm();
    }, 500);
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
    let newGroups = [];
    parseKeys().forEach((key) => {
      let group = groups.find(v => v.key == key);
      if(!group){
        let group = new KeyGroup(key);
        group.subject.addObserver(observer);
        newGroups.push(group);
        return;
      }else{
        newGroups.push(group);
      }
    });

    translationsBox.innerHTML = "";
    groups = newGroups;
    groups.forEach(v => translationsBox.appendChild(v.DOMElement));
    generateResults();
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
        acc += `    PR_ATUALIZA_INT_MESSAGE('${v.dataset.id}', '${v.dataset.key}', '${v.value}', 'N');\n`;
        return acc;
      }
      return acc;
    }, "");

    translationResult.value = result + "COMMIT;\n END;";
  }
})();
