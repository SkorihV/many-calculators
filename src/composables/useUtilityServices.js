import { getBaseStoreGetters } from "@/composables/useBaseStore";
import { unref } from "vue";

export function useUtilityServices() {
  const { getSpecSymbols } = getBaseStoreGetters();
  /**
   * получить из формулы массив элементов
   * @param formula
   * @returns {*}
   */
  const getArrayElementsFromFormula = (formula) => {
    let localFormula = handleSpecSymbolsInFormula(unref(formula));
    return getArrayOnFormulaElements(localFormula);
  };

  /**
   * преобразовывает полученные спецсимволы в обычные
   * @param formula
   * @returns {*}
   */
  const handleSpecSymbolsInFormula = (formula) => {
    let localFormula = formula;
    getSpecSymbols.value?.forEach((specItem) => {
      localFormula = localFormula
        ?.toString()
        ?.replaceAll(specItem[0], specItem[1]);
    });
    return localFormula;
  };

  /**
   * преобразовывает формулу в массив
   * @param formula
   * @returns {*}
   */
  const getArrayOnFormulaElements = (formula) => {
    let formulaInOut = unref(formula)
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
  };
  return {
    getArrayElementsFromFormula,
    handleSpecSymbolsInFormula,
  };
}
