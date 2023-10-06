
import {defineStore} from "pinia";

export const useDependencyListStore = defineStore('dependencyList', {
    state: () => ({
      dependencyList: {},
    }),
    getters: {
        getDependencyElementByName:
            ({ dependencyList }) =>
                (name) =>
                   name in dependencyList ? dependencyList[name] : null,
        getDependencyAllList: ({ dependencyList }) =>  dependencyList,
        /**
         *
         * @param nameItemList
         * @returns {boolean}
         */
        isDependencyElement: ({dependencyList}) =>  (name = null) => {
            if (!name) {
                return false;
            }
            return name in dependencyList;
        },
    },
    actions: {
        /**
         * Добавить элемент зависимости в общий массив данных
         * @param name
         * @param value
         * @param isShow
         * @param displayValue
         * @param type
         */
        addDependencyElement({name,
                                 value,
                                 isShow,
                                 displayValue,
                                 type,
                             }) {

            this.dependencyList[name] = {name,value,isShow,displayValue,type}
        },
        deleteDependencyElementInList(name) {
            if (name in this.dependencyList) {
                delete this.dependencyList[name];
            }
        },
    }
})
