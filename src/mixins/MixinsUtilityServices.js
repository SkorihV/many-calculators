import { useBaseStore } from "@/store/piniaStore";
import { mapState } from "pinia";

export const MixinsUtilityServices = {
  methods: {
    /**
     * получить из формулы массив элементов
     * @param formula
     * @returns {*}
     */
    getArrayElementsFromFormula(formula) {
      let localFormula = this.handleSpecSymbolsInFormula(formula);
      return this.getArrayOnFormulaElements(localFormula);
    },
    /**
     * преобразовывает полученные спецсимволы в обычные
     * @param formula
     * @returns {*}
     */
    handleSpecSymbolsInFormula(formula) {
      let localFormula = formula;
      this.getSpecSymbols?.forEach((specItem) => {
        localFormula = localFormula?.toString()?.replaceAll(specItem[0], specItem[1]);
      });
      return localFormula;
    },
    /**
     * преобразовывает формулу в массив
     * @param formula
     * @returns {*}
     */
    getArrayOnFormulaElements(formula) {
      let formulaInOut = formula
        ?.split(
          // /([A-Za-zА-Яа-яЁё0-9-_]*)|(\)|\(|>=|<=|<|>|!==|===|&&|\|\||\+|-|\/|\*)|(^[0-9]+(\.[0-9]+)+)/g
          /([A-Za-zА-Яа-яЁё0-9_]*)(\)|\(|>=|<=|<|>|!==|===|&&|\|\||\+|-|\/|\*)([0-9](\.[0-9])*)*/g
        )
        .filter((item) => item?.trim()?.length);

      formulaInOut = formulaInOut?.map((item) => {
        //удаляем пробелы по краям
        let nextItem = item?.replace(/^\s*|\s*$/g, "");
        // если по краям есть кавычки, то удаляем пробелы между
        // кавычками и текстом в середине, не трогая пробелы внутри текста
        if (nextItem.match(/^('|").*('|")$/)) {
          nextItem = "'" + nextItem?.replace(/^('|")\s*|\s*('|")$/g, "") + "'";
        }

        return nextItem;
      });
      return formulaInOut;
    },
    /**
     * Системная переменная объединяющая в себе сумму всех не используемых в формуле переменных
     * @returns {{summ: *, name: string}}
     */
    getProxyFreeVariables(value, name = null) {
      return new Proxy(
        {
          name: name === null ? this.getNameReserveVariable : name,
          cost: value,
          isShow: Boolean(value),
        },
        {
          get: (target, name) => {
            return name in target ? target[name] : null;
          },
        }
      );
    },
    /**
     * Сопоставить доступный список данных со списком переменных в формуле и получить список переменных отсутствующих в формуле
     * @param dataList
     * @param variablesList
     * @returns {*}
     */
    getListVariablesMissedInFormula(dataList, variablesList) {
      return dataList
        ?.filter((dataOnCalcComponent) => {
          const isFormula = variablesList.some(
            (varOnFormula) => varOnFormula === dataOnCalcComponent.name
          );
          return !isFormula;
        })
        .filter((item) => {
          return item;
        });
    },
    /**
     * Получить линейную сумму всех переданных значений
     * Условия:
     *           item.cost !== null &&
     *           !item.excludeFromCalculations &&
     *           item.isShow
     * @param dataList
     * @returns {*}
     */
    getSummaFreeVariablesInFormula(dataList) {
      return dataList.reduce((sum, item) => {
        const isAllowSummingCost = item?.cost !== null && !item.excludeFromCalculations && item.isShow;

        if (isAllowSummingCost) {
          sum += parseFloat(item.cost);
          return sum;
        }
        return sum;
      }, 0);
    },
    /**
     * Обрабатываем массив данных и получаем сумму всех значений из item.summ
     * @param dataListVariables
     * @returns {*}
     */
    parsingDataInFormulaOnSumma(dataListVariables) {
      return dataListVariables?.reduce((resultText, item) => {
        const isExistCost = item?.cost && typeof item?.cost === "number";

        if (isExistCost) {
          resultText += item.cost.toString();
          return resultText;
        }
        resultText += item;
        return resultText;
      }, "");
    },

    /**
     * обрабатывает значение согласно опции в логике когда поле не заполнено или скрыто настройками
     * zero - выводит ноль
     * error - выводит null что в расчете формулы приведет к ошибке
     *
     * @param dataList
     * @returns {*[]}
     */
    processingArrayOnFormulaProcessingLogic(dataList) {
      let resultList = [];
      let localDataList = dataList;
      for (let i = 0; i < localDataList.length; i++) {
        const currentItemList = localDataList[i];
        const isProcessingLogic = currentItemList?.formulaProcessingLogic?.length && currentItemList?.cost === null;
        const isItemObject = typeof currentItemList === "object";
        const isExistCost = typeof currentItemList?.cost === "number";
        const error = "ОшибкаЗаполнения";

        if (!isItemObject) {
          resultList.push(currentItemList);
        } else if (isItemObject && isProcessingLogic) {
          if (currentItemList.formulaProcessingLogic === "error") {
            resultList.push(error);
          } else if (currentItemList.formulaProcessingLogic === "zero") {
            resultList.push(0);
          }
        } else if (isItemObject && isExistCost) {
          resultList.push(currentItemList.cost);
        } else {
          resultList.push(currentItemList);
        }
      }
      return resultList;
    },
    /**
     * получить список значений полей в объекте - рекурсивно
     * @param object
     * @returns {*[]}
     */
    getNameElementsRecursive(object) {
      let resultArray = [];
      getPropInObject(this.originData?.templates, "elementName");
      function getPropInObject(object) {
        for (let prop in object) {
          if (typeof object[prop] === "object") {
            getPropInObject(object[prop]);
          } else if (prop === "elementName") {
            resultArray.push(
              object[prop]?.length ? object[prop] : object["json_id"]
            );
          }
        }
      }
      return resultArray;
    },
  },
  computed: {
    ...mapState(useBaseStore, ["getSpecSymbols"]),
  },
};
