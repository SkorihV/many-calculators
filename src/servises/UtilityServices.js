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
  const isAllowValueOutput =
    item[fieldName] === "value" || item[fieldName] === "valueSumm";
  const isAllowCostOutput =
    item.cost !== null &&
    (item[fieldName] === "summ" || item[fieldName] === "valueSumm");
  const unit = item?.unit ? item.unit : "";

  if (isAllowDataOutput) {
    result +=
      "\n<div class='calc__result-block-field-label'>" + item.label + " </div>";

    result += "<div class='calc__result-block-field-right'>";
    if (isAllowValueOutput) {
      result +=
        "<div class='calc__result-block-field-value'>" +
        item.displayValue +
        " " +
        unit;

      if (isAllowCostOutput) {
        result += " - ";
      }

      result += "</div>";
    }
    if (isAllowCostOutput) {
      let sum = item?.cost?.toString();
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
    const isProcessingLogic =
      currentItemList?.formulaProcessingLogic?.length &&
      currentItemList?.cost === null;
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
};

/**
 * Обрабатываем массив данных и получаем сумму всех значений из item.summ
 * @param dataListVariables
 * @returns {*}
 */
const parsingDataInFormulaOnSumma = function (dataListVariables) {
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
const getSummaFreeVariablesInFormula = function (dataList) {
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

export {
  parseResultValueObjectItem,
  processingArrayOnFormulaProcessingLogic,
  parsingDataInFormulaOnSumma,
  getSummaFreeVariablesInFormula,
  getListVariablesMissedInFormula,
  getNameElementsRecursive,
};