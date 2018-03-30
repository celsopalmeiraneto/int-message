import QueryBuilder from "./QueryBuilder.js";
export default class QueryBuilderSGF extends QueryBuilder {
  constructor(){
    super();
  }

  build(groups){
    let hasOne = false;
    let result = "BEGIN\n" + groups.reduce((accGroup, group) => {
      accGroup += group.items.reduce((accItem, item) =>{
        if(typeof item.value === "string" && item.value.trim() !== ""){
          hasOne = true;
          accItem += `  PR_ATUALIZA_INT_MESSAGE('${item.language.id}', '${item.key}', '${item.value}', 'N');\n`;
        }
        return accItem;
      }, "");
      return accGroup;
    }, "");
    result += "COMMIT;\nEND;";

    return hasOne ? result : "";
  }
}
