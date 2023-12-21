import {defineStore} from "pinia";

export const useValidationListStore = defineStore('validationList', {
    state: () => ({
        validationList: {}
    }),
    getters: {
        /**
         * Показать все данные с ошибками по заданному родителю
         *
         * @param state
         * @returns {function(*): unknown[]}
         */
        getValidationListByParentName:
            ({ validationList }) =>
                (parentName) =>
                    Object.values(validationList).filter(
                        (item) => item.parentName === parentName
                    ),
        /**
         * Есть ли во всем калькуляторе элементы с ошибками валидации
         * учитывать скрытые элементы
         * @param state
         * @returns {boolean}
         */
        isExistGlobalErrorsValidationTakeIntoHiddenElement: ({
                                                                 validationList,
                                                             }) =>
            Boolean(
                Object.values(validationList).filter((item) => item.error).length
            ),
        /**
         * Есть ли во всем калькуляторе элементы с ошибками валидации
         * игнорировать скрытые элементы
         * @param state
         * @returns {boolean}
         */

        isExistGlobalErrorsValidationIgnoreHiddenElement: ({
                                                               validationList,
                                                           }) =>
            Boolean(
                Object.values(validationList).filter(
                    (item) => item.error && item.isShow
                ).length
            ),
        /**
         * Есть ли хоть один видимый элемент-ребенок у родителя
         * @param state
         * @returns {function(*): boolean}
         */
        isValidationShowByParentName:
            ({ validationList }) =>
                (parentName) =>
                    Boolean(
                        Object.values(validationList).filter(
                            (item) => item.parentName === parentName && item.isShow
                        ).length
                    ),
        /**
         * Есть ли хоть один элемент-ребенок с ошибкой, у родителя
         * @param state
         * @returns {function(*): boolean}
         */
        isValidationErrorByParentName:
            ({ validationList }) =>
                (parentName) => {
                    return Boolean(
                        Object.values(validationList).filter(
                            (item) => item.parentName === parentName && item.error
                        ).length
                    );
                },

    },
    actions: {
        deleteElementInValidationsErrorsList(elementName) {
            if (elementName in this.validationList) {
                delete this.validationList[elementName];
            }
        },
        /**
         *  добавить/обновить ошибку в общий список
         * @param data
         */
        checkValidationDataAndToggle(data) {
          this.validationList[data.name] = data;
        },
    }
})