import { unref } from "vue";

/**
 * Обработать строку формулы зависимости и получает из нее данные
 * и получить строку со значениями
 * @param formula
 * @param localDependencyList
 * @returns {*|null}
 */
const processingVariablesOnFormula = function (formula, localDependencyList) {
  localDependencyList = unref(localDependencyList);
  formula = unref(formula);
  if (!formula) {
    return null;
  }

  const result = formula?.reduce((resultText, item) => {
    const elementDependency =
      item in localDependencyList ? localDependencyList[item] : null;
    const elementIsExist = elementDependency !== null;

    const valueIsBool = typeof elementDependency?.value === "boolean";
    const valueIsNull = elementDependency?.value === null;
    const valueIsArray = Array.isArray(elementDependency?.value);
    const valueIsNum = !isNaN(parseFloat(elementDependency?.value));

    if (elementIsExist) {
      if (valueIsNum) {
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
};

export { processingVariablesOnFormula };
