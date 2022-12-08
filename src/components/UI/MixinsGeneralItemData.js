import { useBaseStore } from "@/store/piniaStore";

import { mapState } from "pinia";

export const MixinsGeneralItemData = {
  props: {
    /**
     * заголовок
     */
    label: {
      type: String,
      default: "",
    },
    /**
     * элемент не может быть пустым и требуется выбор
     */
    notEmpty: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    },

    /**
     * Исключить элемент из расчета по формуле
     */
    excludeFromCalculations: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    },
    /**
     * имя необходимое для корректной работы Label
     */
    elementName: {
      type: String,
      default: "",
    },
    parentName: {
      type: String,
      default: null,
    },
    formulaProcessingLogic: {
      type: String,
      default: "error",
    },
    /**
     * Список классов для переопределения стилей на обертке
     */
    classes: {
      type: String,
      default: null,
    },
    templateName: {
      type: String,
      default: null,
    },
  },
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
    ...mapState(useBaseStore, ["isCanShowAllTooltips", "devMode"]),
    /**
     * Существует список цен с зависимостями
     * @returns {boolean}
     */
    isDependencyPriceExist() {
      return Boolean(
        this.dependencyPrices?.filter(
          (item) => item?.enabledFormula && item?.dependencyFormulaCost?.length
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
    devModeData() {
      if (this.devMode) {
        const textLabel = `<div>Заголовок элемента: ${this.label}</div>`;
        const textElementName = `<div>Имя элемента: ${this.elementName}</div>`;
        const textDependencyFormula = this.dependencyFormulaDisplay?.length
          ? `<div> Формула зависимости отображения: ${this.getArrayElementsFromFormula(
              this.dependencyFormulaDisplay
            ).join(" ")}</div>`
          : "";
        const textDependencyFormulaBeforeProcessing = this
          .parsingFormulaVariables?.length
          ? `<div>Формула зависимости отображения после обработки: ${this.parsingFormulaVariables}</div>`
          : "";
        const textInfoVisibility = `Отображается: ${this.isVisibilityFromDependency}`;

        const textValue = `<div>Значение элемента: ${
          this.templateName === "UiInput" || this.templateName === "UiRange"
            ? this.resultValue
            : this.templateName === "UiRadio"
            ? this.changedRadio?.value
              ? this.changedRadio?.value
              : null
            : this.templateName === "UiSelect"
            ? this.currentOption?.value
            : this.templateName === "UiCheckbox"
            ? this.localValue
            : null
        }</div>`;

        let textLocalCost = "";

        if ("localCost" in this) {
          textLocalCost = `<div>Текущая стоимость: ${this?.localCost}</div>`;
        }
        return `
          <div class="dev-block">
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
