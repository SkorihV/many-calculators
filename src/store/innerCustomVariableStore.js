import {defineStore} from "pinia";

export const useInnerVariablesStore = defineStore('innerStore', {
  state: () => ({
    innerVariablesList: {}
  }),
  getters: {
    getAllInnerVariablesL: ({innerVariablesList}) => innerVariablesList,
    isInnerVariable: ({innerVariablesList}) => (name) => name in innerVariablesList,
    getInnerVariableByName: ({innerVariablesList}) => (name) => name in innerVariablesList ? innerVariablesList[name] : null,
  },
  actions: {
    addInnerVariable(data) {
      this.innerVariablesList[data.name] = data
    },
    deleteInnerVariable(name) {
      if (name in this.innerVariablesList) {
        delete this.innerVariablesList[name]
      }
    }
  }
})
