import { useBaseStore } from "@/store/piniaStore";
import { mapState } from "pinia";

export const MixinsGeneralItemData = {
  watch: {
    /**
     * При глобальном включении возможности отображать подсказки - отправить состояние элемента
     */
    isCanShowAllTooltips() {
      if (this.parentIsShow) {
        this.changeValid("global");
      }
    },
    /**
     * При изменении состояния видимости родителя - отправить состояние элемента.
     */
    parentIsShow(newValue) {
      if (newValue) {
        this.changeValue("global");
      } else {
        this.changeValue("delete");
      }
    },
  },
  computed: {
    ...mapState(useBaseStore, [
      "isCanShowAllTooltips",
      "devMode",
      "showInsideElementStatus",
    ]),
    /**
     * Существует список цен с зависимостями
     * @returns {boolean}
     */
    isDependencyPriceExist() {
      return Boolean(
        this.dependencyPrices?.filter(
          (item) =>
            !item?.disabledFormula && item?.dependencyFormulaCost?.length
        )
      );
    },
    /**
     * Инициализировать проверку условий зависимых цен
     *
     * @returns {boolean}
     */
    initProcessingDependencyPrice() {
      return this.isDependencyPriceExist;
    },
    /**
     *
     * @returns {boolean|string}
     */
    devModeData() {
      if (this.devMode && this.showInsideElementStatus) {
        return `
           ${this.labelHtml}
           ${this.elementNameHtml}
           ${this.dependencyFormulaHtml}
           ${this.dependencyFormulaBeforeProcessingHtml}
           ${this.valueHtml}
           ${this.infoVisibilityHtml}
           ${this.localCostHtml}`;
      }
      return false;
    },
    elementValue() {
      return this.templateName === "UiInput" || this.templateName === "UiRange"
        ? this.resultValue
        : this.templateName === "UiRadio"
        ? this.selectedValueInRadio
        : this.templateName === "UiSelect"
        ? this.currentOptionValue
        : this.templateName === "UiCheckbox"
        ? this.isLocalChecked
        : null;
    },
    labelHtml() {
      return `<div class="calc__dev-block-element">Заголовок элемента: ${this.label}</div>`;
    },
    elementNameHtml() {
      return `<div class="calc__dev-block-element">Имя элемента: ${this.elementName}</div>`;
    },
    dependencyFormulaHtml() {
      return this.dependencyFormulaDisplay?.length
        ? `<div class="calc__dev-block-element"> Формула зависимости отображения: ${this.getArrayElementsFromFormula(
            this.dependencyFormulaDisplay
          ).join(" ")}</div>`
        : "";
    },
    dependencyFormulaBeforeProcessingHtml() {
      return this.parsingFormulaVariables?.length
        ? `<div class="calc__dev-block-element">Формула зависимости отображения после обработки: ${this.parsingFormulaVariables}</div>`
        : "";
    },
    valueHtml() {
      return `<div class="calc__dev-block-element">Значение элемента: ${this.elementValue}</div>`;
    },
    infoVisibilityHtml() {
      return `<div class="calc__dev-block-element">Отображается: ${this.isVisibilityFromDependency}</div>`;
    },
    localCostHtml() {
      if ("localCost" in this) {
        return `<div class="calc__dev-block-element">Текущая стоимость: ${this?.localCost}</div>`;
      }
      return "";
    },
  },
};
