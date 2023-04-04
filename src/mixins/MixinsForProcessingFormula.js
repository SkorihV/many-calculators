import { MixinsUtilityServices } from "@/mixins/MixinsUtilityServices";
import {processingVariablesOnFormula} from "@/servises/ProcessingFormula";
import { MixinLocalDependencyList } from "@/mixins/MixinLocalDependencyList";

import { useBaseStore } from "@/store/piniaStore";
import { mapState } from "pinia";

export const MixinsForProcessingFormula = {
  mixins: [MixinsUtilityServices, MixinLocalDependencyList],
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
          formula = processingVariablesOnFormula(formula, this.localDependencyList);

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
  },
  watch: {
    // /**
    //  * Отправить команду на удаление элемента из общих данных при его скрытии
    //  */
    // isVisibilityFromDependency() {
    //   if (this.isCanShowAllTooltips) {    //
    //     this.changeValue("dependency");
    //   }
    // },
    // /**
    //  *
    //  * @param newValue
    //  */
    // isCanShowAllTooltips(newValue) {
    //   if (newValue && this.isVisibilityFromDependency) {
    //     this.changeValue("dependency");
    //   }
    // },
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
      return processingVariablesOnFormula(this.parsingFormulaVariables, this.localDependencyList);
    },
  },
};
