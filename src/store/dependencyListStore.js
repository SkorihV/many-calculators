
import {defineStore} from "pinia";

export const useDependencyListStore = defineStore('dependencyList', {
    state: () => ({
            // dependencyList: new Map()
            dependencyList: {}
        }),
    getters: {
        getElementByNameInDependency:
            ({ dependencyList }) =>
                (name) =>
                   name in dependencyList ? dependencyList[name] : null,
        getAllDependencyList: ({ dependencyList }) =>  dependencyList,
        /**
         *
         * @param nameItemList
         * @returns {boolean}
         */
        isElementDependency: ({dependencyList}) =>  (name = null) => {
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
         * @param cost
         */
        addDependencyElement({name,
                                 value,
                                 isShow,
                                 displayValue,
                                 type,
                                 cost = null,
                             }) {

            this.dependencyList[name] = {name,value,isShow,displayValue,type,cost}
        },
        deleteElementInDependencyList(name) {
            if (name in this.dependencyList) {
                delete this.dependencyList[name];
            }
        },
    }
})
