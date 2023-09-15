import {defineStore} from "pinia";

export const useResultListStore = defineStore('resultList', {
    state: () => ({
        resultList: {}, // список элементов которые будут участвовать в расчетах результата
        fieldsForOutputData: []
    }),
    getters: {
        /**
         * Получить весь список элементов результата
         * @param globalResultsElements
         * @returns {undefined}
         */
        getResultsAllList: ({ resultList }) => resultList,
        /**
         * Получить элемент из списка по его имени
         * @param globalResultsElements
         * @returns {function(*): *|null}
         */
        getResultElementByName:
            ({ resultList }) =>
                (name) =>
                   name in resultList ? resultList[name] : null,
        /**
         *
         * @param name
         * @returns {boolean}
         */
        isResultElement: ({ resultList }) => (name = null) => {
            if (!name) {
                return false;
            }
            return name in resultList;
        },
        isFieldsOutput: ({fieldsForOutputData}) => Boolean(fieldsForOutputData.length)
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

            if (this.isFieldsOutput && this.fieldsForOutputData.includes(name)) {
                window.calcDataFields[name] = cost
            }
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
        deleteResultElementInList(elementName) {
            if (elementName in this.resultList) {
                delete this.resultList[elementName];
            }
        },
        setFieldsForOutputData(fieldsArr) {
            this.fieldsForOutputData = fieldsArr
        }

    }
})
