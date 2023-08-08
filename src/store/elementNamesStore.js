import {defineStore} from "pinia";

export const useElementNamesStore = defineStore("elementNames", {
  state: () => ({
    nameList: {}
  }),
  getters: {
    getAllNameList: ({nameList}) => nameList,
    getAllNameListByArray: ({nameList}) => Object.values(nameList).sort( (a, b) => a.position - b.position )
  },
  actions: {
    addNameInList({name, label, position}) {
      this.nameList[name] = {name, label, position}
    },
    deleteNameInList(name) {
      if (name in this.nameList) {
        delete this.nameList[name]
      }
    }
  }
})
