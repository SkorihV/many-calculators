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
        localFormula = localFormula
          ?.toString()
          ?.replaceAll(specItem[0], specItem[1]);
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
          /([A-Za-zА-Яа-яЁё0-9_]*)(\)|\(|>=|<=|<|>|!==|===|&&|\|\||\+|-|\/|\*)([0-9]*(\.[0-9])*)/g
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
     * Обработать полученные переменные из формулы
     * и получить строку со значениями
     * @returns {string}
     */
    processingVariablesOnFormula(formula) {
      if (!formula) {
        return null;
      }
      const result = formula?.reduce((resultText, item) => {
        const elementDependency =
          item in this.localDependencyList
            ? this.localDependencyList[item]
            : null;

        const elementIsExist = elementDependency !== null;
        const valueIsExist = !isNaN(
          parseFloat(elementDependency?.value) &&
          !Array.isArray(elementDependency?.value) &&
          typeof elementDependency?.value !== "boolean"
        );
        const valueIsBool = typeof elementDependency?.value === "boolean";
        const valueIsNull = elementDependency?.value === null;
        const valueIsArray = Array.isArray(elementDependency?.value);

        if (elementIsExist) {
          if (valueIsExist) {
            return resultText + elementDependency?.value + " ";
          } else if (valueIsBool) {
            return resultText + Boolean(elementDependency?.value) + " ";
          } else if (valueIsNull) {
            return resultText + elementDependency?.value + " ";
          } else if (valueIsArray) {
            return resultText + elementDependency?.value + " ";
          } else {
            return resultText + "'" + elementDependency.value + "' ";
          }
        }
        return resultText + item + " ";
      }, "");
      return result;
    },
  },
  computed: {
    ...mapState(useBaseStore, ["getSpecSymbols"]),
  },
};
