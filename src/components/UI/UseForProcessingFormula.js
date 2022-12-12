
import { computed, reactive, toRef, watch } from "vue";
import { useBaseStore } from "@/store/piniaStore";
import UseUtilityServices from "@/components/UI/UseUtilityServices";


export default function UseForProcessingFormula(outerData) {
  const {getArrayElementsFromFormula} = UseUtilityServices()
  const store = useBaseStore();
  const data = reactive(outerData);
  const dependencyFormulaDisplay = toRef(data, 'dependencyFormulaDisplay');
  const parentIsShow = toRef(data, 'parentIsShow');
  const dependencyPrices = toRef(data, 'dependencyPrices');
  const changeValue = data?.changeValue;


  const localDependencyList = reactive({})


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
   * @type {ComputedRef<unknown>}
   */
  const parsingFormulaVariables = computed(() => {
    if (!isDependencyElementVisibility.value) {
      return false;
    }

    let formula = getArrayElementsFromFormula(
      dependencyFormulaDisplay.value
    );

    constructLocalListElementDependencyInFormula(formula);
    return processingVariablesOnFormula(formula);
  })


  /**
   * Отобразить текущий элемент
   * @type {ComputedRef<boolean>}
   */
  const isVisibilityFromDependency = computed(() => {
    if (isDependencyElementVisibility.value || !parentIsShow.value) {
      try {
        return eval(parsingFormulaVariables.value);
      } catch (e) {
        if (store.devMode) {
          console.error(e.message, parsingFormulaVariables.value);
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
    return Boolean(dependencyFormulaDisplay.value?.length);
  })


  /**
   * Отправить команду на удаление элемента из общих данных при его скрытии
   * @param newValue
   */

  watch(
    () => isVisibilityFromDependency.value,
    (newValue) => {
      if (newValue && store.isCanShowAllTooltips && changeValue) {
        changeValue("dependency");
      }
    },
    {deep: true})

  watch(() => store.isCanShowAllTooltips, (newValue) => {
    if (newValue && isVisibilityFromDependency.value && changeValue) {
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
      if (isUpdated && changeValue) {
        changeValue("changeValueDependenciesElements");
      }
    },
{deep: true}
  )




  /**
   * При глобальном включении возможности отображать подсказки - отправить состояние элемента
   */
  watch(() => store.isCanShowAllTooltips, ()=> {
    if (parentIsShow.value) {
      changeValid("global");
    }
  })

  /**
   * При изменении состояния видимости родителя - отправить состояние элемента.
   */
  watch(() => parentIsShow.value, (newValue) => {
    if (newValue) {
      data?.changeValue("global");
    } else {
      data?.changeValue("delete");
    }
  })

  /**
   * Существует список цен с зависимостями
   * @returns {boolean}
   */
  const isDependencyPriceExist = computed(() => {
    return Boolean(
      dependencyPrices?.value?.filter(
        (item) => item?.enabledFormula && item?.dependencyFormulaCost?.length
      )
    );
  })

  /**
   * Иницаилизировать проверку условий зависимых цен
   *
   * @returns {boolean}
   */
  const initProcessingDependencyPrice = computed(() => {
    return isDependencyPriceExist.value;
  })




  return {
    isVisibilityFromDependency,
    dependencyFormulaDisplay,
    parentIsShow,
    constructLocalListElementDependencyInFormula,
    processingVariablesOnFormula,
    parsingFormulaVariables,
    initProcessingDependencyPrice
  }
};
