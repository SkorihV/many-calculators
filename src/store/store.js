// import { createStore } from "vuex";
//
// export default createStore({
//   state() {
//     return {
//       dataListForDependencies: {},
//       shownAllTooltips: false, //  показывать ошибки валидации для всех шаблонов
//       validationsErrorsList: {}, // список элементов с ошибками валидации
//       reserveVariableForOtherSumma: "_otherSum_", // зарезервированная переменная в которую попадают сумма всех полей не учавствующих в формуле
//       specSymbols: Object.entries({
//         "&gt;": ">",
//         "&lt;": "<",
//         "&amp;": "&",
//         "&quot;": '"',
//       }),
//       globalResultsElements: {}, // список элементов которые будут участвовать в расчетах результата
//       devMode: false,
//       showInsideElementStatus: false,
//     };
//   },
//   actions: {
//     tryAddResultElement({ commit }, dataResultItem) {
//       commit("addResultElement", dataResultItem);
//     },
//     /**
//      * Модифицировать поле из результирующего списка новыми данными
//      * @param commit
//      * @param dataModified
//      */
//     tryModifiedResultElement({ commit }, dataModified) {
//       commit("modifiedElement", dataModified);
//     },
//     /**
//      * Добавить элемент зависимости в общий массив данных
//      * @param commit
//      * @param data
//      */
//     tryAddDependencyElement({ commit }, data) {
//       commit("addDependencyElement", data);
//     },
//     /**
//      * удалить элемент зависимости из общего массива данных по имени
//      * @param commit
//      * @param elementName
//      */
//     tryDeleteDependencyElementOnName({ commit }, elementName) {
//       commit("deleteDependencyElement", elementName);
//     },
//     /**
//      * разрешить отображение подсказок с ошибками
//      * @param commit
//      */
//     showAllTooltipsOn({ commit }) {
//       commit("toggleShowAllTooltips", true);
//     },
//     /**
//      *  добавить/обновить  ошибку в общий список
//      * @param commit
//      * @param data
//      */
//     checkValidationDataAndToggle({ commit }, data) {
//       commit("addError", data);
//     },
//     tryToggleDevMode({ commit }, flag) {
//       commit("toggleDevMode", flag);
//     },
//     tryToggleShowInsideElementStatus({ commit }, flag) {
//       commit("toggleShowInsideElementStatus", flag);
//     },
//   },
//   mutations: {
//     addResultElement(state, data) {
//       const {
//         name,
//         type,
//         label,
//         cost,
//         value,
//         displayValue,
//         formOutputMethod,
//         eventType,
//         unit,
//         isShow,
//         excludeFromCalculations,
//         formulaProcessingLogic,
//       } = data;
//
//       state.globalResultsElements[name] = {
//         name,
//         type,
//         label,
//         cost,
//         formOutputMethod,
//         value,
//         summ: cost,
//         displayValue,
//         unit: unit ? unit : null,
//         isShow,
//         excludeFromCalculations,
//         eventType,
//         formulaProcessingLogic,
//       };
//     },
//     /**
//      * Модифицировать поле с данными
//      * @param state
//      * @param elementName
//      * @param modifiedFieldName
//      * @param newData
//      */
//     modifiedElement(state, { elementName, modifiedFieldName, newData }) {
//       state.globalResultsElements[elementName][modifiedFieldName] = newData;
//     },
//     addDependencyElement(
//       state,
//       { name, value, isShow, displayValue, type, parentName }
//     ) {
//       state.dataListForDependencies[name] = {
//         name,
//         value,
//         isShow,
//         displayValue,
//         type,
//         parentName,
//       };
//     },
//     deleteDependencyElement(state, elementName) {
//       if (state.dataListForDependencies.hasOwnProperty(elementName)) {
//         delete state.dataListForDependencies[elementName];
//       }
//     },
//     toggleShowAllTooltips(state, flag) {
//       state.shownAllTooltips = flag;
//     },
//     addError(state, data) {
//       state.validationsErrorsList[data.name] = data;
//     },
//     toggleDevMode(state, flag) {
//       state.devMode = flag;
//     },
//     toggleShowInsideElementStatus(state, flag) {
//       state.showInsideElementStatus = flag;
//     },
//   },
//   getters: {
//     /**
//      * Получить весь список элементов результата
//      * @param state
//      * @returns {{}}
//      */
//     getAllResultsElements: (state) => state.globalResultsElements,
//     /**
//      * Получить элемент из списка по его имени
//      * @param state
//      * @returns {function(*): *|null}
//      */
//     getResultElementOnName: (state) => (name) =>
//       state?.globalResultsElements[name]
//         ? state.globalResultsElements[name]
//         : null,
//     /**
//      * Массив со всеми зависимостями и значениями
//      * @param state
//      * @returns {{}}
//      */
//     globalDependenciesList: (state) => {
//       return state.dataListForDependencies;
//     },
//     /**
//      * Активирует возможность показывать всплывающие подсказки с ошибками
//      * @param state
//      * @returns {boolean}
//      */
//     isCanShowAllTooltips: (state) => {
//       return state.shownAllTooltips;
//     },
//     /**
//      * Показать все данные с ошибками по заданному родителю
//      *
//      * @param state
//      * @returns {function(*): unknown[]}
//      */
//     getValidationListOnParentName: (state) => (parentName) =>
//       Object.values(state.validationsErrorsList).filter(
//         (item) => item.parentName === parentName
//       ),
//     /**
//      * Есть ли хоть один видимый элемент-ребенок у родителя
//      * @param state
//      * @returns {function(*): boolean}
//      */
//     isValidationShowOnParentName: (state) => (parentName) =>
//       Boolean(
//         Object.values(state.validationsErrorsList).filter(
//           (item) => item.parentName === parentName && item.isShow
//         ).length
//       ),
//     /**
//      * Есть ли хоть один элемент-ребенок с ошибкой, у родителя
//      * @param state
//      * @returns {function(*): boolean}
//      */
//     isValidationErrorOnParentName: (state) => (parentName) => {
//       return Boolean(
//         Object.values(state.validationsErrorsList).filter(
//           (item) => item.parentName === parentName && item.error
//         ).length
//       );
//     },
//     /**
//      * Есть ли во всем калькуляторе элементы с ошибками валидации
//      * @param state
//      * @returns {boolean}
//      */
//     isCheckedGlobalValidation: (state) =>
//       Boolean(
//         Object.values(state.validationsErrorsList).filter(
//           (item) => item.error && item.isShow
//         ).length
//       ),
//     /**
//      * Список элементов с информацией о валидации
//      * @param state
//      * @returns {{}}
//      */
//     validationList: (state) => state.validationsErrorsList,
//     /**
//      * название спецпеременной служащей для суммирования в себе всех значений
//      * @param state
//      * @returns {string}
//      */
//     getNameReserveVariable: (state) => state.reserveVariableForOtherSumma,
//     getSpecSymbols: (state) => state.specSymbols,
//     devMode: (state) => state.devMode,
//     showInsideElementStatus: (state) => state.showInsideElementStatus,
//     getImageDir: () => (window?.imageDir ? window.imageDir : ""),
//   },
// });
