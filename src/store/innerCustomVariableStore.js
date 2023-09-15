import {defineStore} from "pinia";

export const useInnerVariablesStore = defineStore('innerStore', {
  state: () => ({
    innerVariablesList: {},
    fieldsForOutputData: []
  }),
  getters: {
    getInnerVariablesAllList: ({innerVariablesList}) => innerVariablesList,
    isInnerVariable: ({innerVariablesList}) => (name) => name in innerVariablesList,
    getInnerVariableByName: ({innerVariablesList}) => (name) => name in innerVariablesList ? innerVariablesList[name] : null,
    isFieldsOutput: ({fieldsForOutputData}) => Boolean(fieldsForOutputData.length),
  },
  actions: {
    addInnerVariable(data) {
      this.innerVariablesList[data.name] = data
      if (this.isFieldsOutput && this.fieldsForOutputData.includes(data.name)) {
        window.calcDataFields[data.name] = data?.value
      }
    },
    deleteInnerVariable(name) {
      if (name in this.innerVariablesList) {
        delete this.innerVariablesList[name]
      }
    },
    setFieldsForOutputData(fieldsArr) {
      this.fieldsForOutputData = fieldsArr
    }
  }
})
