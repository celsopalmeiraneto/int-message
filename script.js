var translationKeys, translationsBox, translationResult;
var searchCounter = 0;
var settings = {
  replicateSameLanguage: true
}

const availableLanguages = [
  { id: "pt-BR", text: "Português - Brasil" },
  { id: "pt-PT", text: "Português - Portugal" },
  { id: "en-US", text: "Inglês - Estados Unidos" },
  { id: "en-GB", text: "Inglês - Reino Unido" },
  { id: "es-UY", text: "Espanhol" }
];

document.addEventListener('DOMContentLoaded', () =>{
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
  const itemTemplate = `<label>Tradução</label>
            <input type="text" class="form-control form-control-sm translationText" value="">`;

  translationsBox.innerHTML = ""; // TODO: Make a delta of changes and apply just where it's necessary.

  var keys = parseKeys();

  keys.forEach(key => {
    var addedLanguages = [];

    let headerKey = document.createElement("h5");
    headerKey.textContent = key;

    let group = document.createElement("div");
    group.classList.add("list-group");
    group.classList.add("list-group-flush");

    var groupItem = document.createElement("div");
    groupItem.classList.add("list-group-item");
    groupItem.append(headerKey);

    group.appendChild(groupItem);

    translationsBox.appendChild(group);

    availableLanguages.forEach(v => {
      let item = document.createElement("div");
      item.innerHTML = itemTemplate;
      item.classList.add("form-group");

      item.children.item(0).textContent = v.text;
      item.children.item(1).dataset.key = key;
      item.children.item(1).dataset.id = v.id;

      if(addedLanguages.includes(v.id.substr(0, 2)) && settings.replicateSameLanguage){
        item.classList.add("d-none");
      }else{
        addedLanguages.push(v.id.substr(0, 2));
      }

      item.onkeyup = (e) => {
        if(settings.replicateSameLanguage){
            replicateText(e);
        }
        generateResults();
      }

      groupItem.appendChild(item);
    });
  });
}

function replicateText(e){
  var language = e.target.dataset.id.substr(0, 2);
  var key = e.target.dataset.key;
  getTranslationFields().forEach(v => {
    if(e.target !== v && key === v.dataset.key && v.dataset.id.startsWith(language)){
      v.value = e.target.value;
    }
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
