import KeyGroup from "./KeyGroup.js";
import Observer from "./Observer/Observer.js";
import QueryBuilderSGF from "./QueryBuilder/QueryBuilderSGF.js";
import QueryBuilderCFG_Traducao from "./QueryBuilder/QueryBuilderCFG_Traducao.js";

(() => {
  var translationKeys, translationsBox, translationResult, observer;
  var searchCounter = 0;

  var groups = [];
  var queryBuilder = new QueryBuilderSGF();

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

    document.getElementsByName("queryType").forEach((r, i) => {
      r.onchange = onCheckQueryBuilder;
      if(i == 0){
        r.click();
      }
    });
  }

  function onCheckQueryBuilder(e){
    switch (e.target.value) {
    case "SGF":
      queryBuilder = new QueryBuilderSGF();
      break;
    case "CFG_Traducao":
      queryBuilder = new QueryBuilderCFG_Traducao();
      break;
    }
    generateResults();
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
    translationResult.value = queryBuilder.build(groups);
  }
})();
