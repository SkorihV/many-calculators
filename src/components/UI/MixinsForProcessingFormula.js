import { MixinsUtilityServices } from "@/components/UI/MixinsUtilityServices";

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
      return formula?.reduce((resultText, item) => {
        let elementDependency =
          item in this.localDependencyList
            ? this.localDependencyList[item]
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
    },
    /**     *
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
          this.constructLocalListElementDependencyInFormula(formula);
          formula = this.processingVariablesOnFormula(formula);
          try {
            if (eval(formula)) {
              resultReduce.changed = true;
              resultReduce.cost = item.cost ? item.cost : 0;
              return resultReduce;
            }
            return resultReduce;
          } catch (e) {
            if (this.devMode) {
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
    },
    /**
     * Элемент от которого идет зависимость
     * @returns {*|null}
     */
    isElementDependency(name) {
      if (!name?.length && !this.globalDependenciesList) {
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
          if (this.existLocalElementDependency(key)) {
            if (
              newValue[key].value !== this.localDependencyList[key].value ||
              newValue[key].isShow !== this.localDependencyList[key].isShow
            ) {
              this.localDependencyList[key] = newValue[key];
              isUpdated = true;
            }
          }
        }
        if (isUpdated) {
          this.changeValue("changeValueDependenciesElements");
        }
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
          return eval(this.parsingFormulaVariables);
        } catch (e) {
          if (this.devMode) {
            console.error(e.message, this.parsingFormulaVariables);
          }
          return false;
        }
      }
      return  this.parentIsShow;
    },
    /**
     * Отобразить поле
     * @returns {boolean}
     */
    isDependencyElementVisibility() {
      return Boolean(this.dependencyFormulaDisplay?.length);
    },

    /**
     * Получить массив значений из формулы
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
      return this.processingVariablesOnFormula(formula);
    },
  },
};
