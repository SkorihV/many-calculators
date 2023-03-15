import { MixinsUtilityServices } from "@/mixins/MixinsUtilityServices";

import { useBaseStore } from "@/store/piniaStore";
import { mapState } from "pinia";

export const MixinsForProcessingFormula = {
  mixins: [MixinsUtilityServices],
  data() {
    return {
      /**
       * список переменных от которого зависит именно текущий элемент
       */
      localDependencyList: {},
      countUpdatedDependency: 0,
    };
  },
  methods: {
    /**
     *
     * @param value
     * @returns {boolean}
     */
    checkedValueOnVoid(value) {
      return value?.length !== 0 && value !== undefined && value !== null;
    },

    /**
     * Собираем локальный список зависимостей из глобального на основе формулы
     * @param formula
     */
    constructLocalListElementDependencyInFormula(formula) {
      formula.forEach((name) => {
        if (
          this.isElementDependency(name) &&
          !this.existLocalElementDependency(name)
        ) {
          this.putElementDependencyInLocalList(name);
        }
      });
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
    /**
     * Обработать список цен на подходящее условие и вернуть итоговую цену или null
     *
     * @param dependencyPrice
     * @returns {number|number|*|null}
     */
    costAfterProcessingDependencyPrice(dependencyPrice) {
      let result = dependencyPrice?.reduce(
        (resultReduce, item) => {
          if (item.disabledFormula) {
            return resultReduce;
          }

          let formula = this.getArrayElementsFromFormula(
            item?.dependencyFormulaCost
          );

          if (this.templateName === "UiInput") {
            formula = formula.map((item) =>
              item.toLowerCase() === "_self_" ? this.localInputValue : item
            );
          }
          if (this.templateName === "UiRange") {
            formula = formula.map((item) =>
              item.toLowerCase() === "_self_" ? this.resultValue : item
            );
          }


          this.constructLocalListElementDependencyInFormula(formula);
          formula = this.processingVariablesOnFormula(formula);

          try {
            if (eval(formula)) {
              resultReduce.changed = true;
              resultReduce.cost = item.cost ? item.cost : 0;
            }
          } catch (e) {
            if (this.devMode) {
              console.error(e.message, formula);
            }
          }
          return resultReduce;
        },
        /**
         * changed - необходим для понимания сработала формула хоть раз или нет,
         * если не сработала, то блок с зависимыми ценами пропускается и выводится стандартная
         */
        { cost: 0, changed: false }
      );
      return result.changed ? result.cost : null;
    },
    /**
     * Существует ли элемент от которого идет зависимость
     * @returns {*|null}
     */
    isElementDependency(name) {
      const elementIsNotExist = !name?.length && !this.globalDependenciesList;
      if (elementIsNotExist) {
        return false;
      }
      return name in this.globalDependenciesList;
    },
    /**
     * @param name
     * @returns {boolean}
     */
    existLocalElementDependency(name) {
      return name in this.localDependencyList;
    },
    /**
     * @param name
     */
    putElementDependencyInLocalList(name) {
      this.localDependencyList[name] = this.globalDependenciesList[name];
    },
  },
  watch: {
    /**
     * Отправить команду на удаление элемента из общих данных при его скрытии
     */
    isVisibilityFromDependency() {
      if (this.isCanShowAllTooltips) {
        this.changeValue("dependency");
      }
    },
    /**
     *
     * @param newValue
     */
    isCanShowAllTooltips(newValue) {
      if (newValue && this.isVisibilityFromDependency) {
        this.changeValue("dependency");
      }
    },
    globalDependenciesList: {
      handler(newValue) {
        let isUpdated = false;
        for (let key in newValue) {
          const isUpdatedDependencyList =
            this.existLocalElementDependency(key) &&
            (newValue[key].value !== this.localDependencyList[key].value ||
              newValue[key].isShow !== this.localDependencyList[key].isShow);

          if (isUpdatedDependencyList) {
            this.localDependencyList[key] = newValue[key];
            isUpdated = true;
            this.countUpdatedDependency++;
          }
        }
        if (isUpdated) {
          this.changeValue("changeValueDependenciesElements");
        }
      },
      deep: true,
    },
    localDependencyList: {
      handler(newValue, oldValue) {
        let isUpdated = false;
        Object.entries(newValue).forEach(([key, data]) => {
          if (data.value !== oldValue[key].value) {
            isUpdated = true;
          }
        });
      },
      deep: true,
    },
  },
  computed: {
    ...mapState(useBaseStore, [
      "globalDependenciesList",
      "isCanShowAllTooltips",
      "devMode",
    ]),
    /**
     * Отобразить текущий элемент
     * @returns {boolean|any}
     */
    isVisibilityFromDependency() {
      if (this.isDependencyElementVisibility && this.parentIsShow) {
        try {
          return eval(this.formulaAfterProcessingVariables);
        } catch (e) {
          if (this.devMode) {
            console.error(e.message, this.formulaAfterProcessingVariables);
          }
          return false;
        }
      }
      return this.parentIsShow;
    },
    /**
     * Отобразить поле
     * @returns {boolean}
     */
    isDependencyElementVisibility() {
      return Boolean(this.dependencyFormulaDisplay?.length);
    },

    /**
     * Преобразовать строку формулы в массив переменных со знаками
     * @returns {string|boolean}
     */
    parsingFormulaVariables() {
      if (!this.isDependencyElementVisibility) {
        return false;
      }

      let formula = this.getArrayElementsFromFormula(
        this.dependencyFormulaDisplay
      );

      this.constructLocalListElementDependencyInFormula(formula);
      return formula;
    },
    /**
     * Формула после замены переменных на их значения
     * @returns {string}
     */
    formulaAfterProcessingVariables() {
      return this.processingVariablesOnFormula(this.parsingFormulaVariables);
    },
  },
};
