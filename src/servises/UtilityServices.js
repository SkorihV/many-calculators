import {
  SPEC_SYMBOLS,
  ERROR_PADDING,
  ERROR_ELEMENT_IS_NOT_EXIST,
} from "@/constants/variables";
import {
  REGEXP_QUOTES_AND_SPACE_AND_WORD,
  REGEXP_QUOTES_AND_WORD,
  REGEXP_SPACES_IN_AROUND,
  REGEXP_VARIABLE_SIGN_NUMBERS,
} from "@/constants/regexp";

const parseResultValueObjectItem = function (item, fieldName, currency) {
  let result = "";
  let currentValue =
    !isNaN(parseFloat(item.value)) && isFinite(item.value)
      ? Math.abs(item.value)
      : item.value;

  const isAllowZeroValue = !item?.zeroValueDisplayIgnore || !!currentValue;
  const isAllowDataOutput =
    item[fieldName] &&
    item.displayValue !== null &&
    item.isShow &&
    isAllowZeroValue &&
    item[fieldName] !== "no";
  const onlyTitle = item[fieldName] === "onlyTitle";
  const isAllowValueOutput =
    (item[fieldName] === "value" || item[fieldName] === "valueSumm") &&
    !onlyTitle;
  const isAllowCostOutput =
    item.cost !== null &&
    (item[fieldName] === "summ" || item[fieldName] === "valueSumm") &&
    !onlyTitle;
  const unit = item?.unit ? item.unit : "";

  if (isAllowDataOutput) {
    result +=
      "\n<div class='calc__result-block-field-label'>" + item.label + " </div>";

    result += "<div class='calc__result-block-field-right'>";
    if (isAllowValueOutput) {
      result +=
        "<div class='calc__result-block-field-value'>" +
        item.displayValue?.toLocaleString("ru") +
        " " +
        unit;

      if (isAllowCostOutput) {
        result += " - ";
      }

      result += "</div>";
    }
    if (isAllowCostOutput) {
      let sum = item?.cost?.toLocaleString("ru");
      result +=
        "<div class='calc__result-block-field-cost'>" +
        sum +
        " " +
        currency +
        "</div>";
    }
    result += "</div>";
  }
  return result;
};

/**
 * обрабатывает значение согласно опции в логике когда поле не заполнено или скрыто настройками
 * zero - выводит ноль
 * error - выводит null что в расчете формулы приведет к ошибке
 *
 * @param dataList
 * @returns {*[]}
 */
const processingArrayOnFormulaProcessingLogic = function (dataList) {
  let resultList = [];
  let localDataList = dataList;

  for (let i = 0; i < localDataList.length; i++) {
    const currentItemList = localDataList[i];

    const isNullData = currentItemList === null;

    if (!isItemObject(currentItemList)) {
      resultList.push(currentItemList);
    } else if (isNullData) {
      resultList.push(ERROR_ELEMENT_IS_NOT_EXIST);
    } else if (isItemObject(currentItemList)) {
      const pushValue = checkLogicAndReturnValue(currentItemList);
      if (pushValue !== null) {
        resultList.push(pushValue);
      }
    } else {
      resultList.push(currentItemList);
    }
  }
  return resultList;
};

const isLogicDataExist = (item) => {
  return Boolean(item?.formulaProcessingLogic?.length);
};
const isCostNull = (item) => {
  return item?.cost === null;
};
const isItemObject = (item) => {
  return typeof item === "object";
};
const isCostExist = (item) => {
  return typeof item?.cost === "number";
};
/**
 *
 * @param item
 * @returns {number|null|string}
 */
const checkLogicAndReturnValue = (item) => {
  if (isLogicDataExist(item) && isCostNull(item)) {
    if (item.formulaProcessingLogic === "error") {
      return ERROR_PADDING;
    } else if (item.formulaProcessingLogic === "zero") {
      return 0;
    }
  }
  if (isCostExist(item)) {
    return item.cost;
  }
  return null;
};

/**
 * Обрабатываем массив данных и получаем сумму всех значений из item.cost
 * @param dataListVariables
 * @returns {*}
 */
const parsingDataInFormulaOnSum = function (dataListVariables) {
  return dataListVariables?.reduce((resultText, item) => {
    const isExistCost = item?.cost && typeof item?.cost === "number";

    if (isExistCost) {
      resultText += item.cost.toString();
      return resultText;
    }
    resultText += item;
    return resultText;
  }, "");
};

/**
 * Получить линейную сумму всех переданных значений
 * Условия:
 *           item.cost !== null &&
 *           !item.excludeFromCalculations &&
 *           item.isShow
 * @param dataList
 * @returns {*}
 */
const getSummaVariablesInFormula = function (dataList) {
  return dataList.reduce((sum, item) => {
    const isAllowSummingCost =
      item?.cost !== null && !item.excludeFromCalculations && item.isShow;

    if (isAllowSummingCost) {
      sum += parseFloat(item.cost);
      return sum;
    }
    return sum;
  }, 0);
};

/**
 * Сопоставить доступный список данных со списком переменных в формуле и получить список переменных отсутствующих в формуле
 * @param dataList
 * @param variablesList
 * @returns {*}
 */
const getListVariablesMissedInFormula = function (dataList, variablesList) {
  return dataList?.filter((dataOnCalcComponent) => {
    const isFormula = variablesList.some((varOnFormula) => {
      return varOnFormula === dataOnCalcComponent.name;
    });
    return !isFormula;
  });
};

/**
 * Сопоставить доступный список данных со списком переменных в формуле и получить список переменных используемых в формуле
 * @param dataList
 * @param variablesList
 * @returns {*}
 */
const getListVariablesUsedInFormula = function (dataList, variablesList) {
  return dataList?.filter((dataOnCalcComponent) => {
    const isFormula = variablesList.some((varOnFormula) => {
      return varOnFormula === dataOnCalcComponent.name;
    });
    return isFormula;
  });
};

/**
 * получить список значений полей в объекте - рекурсивно
 * @param object
 * @returns {*[]}
 */
const getNameElementsRecursive = function (object) {
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
};

const decimalAdjust = function (value, exp = 0, type = "round") {
  if (typeof exp === "undefined" || +exp === 0) {
    try {
      return Math[type](value);
    } catch (e) {
      console.error(`Функции вида "${type}" - не существует ${e.message}`);
      return value;
    }
  }
  value = +value;
  exp = +exp;
  // Если значение не является числом, либо степень не является целым числом...
  if (isNaN(value) || !(typeof exp === "number" && exp % 1 === 0)) {
    return null;
  }
  // Сдвиг разрядов
  value = value.toString().split("e");
  value = Math[type](+(value[0] + "e" + (value[1] ? +value[1] - exp : -exp)));
  // Обратный сдвиг
  value = value.toString().split("e");
  return +(value[0] + "e" + (value[1] ? +value[1] + exp : exp));
};

/**
 *
 * @param value
 * @returns {boolean}
 */
const checkedValueOnVoid = (value) => {
  return value?.length !== 0 && value !== undefined && value !== null;
};

const replaceSpecSymbols = (formula) => {
  SPEC_SYMBOLS.forEach((specItem) => {
    formula = formula?.replaceAll(specItem[0], specItem[1]);
  });
  return formula;
};

/**
 * преобразовывает формулу в массив
 * @param formula
 * @returns {*}
 */
const getArrayOnFormula = (formula) => {
  let formulaInOut = formula
    ?.split(REGEXP_VARIABLE_SIGN_NUMBERS)
    .filter((item) => item?.trim()?.length);

  formulaInOut = formulaInOut?.map((item) => {
    //удаляем пробелы по краям
    let nextItem = item?.replace(REGEXP_SPACES_IN_AROUND, "");
    // если по краям есть кавычки, то удаляем пробелы между
    // кавычками и текстом в середине, не трогая пробелы внутри текста
    if (nextItem.match(REGEXP_QUOTES_AND_WORD)) {
      nextItem =
        "'" + nextItem?.replace(REGEXP_QUOTES_AND_SPACE_AND_WORD, "") + "'";
    }
    return nextItem;
  });
  return formulaInOut;
};

/**
 * получить из формулы массив элементов
 * @param formula
 * @returns {*}
 */
const getArrayElementsFromFormula = (formula) => {
  return getArrayOnFormula(replaceSpecSymbols(formula));
};

export {
  parseResultValueObjectItem,
  processingArrayOnFormulaProcessingLogic,
  parsingDataInFormulaOnSum,
  getSummaVariablesInFormula,
  getListVariablesMissedInFormula,
  getNameElementsRecursive,
  decimalAdjust,
  checkedValueOnVoid,
  replaceSpecSymbols,
  getArrayElementsFromFormula,
  getArrayOnFormula,
  checkLogicAndReturnValue,
  getListVariablesUsedInFormula,
};
