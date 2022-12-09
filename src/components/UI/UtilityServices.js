import { useBaseStore } from "@/store/piniaStore";

export const UtilityServices = {
  setup() {
    const store = useBaseStore();

    /**
     * получить из формулы массив элементов
     * @param formula
     * @returns {*}
     */
    const getArrayElementsFromFormula = (formula) => {
      formula = handleSpecSymbolsInFormula(formula);
      formula = getArrayOnFormulaElements(formula);
      return formula;
    }
    /**
     * преобразовывает полученные спецсимволы в обычные
     * @param formula
     * @returns {*}
     */
    const handleSpecSymbolsInFormula = (formula) => {
      store.getSpecSymbols?.forEach((specItem) => {
        formula = formula?.replaceAll(specItem[0], specItem[1]);
      });
      return formula;
    }
    /**
     * преобразовывает формулу в массив
     * @param formula
     * @returns {*}
     */
    const getArrayOnFormulaElements = (formula) => {
      let formulaInOut = formula
        ?.split(
          // /([A-Za-zА-Яа-яЁё0-9-_]*)|(\)|\(|>=|<=|<|>|!==|===|&&|\|\||\+|-|\/|\*)|(^[0-9]+(\.[0-9]+)+)/g
          /([A-Za-zА-Яа-яЁё0-9-_]*)(\)|\(|>=|<=|<|>|!==|===|&&|\|\||\+|-|\/|\*)([0-9](\.[0-9])*)*/g
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
    }
    /**
     * Системная переменная объединяющая в себе сумму всех не используемых в формуле переменных
     * @returns {{summ: *, name: string}}
     */
    const getProxyFreeVariables = (value, name = null) => {
      return new Proxy(
        {
          name: name === null ? store.getNameReserveVariable : name,
          cost: value,
          isShow: Boolean(value),
        },
        {
          get: (target, name) => {
            return name in target ? target[name] : null;
          },
        }
      );
    }

    /**
     * Сопоставить доступный список данных со списком переменных в формуле и получить список переменных отсутствующих в формуле
     * @param dataList
     * @param variablesList
     * @returns {*}
     */
    const getListVariablesMissedInFormula = (dataList, variablesList) => {
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
    }
    /**
     * Получить линейную сумму всех переданных значений
     * Условия:
     *           item.cost !== null &&
     *           !item.excludeFromCalculations &&
     *           item.isShow
     * @param dataList
     * @returns {*}
     */
    const getSummaFreeVariablesInFormula = (dataList) => {
      return dataList.reduce((sum, item) => {
        if (
          item?.cost !== null &&
          !item.excludeFromCalculations &&
          item.isShow
        ) {
          return sum + parseFloat(item.cost);
        }
        return sum + 0;
      }, 0);
    }
    /**
     * Обрабатываем массив данных и получаем сумму всех значений из item.summ
     * @param dataListVariables
     * @returns {*}
     */
    const parsingDataInFormulaOnSumma = (dataListVariables) => {
      return dataListVariables?.reduce((resultText, item) => {
        if (typeof item?.cost === "number" && item?.isShow) {
          return (resultText += item.cost);
        }
        if (typeof item?.cost === "number" && !item?.isShow) {
          return (resultText += "0");
        }
        return (resultText += item);
      }, "");
    }

    /**
     * обрабатывает значение согласно опции в логике когда поле не заполнено или скрыто настройками
     * ignore - вместо поля выводит пустоту
     * zero - выводит ноль
     * error - выводит null что в расчете формулы приведет к ошибке
     *
     * @param dataList
     * @returns {*[]}
     */
    const processingArrayOnFormulaProcessingLogic = (dataList) => {
      let resultList = [];
      let localDataList = dataList;
      let singsList = ["+", "-", "*", "/"];
      for (let i = 0; i < localDataList.length; i++) {
        let currentItemList = localDataList[i];
        if (typeof currentItemList !== "object") {
          resultList.push(currentItemList);
        } else if (
          currentItemList?.formulaProcessingLogic?.length &&
          (currentItemList?.cost === null ||
            currentItemList?.cost === 0 ||
            !currentItemList.isShow)
        ) {
          if (currentItemList.formulaProcessingLogic === "error") {
            resultList.push(currentItemList);
          } else if (currentItemList.formulaProcessingLogic === "zero") {
            resultList.push(0);
          } else if (currentItemList.formulaProcessingLogic === "ignored") {
            if (i === 0 && singsList.includes(currentItemList[i + 1])) {
              i++;
            }

            if (
              i > 0 &&
              singsList.includes(resultList[resultList.length - 1])
            ) {
              resultList.pop();
            } else if (i > 0 && singsList.includes(currentItemList[i + 1])) {
              i++;
            }
          }
        } else {
          resultList.push(currentItemList);
        }
      }
      return resultList;
    }
    /**
     * получить список значений полей в объекте - рекурсивно
     * @param object
     * @returns {*[]}
     */
    const getNameElementsRecursive = (object) => {
      let resultArray = [];
      getPropInObject(object, "elementName");
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
    }
  },
};
