
import { computed, defineProps, reactive, watch } from "vue";
import { useBaseStore } from "@/store/piniaStore";
import UseUtilityServices from "@/components/UI/UseUtilityServices";


export default function UseForProcessingFormula(changeValue = null) {
  const store = useBaseStore();
  const {getArrayElementsFromFormula} = UseUtilityServices()
  /**
   * Формула на результатах вычисления которой будет строиться результат отображения элемента
   * @type {Readonly<{[key in string]?: string}>}
   */
  const dependencyFormulaDisplay = defineProps({
    type: String,
    default: "",
  })
  const parentIsShow = defineProps({
    type: Boolean,
    default: true,
  })

  const localDependencyList = reactive({})

  const checkedValueOnVoid = (value) => {
    return value?.length !== 0 && value !== undefined && value !== null;
  }

  /**
   * Собираем локальный список зависимостей из глобального на основе формулы
   * @param formula
   */
  const constructLocalListElementDependencyInFormula = (formula) => {
    formula.forEach((name) => {
      if (
        isElementDependency(name) &&
        !existLocalElementDependency(name)
      ) {
        putElementDependencyInLocalList(name);
      }
    });
  }

  /**
   * Обработать полученные переменные из формулы
   * и получить строку со значениями
   * @returns {string}
   */
  const processingVariablesOnFormula = (formula) => {
    return formula?.reduce((resultText, item) => {
      let elementDependency =
        item in localDependencyList
          ? localDependencyList[item]
          : null;

      if (elementDependency && elementDependency.isShow) {
        if (!isNaN(parseFloat(elementDependency?.value))) {
          return resultText + elementDependency?.value;
        } else if (typeof elementDependency?.value === "boolean") {
          return resultText + Boolean(elementDependency?.value);
        } else {
          return resultText + "'" + elementDependency.value + "'";
        }
      }
      return resultText + item;
    }, "");
  }

  /**     *
   * Обработать список цен на подходящее условие и вернуть итоговую цену или null
   *
   * @param dependencyPrice
   * @returns {number|number|*|null}
   */
  const costAfterProcessingDependencyPrice = (dependencyPrice) => {
    let result = dependencyPrice?.reduce(
      (resultReduce, item) => {
        if (!item.enabledFormula) {
          return resultReduce;
        }
        let formula = getArrayElementsFromFormula(
          item?.dependencyFormulaCost
        );

        constructLocalListElementDependencyInFormula(formula);
        formula = processingVariablesOnFormula(formula);
        try {
          if (eval(formula)) {
            resultReduce.changed = true;
            resultReduce.cost = item.cost ? item.cost : 0;
            return resultReduce;
          }
          return resultReduce;
        } catch (e) {
          if (store.devMode) {
            console.error(e.message, formula);
          }
          return resultReduce;
        }
      },
      /**
       * changed - необходим для понимания сработала формула хоть раз или нет,
       * если не сработала, то блок с зависимыми ценами пропускается и выводится стандартная
       */
      { cost: 0, changed: false }
    );
    return result.changed ? result.cost : null;
  }

  /**
   * Элемент от которого идет зависимость
   * @returns {*|null}
   */
  const isElementDependency = (name) => {
    if (!name?.length && !store.globalDependenciesList) {
      return false;
    }
    return name in store.globalDependenciesList;
  }

  const existLocalElementDependency = (name) => {
    return name in localDependencyList;
  }

  const putElementDependencyInLocalList = (name) => {
    localDependencyList[name] = store.globalDependenciesList[name];
  }


  /**
   * Получить массив значений из формулы
   * @type {ComputedRef<>}
   */
  const parsingFormulaVariables = computed(() => {
    if (!isDependencyElementVisibility) {
      return false;
    }

    let formula = getArrayElementsFromFormula(
      dependencyFormulaDisplay
    );

    constructLocalListElementDependencyInFormula(formula);
    return processingVariablesOnFormula(formula);
  })


  /**
   * Отобразить текущий элемент
   * @type {ComputedRef<>}
   */
  const isVisibilityFromDependency = computed(() => {
    if (isDependencyElementVisibility || !parentIsShow) {
      try {
        return eval(parsingFormulaVariables);
      } catch (e) {
        if (store.devMode) {
          console.error(e.message, parsingFormulaVariables);
        }
        return false;
      }
    }
    return true;
  })

  /**
   * Отобразить поле
   * @returns {boolean}
   */
  const isDependencyElementVisibility = computed(() => {
    return Boolean(dependencyFormulaDisplay?.length);
  })


  /**
   * Отправить команду на удаление элемента из общих данных при его скрытии
   * @param newValue
   */

  watch(isVisibilityFromDependency, (newValue) => {
    if (newValue && store.isCanShowAllTooltips) {
      changeValue("dependency");
    }
  })

  watch(() => store.isCanShowAllTooltips, (newValue) => {
    if (newValue && isVisibilityFromDependency) {
      changeValue("dependency");
    }
  })

  watch(
    () => store.globalDependenciesList,
    (newValue) => {
      let isUpdated = false;
      for (let key in newValue) {
        if (existLocalElementDependency(key)) {
          if (
            newValue[key].value !== localDependencyList[key].value ||
            newValue[key].isShow !== localDependencyList[key].isShow
          ) {
            localDependencyList[key] = newValue[key];
            isUpdated = true;
          }
        }
      }
      if (isUpdated) {
        changeValue("changeValueDependenciesElements");
      }
    },
{deep: true}
  )

  return {
    isVisibilityFromDependency,
    dependencyFormulaDisplay,
    parentIsShow
  }
};
