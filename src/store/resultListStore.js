import {defineStore} from "pinia";

export const useResultListStore = defineStore('resultList', {
    state: () => ({
        resultList: {}, // список элементов которые будут участвовать в расчетах результата
    }),
    getters: {
        /**
         * Получить весь список элементов результата
         * @param globalResultsElements
         * @returns {undefined}
         */
        getAllResultsList: ({ resultList }) => resultList,
        /**
         * Получить элемент из списка по его имени
         * @param globalResultsElements
         * @returns {function(*): *|null}
         */
        getResultElementByName:
            ({ resultList }) =>
                (name) =>
                   name in resultList ? resultList[name] : null,

    },
    actions: {
        addResultElement(dataResultItem) {
            const {
                name,
                type,
                label,
                cost,
                value,
                displayValue,
                formOutputMethod,
                resultOutputMethod,
                eventType,
                unit,
                isShow,
                excludeFromCalculations,
                formulaProcessingLogic,
                position,
                zeroValueDisplayIgnore,
                isDuplicator,
                parentName,
            } = dataResultItem;
            this.resultList[name] = {
                name,
                type,
                label,
                cost,
                formOutputMethod,
                resultOutputMethod,
                value,
                summ: cost,
                displayValue,
                unit: unit ? unit : null,
                isShow,
                excludeFromCalculations,
                eventType,
                formulaProcessingLogic,
                position,
                zeroValueDisplayIgnore,
                parentName,
                isDuplicator: isDuplicator ? isDuplicator : false,
            };
        },
        /**
         *
         * Модифицировать поле из результирующего списка новыми данными
         * @param elementName
         * @param modifiedFieldName
         * @param newData
         */
        modifiedResultElement({ elementName, modifiedFieldName, newData }) {
            this.resultList[elementName][modifiedFieldName] = newData;
        },
        deleteElementInResultsList(elementName) {
            if (elementName in this.resultList) {
                delete this.resultList[elementName];
            }
        },
        /**
         *
         * @param name
         * @returns {boolean}
         */
        isElementResult(name = null) {
            if (!name) {
                return false;
            }
            return name in this.resultList;
        },

    }
})