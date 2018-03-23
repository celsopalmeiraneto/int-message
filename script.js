var translationKey, translationsBox, translationResult;
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
  populateForm();
}, false);

function populateGlobalVars(){
  translationKey = document.getElementById("translationKey");
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
  var template = `<label>Tradução</label>
            <input type="text" class="form-control form-control-sm translationText" value="">`;
  var addedLanguages = [];
  availableLanguages.map((v) => {
    let item = document.createElement("div");
    item.innerHTML = template;
    item.classList.add("form-group");

    item.children.item(0).textContent = v.text;
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

    translationsBox.appendChild(item);
  });
}

function replicateText(e){
  var language = e.target.dataset.id.substr(0, 2);
  getTranslationFields().forEach(v => {
    if(e.target !== v && v.dataset.id.startsWith(language)){
      v.value = e.target.value;
    }
  });
}

function getTranslationFields(){
  return Array.from(document.getElementsByClassName("translationText"));
}

function generateResults(){
  let translations = getTranslationFields();

  let result = "BEGIN\n" + translations.reduce((acc, v) => {
    if(v && v.value && v.value.trim() !== ""){
      acc += `    PR_ATUALIZA_INT_MESSAGE('${v.dataset.id}', '${translationKey.value}', '${v.value}', 'S');\n`;
      return acc;
    }
    return acc;
  }, "");

  translationResult.value = result + "COMMIT;\n END;";
}
