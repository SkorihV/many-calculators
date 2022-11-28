import { mapGetters } from "vuex";

export const MixinsUtilityServices = {
  data() {
    return {

    }
  },
  methods: {
    /**
     * получить из формулы массив элементов
     * @param formula
     * @returns {*}
     */
    getArrayElementsFromFormula(formula) {
      formula = this.handleSpecSymbolsInFormula(formula);
      formula = this.getArrayOnFormulaElements(formula);
      return formula;
    },
    /**
     * преобразовывает полученные спецсимволы в обычные
     * @param formula
     * @returns {*}
     */
    handleSpecSymbolsInFormula(formula) {
      this.getSpecSymbols.forEach((specItem) => {
        formula = formula?.replaceAll(specItem[0], specItem[1]);
      });
      return formula;
    },
    /**
     * преобразовывает формулу в массив
     * @param formula
     * @returns {*}
     */
    getArrayOnFormulaElements(formula) {
      let formulaInOut = formula
        ?.split(
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
     * преобразовать объект с результирующими данными в массив
     * @param currentListData
     * @returns {{length}|unknown[]|*[]}
     */
    getBaseDataForCalculateInArray(currentListData) {
      const dataList = Object.values(currentListData);
      return dataList?.length ? dataList : [];
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
        if (
          item?.cost !== null &&
          !item.excludeFromCalculations &&
          item.isShow
        ) {
          return sum + parseFloat(item.cost);
        }
        return sum + 0;
      }, 0);
    },
    /**
     * Обрабатываем массив данных и получаем сумму всех значений из item.summ
     * @param dataListVariables
     * @returns {*}
     */
    parsingDataInFormulaOnSumma(dataListVariables) {
      return dataListVariables?.reduce((resultText, item) => {
        if (typeof item?.cost === "number" && item?.isShow) {
          return (resultText += item.cost);
        }
        if (typeof item?.cost === "number" && !item?.isShow) {
          return (resultText += "0");
        }
        return (resultText += item);
      }, "");
    },
  },
  computed: {
    ...mapGetters(["getSpecSymbols"]),
  },
};
