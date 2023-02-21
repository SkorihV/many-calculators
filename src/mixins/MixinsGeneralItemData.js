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
     * Иницаилизировать проверку условий зависимых цен
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
        const textLabel = `<div class="calc__dev-block-element">Заголовок элемента: ${this.label}</div>`;
        const textElementName = `<div class="calc__dev-block-element">Имя элемента: ${this.elementName}</div>`;
        const textDependencyFormula = this.dependencyFormulaDisplay?.length
          ? `<div class="calc__dev-block-element"> Формула зависимости отображения: ${this.getArrayElementsFromFormula(
              this.dependencyFormulaDisplay
            ).join(" ")}</div>`
          : "";
        const textDependencyFormulaBeforeProcessing = this
          .parsingFormulaVariables?.length
          ? `<div class="calc__dev-block-element">Формула зависимости отображения после обработки: ${this.parsingFormulaVariables}</div>`
          : "";
        const textInfoVisibility = `<div class="calc__dev-block-element">Отображается: ${this.isVisibilityFromDependency}</div>`;

        const textValue = `<div class="calc__dev-block-element">Значение элемента: ${
          this.templateName === "UiInput" || this.templateName === "UiRange"
            ? this.resultValue
            : this.templateName === "UiRadio"
            ? this.selectedValueInRadio
            : this.templateName === "UiSelect"
            ? this.currentOptionValue
            : this.templateName === "UiCheckbox"
            ? this.isLocalChecked
            : null
        }</div>`;

        let textLocalCost = "";

        if ("localCost" in this) {
          textLocalCost = `<div>Текущая стоимость: ${this?.localCost}</div>`;
        }
        return `
          <div class="calc__dev-block-wrapper">
           ${textLabel}
           ${textElementName}
           ${textDependencyFormula}
           ${textDependencyFormulaBeforeProcessing}
            
           ${textValue}
           ${textInfoVisibility}

           ${textLocalCost}
          </div>`;
      }
      return false;
    },
  },
};