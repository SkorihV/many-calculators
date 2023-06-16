import { useBaseStore } from "@/store/piniaStore";
import { mapState } from "pinia";
import { NAME_RESERVED_VARIABLE_SUM } from "@/constants/variables";
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
          name: name === null ? NAME_RESERVED_VARIABLE_SUM : name,
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
  },
  computed: {
    ...mapState(useBaseStore, ["getSpecSymbols"]),
  },
};
