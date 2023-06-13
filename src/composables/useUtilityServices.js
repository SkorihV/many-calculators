import { unref } from "vue";
import {
  REGEXP_QUOTES_AND_SPACE_AND_WORD,
  REGEXP_QUOTES_AND_WORD,
  REGEXP_SPACES_IN_AROUND,
  REGEXP_VARIABLE_SIGN_NUMBERS
} from "@/constants/regexp";
import { processingArrayOnFormulaProcessingLogic, replaceSpecSymbols } from "@/servises/UtilityServices";

export function useUtilityServices() {
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
    return replaceSpecSymbols(formula);
  };

  /**
   * преобразовывает формулу в массив
   * @param formula
   * @returns {*}
   */
  const getArrayOnFormulaElements = (formula) => {
    let formulaInOut = unref(formula)
      ?.split(
          REGEXP_VARIABLE_SIGN_NUMBERS
      )
      .filter((item) => item?.trim()?.length);

    formulaInOut = formulaInOut?.map((item) => {
      //удаляем пробелы по краям
      let nextItem = item?.replace(REGEXP_SPACES_IN_AROUND, "");
      // если по краям есть кавычки, то удаляем пробелы между
      // кавычками и текстом в середине, не трогая пробелы внутри текста
      if (nextItem.match(REGEXP_QUOTES_AND_WORD)) {
        nextItem = "'" + nextItem?.replace(REGEXP_QUOTES_AND_SPACE_AND_WORD, "") + "'";
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
