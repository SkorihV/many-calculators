<template>
  <div id="app-base-constructor-calculator">
    <div class="calc calc__wrapper" id="custom-stile">
      <template v-for="(template, index) in calculatorTemplates" :key="index">
        <ui-accordion
          v-if="template.template === 'UiAccordion'"
          :accordion-data="template"
          :label="template?.label"
          :classes="template?.classes"
          :element-name="template?.json_id || 'UiAccordion' + index"
          :dependency-formula-display="template?.dependencyFormulaDisplay"
          :template-name="template.template"
          @changedValue="changeValue"
        />
        <ui-tab
          v-else-if="template.template === 'UiTab'"
          :tab-data="template"
          :label="template?.label"
          :classes="template?.classes"
          :element-name="template?.json_id || 'UiTab' + index"
          :dependency-formula-display="template?.dependencyFormulaDisplay"
          :max-width="template?.maxWidth"
          :template-name="template.template"
          @changedValue="changeValue"
        />
        <ui-bisection
          v-else-if="template.template === 'UiBisection'"
          :template-data="template"
          :label="template?.label"
          :width-left-side="template?.widthLeftSide"
          :classes="template?.classes"
          :element-name="template?.json_id || 'UiBisection' + index"
          :dependency-formula-display="template?.dependencyFormulaDisplay"
          :dependency-formula-display-left-side="
            template?.dependencyFormulaDisplayLeftSide
          "
          :dependency-formula-display-right-side="
            template?.dependencyFormulaDisplayRightSide
          "
          :template-name="template.template"
          @changedValue="changeValue"
        />
        <ui-duplicator
          v-else-if="template.template === 'UiDuplicator'"
          :label="template?.label"
          :element-name="
            template?.elementName?.length
              ? template?.elementName
              : template?.json_id || 'UiDuplicator' + index
          "
          :classes="template?.classes"
          :dependency-formula-display="template?.dependencyFormulaDisplay"
          :form-output-method="template?.formOutputMethod"
          :exclude-from-calculations="template?.excludeFromCalculations"
          :duplicate-template="template"
          :formula-processing-logic="template?.formulaProcessingLogic"
          :template-name="template.template"
          @changedValue="changeValue"
        />
        <templates-wrapper
          v-else
          :template="template"
          :index="index"
          @changedValue="changeValue"
        />
      </template>
      <div v-if="showErrorTextBlock" class="calc__error-block">
        Возможно, некоторые поля не заполнены или заполнены не корректно!
      </div>
      <div v-if="showErrorSummaBlock" class="calc__error-block">
        Есть ошибка в расчетах конечной суммы. Некоторые значения данных формулы
        не выбраны.
      </div>
      <div
        class="calc__show-result-btn"
        @click="calculateResult"
        v-if="showResultBtn"
      >
        <icon-element
          v-if="outOptions?.resultOptions?.iconSettings?.image?.filename && outOptions?.resultOptions?.iconSettings?.location === 'leftSide'"
          :alt="outOptions.resultOptions.titleButton"
          :icon-settings="outOptions?.resultOptions?.iconSettings"
        />
        {{ outOptions.resultOptions.titleButton }}
        <icon-element
          v-if="outOptions?.resultOptions?.iconSettings?.image?.filename && outOptions?.resultOptions?.iconSettings?.location === 'rightSide'"
          :alt="outOptions.resultOptions.titleButton"
          :icon-settings="outOptions?.resultOptions?.iconSettings"
        />
      </div>
      <error-names-templates
        v-if="devMode"
        :templates="calculatorTemplates"
        :init-template="devMode"
        :formula="formula?.length && isUseFormula ? formula : ''"
      />
      <div v-if="showResultDataForBlock && initTeleport">
        <p v-if="outOptions?.resultOptions?.title?.length">
          {{ outOptions.resultOptions.title }}
        </p>
        <p v-if="outOptions?.resultOptions?.subtitle?.length">
          {{ outOptions.resultOptions.subtitle }}
        </p>
        <pre class="resultDataBlock" v-html="finalTextForOutput"></pre>
      </div>

      <div id="prompt-text-element"></div>
    </div>
    <teleport v-if="initTeleport && submitResult" to="#teleport">
      {{ finalTextForOutputForTeleport }}
    </teleport>
  </div>
  <div
    class="dev-mode"
    v-if="devMode && showInsideElementStatus"
    v-html="devModeData"
  ></div>
</template>

<script>
import UiAccordion from "@/components/UI/UiAccordion";
import UiTab from "@/components/UI/UiTab";
import UiDuplicator from "@/components/UI/UiDuplicator";
import TemplatesWrapper from "@/components/UI/TemplatesWrapper";
import UiBisection from "@/components/UI/UiBisection";
import ErrorNamesTemplates from "@/components/UI/ErrorNamesTemplates";
import { MixinsUtilityServices } from "@/components/UI/MixinsUtilityServices";

import { useBaseStore } from "@/store/piniaStore";
import { mapState } from "pinia";
import IconElement from "@/components/UI/Icon-element.vue";

export default {
  name: "TheBasicCalculatorConstructor",
  mixins: [MixinsUtilityServices],
  components: {
    IconElement,
    TemplatesWrapper,
    UiAccordion,
    UiTab,
    UiBisection,
    UiDuplicator,
    ErrorNamesTemplates,
  },
  async mounted() {
    const isGlobal = window.location.hostname !== "localhost";
    const localPath = "http://localhost:3000/test-data";
    // const localPath = "http://localhost:3000/test-dependency";
    if (!isGlobal) {
      await fetch(localPath)
        .then((response) => response.json())
        .then((data) => {
          this.outData = data;
        });
      await fetch("http://localhost:3000/calculator-options")
        .then((response) => response.json())
        .then((data) => {
          this.outOptions = data;
        });
    } else {
      this.outData.calculatorTemplates = JSON.parse(
        JSON.stringify(window?.calculatorTemplates)
      );
      this.outOptions = JSON.parse(JSON.stringify(window?.calculatorOptions));
    }
    this.calculatorTemplates = this.outData?.calculatorTemplates
      ? this.outData?.calculatorTemplates
      : [];
    this.formula = this.outOptions?.formula?.length
      ? this.outOptions?.formula
      : "";

    this.isUseFormula = this.outOptions?.computedMethod === "formula";
    this.displayResultData = this.outOptions?.computedMethod !== "no";

    this.mistake = this.outOptions?.methodProcessingMistakes
      ? this.outOptions?.methodProcessingMistakes
      : "no";
    this.currency =
      this?.outOptions !== null ? this?.outOptions?.currency : "руб";
    this.initEnabledSendForm =
      this?.outOptions?.methodProcessingMistakes === "useAutomatic";
    this.tryToggleDevMode(Boolean(this.outOptions?.devMode));
    this.showResultDataForBlock = this.outOptions?.resultOptions
      ? this.outOptions?.resultOptions.showResultDataForBlock
      : false;
    this.outOptions.resultOptions.titleButton = this.outOptions?.resultOptions?.titleButton?.length ? this.outOptions?.resultOptions?.titleButton : "Рассчитать"

    delete window?.calculatorTemplates;
    delete window?.calculatorOptions;
  },
  data() {
    return {
      outData: {}, // внешние данные с шаблонами элементов калькулятора
      outOptions: {}, // внешние данные с общими настройками калькулятора
      calculatorTemplates: [], // список шаблонов элементов
      formula: "", // формула для кастомного расчета
      isUseFormula: false, // использовать формулу
      displayResultData: false, // включить работу формул и вывод данных
      mistake: "no",
      currency: "руб",
      submitResult: null,
      initEnabledSendForm: false,
      showResultDataForBlock: false, // выводить результаты выбора и расчета вне формы
      eventNotShowTooltips: ["delete", "mounted", "timer", "dependency"], // События при которых не должно срабатывать отображение ошибок
    };
  },
  methods: {
    changeValue(data) {
      if (typeof data !== "object") {
        return null;
      }
      const { name, type, eventType } = data;
      if (eventType === "delete") {
        this.hiddenElementOnResults(name);
        this.checkEnabledResultButton();
        return false;
      }

      this.tryAddResultElement(data);

      if (type === "duplicator") {
        this.tryModifiedResultElement({
          elementName: name,
          modifiedFieldName: "insertedTemplates",
          newData: data.insertedTemplates,
        });
      }

      if (
        !this.eventNotShowTooltips.includes(eventType) &&
        this.mistake === "useAutomatic"
      ) {
        this.showAllTooltipsOn();
      }

      this.checkEnabledResultButton();
    },
    calculateResult() {
      this.showAllTooltipsOn();
      this.initEnabledSendForm = true;
      this.checkEnabledResultButton();
    },
    /**
     * Разрешаем отправку формы
     */
    checkEnabledResultButton() {
      const textAreaTeleportElement = document.querySelector("#teleport");
      if (textAreaTeleportElement) {
        textAreaTeleportElement.readOnly = true;
      }

      if (!this.submitResult) {
        this.submitResult = document.querySelector(
          "#App + .tpl-anketa button[type=submit]"
        );
      }

      if (this.isEnabledSendForm && this.submitResult) {
        this.submitResult.disabled = false;
        this.submitResult.style.opacity = 1;
      } else if (!this.isEnabledSendForm && this.submitResult) {
        this.submitResult.disabled = true;
        this.submitResult.style.opacity = 0.5;
      }
    },

    /**
     * Скрыть поле с данными
     * @param name
     */
    hiddenElementOnResults(name) {
      if (name in this.getAllResultsElements) {
        this.tryModifiedResultElement({
          elementName: name,
          modifiedFieldName: "isShow",
          newData: false,
        });
      }
    },
    parseResultValueObjectItem(item) {
      let result = "";
      if (item.formOutputMethod && item.displayValue !== null && item.isShow) {
        result += "\n" + item.label;

        if (
          item.formOutputMethod === "value" ||
          item.formOutputMethod === "valueSumm"
        ) {
          const unit = item.unit ? item.unit : "";
          result += " - " + item.displayValue + " " + unit;
        }
        if (
          item.cost !== null &&
          (item.formOutputMethod === "summ" ||
            item.formOutputMethod === "valueSumm")
        ) {
          let sum = item?.cost?.toString();
          result += " - " + sum + " " + this.currency;
        }
        result += "\n";
      }
      return result;
    },
  },
  watch: {
    isCheckedGlobalValidation() {
      this.checkEnabledResultButton();
    },
  },
  computed: {
    ...mapState(useBaseStore, [
      "showAllTooltipsOn",
      "tryAddResultElement",
      "tryModifiedResultElement",
      "tryToggleDevMode",
      "isCanShowAllTooltips",
      "isCheckedGlobalValidation",
      "validationList",
      "globalDependenciesList",
      "getNameReserveVariable",
      "getAllResultsElements",
      "devMode",
      "showInsideElementStatus",
      "getImageDir",
    ]),
    /**
     * Данные которые подходят для вывода или расчета
     * @returns {{length}|unknown[]|*[]}
     */
    baseDataForCalculate() {
      return Object.values(this.getAllResultsElements);
    },

    /**
     * Разбиваем полученную формулу на массив с переменными и знаками.
     * Избавляемся от пустых элементов.
     * @returns {*[]|*}
     */
    variablesInFormula() {
      if (this.formula?.length) {
        return this.getArrayElementsFromFormula(this.formula);
      }
      return [];
    },
    /**
     * Список переменных не используемых в формуле
     * @returns {[]}
     */
    freeVariablesOutsideFormula() {
      return this.getListVariablesMissedInFormula(
        this.baseDataForCalculate,
        this.variablesInFormula
      );
    },

    /**
     * сумма всех не используемых в формуле переменных
     * @returns {*}
     */
    summaFreeVariables() {
      return this.getSummaFreeVariablesInFormula(
        this.freeVariablesOutsideFormula
      );
    },
    /**
     * Список переменных из формулы вместе с данными
     * @returns {*}
     */
    dataListVariablesOnFormula() {
      return this.variablesInFormula?.map((item) => {
        if (item === this.getNameReserveVariable) {
          return this.getProxyFreeVariables(this.summaFreeVariables);
        } else {
          const data = this.baseDataForCalculate.filter(
            (itemInner) => itemInner.name === item
          );
          return data.length ? data[0] : item;
        }
      });
    },

    /**
     * Отдает формулу с подставленными значениями
     * @returns {*}
     */
    resultTextForComputed() {
      let resultString = this.parsingDataInFormulaOnSumma(
        this.processingArrayOnFormulaProcessingLogic(
          this.dataListVariablesOnFormula
        )
      );
      return resultString?.replace(
        /[\+\-\*\/] *\( *\)|\( *\) *[\+\-\*\/]/g,
        ""
      );
    },

    /**
     *  рассчитываем формулу через eval
     * @returns {boolean|any}
     */
    combinedFormulaDataTogether() {
      try {
        return eval(this.resultTextForComputed);
      } catch (e) {
        if (this.devMode) {
          console.error(e.message, this.resultTextForComputed);
        }
        return false;
      }
    },

    /**
     * Данные нужные только для вывода в форму
     * @returns {*[]}
     */
    dataForOutputText() {
      return this.baseDataForCalculate.filter(
        (item) => item.formOutputMethod !== "no"
      );
    },
    /**
     * Текст со всеми полями которые должны отображаться в форме
     * @returns {string}
     */
    resultTextDataForForm() {
      let result = "";
      this.dataForOutputText.forEach((item) => {
        if (item.type === "duplicator") {
          if (Object.keys(item?.insertedTemplates) && item.isShow) {
            Object.values(item?.insertedTemplates).forEach((duplicator) => {
              if (Object.keys(duplicator?.insertedTemplates)) {
                if (this.parseResultValueObjectItem(duplicator)?.length) {
                  result += "<p>------------------------------</p>";
                  result += this.parseResultValueObjectItem(duplicator);
                }
                Object.values(duplicator?.insertedTemplates).forEach(
                  (templateInDuplicator) => {
                    if (
                      this.parseResultValueObjectItem(templateInDuplicator)
                        ?.length
                    ) {
                      result +=
                        "<p>" +
                        this.parseResultValueObjectItem(templateInDuplicator) +
                        "</p>";
                    }
                  }
                );
                result += "<p>------------------------------</p>";
              }
            });
          }
        } else {
          if (this.parseResultValueObjectItem(item)?.length) {
            result += "<p>" + this.parseResultValueObjectItem(item) + "</p>";
          }
        }
      });
      return result;
    },

    /**
     * Общая сумма расчета
     * @returns {*|boolean}
     */
    finalSummaForOutput() {
      if (!this.displayResultData) {
        return null;
      }

      if (this.isUseFormula && this.formula?.length) {
        return this.combinedFormulaDataTogether;
      } else {
        return this.baseDataForCalculate.reduce((sum, item) => {
          if (item.cost !== null && !item.excludeFromCalculations) {
            return sum + parseFloat(item.cost);
          }
          return sum + 0;
        }, 0);
      }
    },
    /**
     * Текст для вывода в форму
     * @returns {string}
     */
    finalTextForOutput() {
      let result = this.resultTextDataForForm;
      if (this.finalSummaForOutput === null) {
        return result;
      }

      if (this.finalSummaForOutput === false) {
        result += "Есть ошибка в расчетах!";
      } else {
        result +=
          "" +
          this.outOptions?.resultOptions?.titleSumma +
          this.finalSummaForOutput +
          " " +
          this.currency;
      }
      return result;
    },

    finalTextForOutputForTeleport() {
      return this.finalTextForOutput.replace(/<p>|<\/p\>/g, "");
    },

    /**
     * Отобразить блок с текстом о наличии ошибок,
     * если ошибки есть и глобально разрешено их отображение
     * @returns {false|boolean}
     */
    showErrorTextBlock() {
      return this.isCheckedGlobalValidation && this.isCanShowAllTooltips;
    },
    /**
     * Добавить данные в форму если нет ошибок валидации
     * @returns {boolean}
     */
    initTeleport() {
      return (
        !this.isCheckedGlobalValidation &&
        this.initEnabledSendForm &&
        this.isCanShowAllTooltips
      );
    },
    isEnabledSendForm() {
      return (
        this.initEnabledSendForm &&
        this.finalTextForOutput?.length &&
        this.isCanShowAllTooltips &&
        !this.isCheckedGlobalValidation
      );
    },
    showResultBtn() {
      return this.mistake === "useButton";
    },
    showErrorSummaBlock() {
      return (
        (this.finalSummaForOutput === null ||
          this.finalSummaForOutput === false) &&
        this.isCanShowAllTooltips &&
        this.displayResultData
      );
    },
    devModeData() {
      const textFormula = this.variablesInFormula?.length
        ? `<div>Формула расчета: ${this.variablesInFormula.join(" ")}</div>`
        : "";
      const textFormulaVariables = this.formula?.length
        ? `<div>Формула с подставленными значениями: ${this.resultTextForComputed}</div>`
        : "";
      return `
      ${textFormula}
      ${textFormulaVariables}
      `;
    },
  },
};
</script>

<style lang="scss">
//$calc-color-text : var(--calc-color-text);
//
//$calc-color-btn : var(--calc-color-btn);
//$calc-color-btn-text : var(--calc-color-btn-text);
//
//$calc-color-btn-hover : var(--calc-color-btn-hover);
//$calc-color-btn-text-hover : var(--calc-color-btn-text-hover);
//
//$calc-color-btn-checked : var(--calc-color-btn-checked);
//$calc-color-btn-checked-text : var(--calc-color-btn-checked-text);
//
//$calc-color-danger : var(--calc-color-danger);
//$calc-color-danger-text : var(--calc-color-danger-text);
//
//$calc-color-more : var(--calc-color-more);

$c-color-text-default_dark: #000000;
$c-color-text-default_light: #ffffff;

$c-color-text-medium: #5e5e5e;
$c-color-text-dim: #A2A2A2;
$c-color-text-white-selected: #ffffff;
$c-color-text-white-hover: #ffffff;
$c-color-text-orange: #ff6531;

$c-color-text-error: #e80000;

$c-border-default: #A2A2A2;
$c-border-hover: #ff6531;
$c-border-selected: #ff6531;
$c-border-error: #e80000;

$c-arrow-default: #A2A2A2;
$c-arrow-selected: #ff6531;
$c-arrow-error: #e80000;

$c-background-default_light: #F5F5F5;
$c-background-default_dark: #A2A2A2;
$c-background-hover-gray: #A2A2A2;

$c-background-hover-orange: #ff6531;
$c-background-selected: #ff6531;

$c-background-error: #e80000;

@mixin style-border-radius {
  border-radius: 9px;
}

@mixin style-label-main {
  font-size: 17px;
  line-height: 20px;
  color: $c-color-text-default_dark;
}

@mixin style-label-sub {
  font-size: 12px;
  line-height: 14px;
  color: $c-color-text-default_dark;
}

@mixin transition {
  transition: all 0.2s ease-in-out;
}

@mixin input {
}
@mixin radio {
}
@mixin select {
}
@mixin range {
}
@mixin checkbox {
}
@mixin image {
}
@mixin tab {
}
@mixin accordion {
}
@mixin error {
}
@mixin prompt {
}

$calc-color-text: #464657;
$calc-color-btn: #464657;
$calc-color-btn-text: #ffffff;

$calc-color-btn-hover: #6f6fdc;
$calc-color-btn-text-hover: white;

$calc-color-btn-checked: #ff7044;
$calc-color-btn-checked-text: #464657;

$calc-color-danger: red;
$calc-color-danger-text: white;

$calc-color-more: yellow;

$border-radius: 4px;


* {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: 0;
}

.main-wrapper {
  max-width: 980px;
  margin: 0 auto;
  background-color: #ffffff;
  padding: 3px;
  border: 1px solid black;
}

.calc__form .tpl-anketa {
  display: flex;
  flex-direction: column;
}

.calc {
  position: relative;
  * {
    margin: 0;
    font-size: 15px;
    text-align: center;
    color: $c-color-text-default_dark;
    font-family: Arial, Helvetica, sans-serif;
    box-sizing: border-box;
  }

  &__wrapper {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    &-group-data {
      margin: 0 10px 10px;
      width: calc(100% - 20px);
      position: relative;
    }
  }
  &__error-block {
    width: calc(100% - 40px);
    display: flex;
    justify-content: center;
    padding: 20px;
    background-color: $calc-color-danger;
    color: $calc-color-danger-text;
    margin: 20px;
  }
  &__show-result-btn {
    padding: 21px 70px;
    background-color: $c-background-selected;
    color: $c-color-text-white-selected;
    align-self: center;
    display: flex;
    gap: 20px;
    align-items: center;
    font-weight: 900;
    font-size: 20px;
    line-height: 23px;
    text-transform: uppercase;
    cursor: pointer;
    @include style-border-radius;
    &:hover {
      background-color: $c-background-hover-gray;
    }
  }
  //--------Стили input text-----
  &__input {
    @include input;
    &-wrapper {
      &.is-stretch {
        flex: 1 1 100%;
      }
      &-data {
        display: flex;
        align-items: center;
        position: relative;
        gap: 2px;
      }
    }

    &-label {
      display: flex;
      justify-content: space-between;
      align-items: center;

      &.is-column {
        flex-direction: column;
        align-items: flex-start;
      }
      @media all and (max-width: 480px) {
        flex-direction: column;
        align-items: start;
        justify-content: center;
      }
      &-text {
        @include style-label-main;
        display: flex;
        margin-right: 30px;
        padding: 5px 0;
        gap: 2px;
        text-align: start;
      }
    }

    &-item {
      font-size: 16px;
      line-height: 20px;
      padding: 20px 35px;
      max-width: 304px;
      background: $c-background-default_light;
      border: 1px solid $c-border-default;
      @include style-border-radius;
      &:focus,
      &:hover {
        outline-color: $c-border-selected;
        border-color: $c-border-selected;
      }
      &.is-number {
        font-weight: 700;
        max-width: 150px;
        padding: 20px 15px;
      }

      &.error {
        outline-color: $c-border-error;
        border-color: $c-border-error;
      }
    }
    &-buttons {
      &-plus,
      &-minus {
        width: 26px;
        height: 26px;
        display: flex;
        justify-content: center;
        align-items: center;
        color: $c-color-text-orange;
        font-size: 28px;
        line-height: 26px;
        font-weight: 600;
        -moz-user-select: none;
        -webkit-user-select: none;
        user-select: none;
        &:hover {
          cursor: pointer;
        }
        &.disabled {
          color: $c-color-text-dim;
          &:hover {
            cursor: not-allowed;
          }
        }
      }
    }
    &-unit {
      margin-left: 5px;
      font-weight: 700;
      font-size: 17px;
      line-height: 20px;
    }
  }
  //--------Стили input range-----

  &__range {
    @include range;
    &-wrapper {
      display: flex;
      flex-direction: column;
      width: 100%;
      position: relative;
      min-height: 60px;
    }
    &-label {
      @include style-label-main;
      display: flex;
      margin-bottom: 10px;
      gap: 2px;
      text-align: start;
    }
    &-item-left-side {
        width: 100%;
        display: flex;
        flex-direction: column;
        position: relative;
    }

    &-unit {
      font-weight: 700;
      font-size: 17px;
      line-height: 20px;
    }
    &-item {
      &-wrapper {
        display: flex;
        align-items: baseline;
        gap: 32px;
      }

      -webkit-appearance: none;
      appearance: none;
      background: $c-background-default_light;
      border-radius: 90px;
      cursor: pointer;
      width: 100%;
      &:focus {
        outline: none;
      }

      &::-webkit-slider-runnable-track {
        background-color: $c-background-default_light;
        height: 8px;
      }

      &::-moz-range-track {
        background-color: $c-background-default_light;
        height: 8px;
      }

      &::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        height: 24px;
        width: 24px;
        border-radius: 50%;
        background-color: $c-background-selected;
        border: 4px solid $c-background-default_light;
        box-shadow: 0 7px 11px -4px $c-border-default;
        margin-top: -10px;
      }

      &::-moz-range-thumb {
        -webkit-appearance: none;
        appearance: none;
        height: 24px;
        width: 24px;
        border-radius: 50%;
        background-color: $c-background-selected;
        border: 5px solid $c-background-default_light;
        box-shadow: 0 7px 11px -4px $c-border-default;
        margin-top: -16px;
      }
    }

    &-steps {
      &-wrapper {
        display: flex;
        align-items: center;
        height: 30px;
        position: relative;
        margin-top: 17px;
      }
      &-item {
        position: absolute;
        cursor: pointer;
        font-weight: 700;
        font-size: 14px;
        line-height: 16px;
        color: $c-color-text-dim;
        &:after {
          position: absolute;
          content: "";
          display: block;
          width: 1px;
          z-index: 10;
          background: $c-color-text-dim;
          left: 50%;
          transform: translateX(-50%);
          height: 10px;
          bottom: calc(100% + 7px);
        }
        &_selected {
          color: $c-color-text-default_dark;
          &:after {
            width: 2px;
          }
        }
      }
    }

    &-current {
      &-wrapper {
        display: flex;
        align-items: center;
        margin-left: auto;
        gap: 5px;
      }

      &-static {
        color: $c-color-text-default_dark;
        background-color: $c-background-default_light;
        border: 1px solid $c-border-default;
        min-width: 26px;
        min-height: 26px;
        border-radius: 50%;
        position: absolute;
        z-index: 15;
        display: flex;
        justify-content: center;
        align-items: center;
        font-weight: 700;
        font-size: 14px;
        line-height: 16px;
        top: 15px;
      }

      &-dynamic {
        font-weight: 700;
        font-size: 16px;
        line-height: 20px;
        padding: 20px 30px;
        max-width: 90px;
        right: 0;
        @include style-border-radius;
        border: 1px solid $c-border-default;
        &:hover,
        &:focus-visible {
          border: 1px solid $c-border-hover;
          outline: none;
        }
      }
    }
  }

  //---------Стили select-----

  &__select {
    @include select;
    &-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
      position: relative;
      width: 100%;
      &.is-column {
        flex-direction: column;
        align-items: flex-start;
      }
      &.is-open {
        .calc__select-arrow {
          border-color: $c-arrow-selected;
          transform: translateY(-50%) rotate(-135deg);
          -webkit-transform: translateY(-50%) rotate(-135deg);
        }
        .calc__select-change-wrapper {
          border: 1px solid $c-border-hover;
          border-bottom: transparent;
          border-bottom-left-radius: 0;
          border-bottom-right-radius: 0;

        }
      }

      @media all and (max-width: 480px) {
        flex-direction: column;
        align-items: flex-start;
      }
    }

    &-label {
      display: flex;
      flex: 1 1 100%;
      @include style-label-main;
      gap: 2px;
      text-align: start;
    }

    &-change {
      &-wrapper {
        cursor: pointer;
        font-size: 15px;
        line-height: 16px;
        position: relative;
        flex: 1 1 100%;
        @include style-border-radius;
        border: 1px solid $c-border-default;
        background-color: $c-background-default_light;
        &:hover {
          border: 1px solid $c-border-hover;
          .calc__select-arrow {
            border-color: $c-arrow-selected;
          }
        }
        &.error {
          border-color: $c-border-error;
          .calc__select-change-item {
            color: $c-color-text-error;

          }
          .calc__select-arrow {
            border-color: $c-arrow-error;
          }
        }
      }
      &-item {
        color: $c-color-text-default_dark;
        padding: 20px 40px;
        font-weight: 400;
        font-size: 16px;
        line-height: 20px;
        gap: 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .calc__select-arrow {
            width: 10px;
            height: 10px;
            border: solid $c-arrow-default;
            border-width: 0 2px 2px 0;
            display: inline-block;
            margin-left: auto;
            flex: 0 0 auto;
            transform: translateY(-50%) rotate(45deg);
            -webkit-transform: translateY(-50%) rotate(45deg);
        }
      }
    }
    &-option {
      &-wrapper {
        display: flex;
        flex-direction: column;
        position: absolute;
        top: calc(100% - 2px);
        border-bottom-left-radius: 9px;
        border-bottom-right-radius: 9px;
        z-index: 10;
        width: 100%;

        border-left: 1px solid $c-border-selected;
        border-right: 1px solid $c-border-selected;
        border-bottom: 1px solid $c-border-selected;
        .calc__select-image-wrapper {
          margin: 5px;
        }
      }
      &-item {
        background-color: $c-background-default_light;
        display: flex;
        align-items: center;
        gap: 20px;
        text-align: start;
        padding: 10px 40px;

        &-text {
          font-weight: 400;
          font-size: 16px;
          line-height: 20px;
        }
        &:hover {
          background-color: $c-background-hover-orange;
          .calc__select-option-item-text {
            color: $c-color-text-white-hover;
          }
        }
        &:last-child {
          border-bottom-right-radius: 9px;
          border-bottom-left-radius: 9px;
        }
      }
    }
  }

  //-----------------Радио кнопки ---------------
  &__radio {
    @include radio;
    &-wrapper {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      &-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      &.column {
        flex-direction: column;
        align-items: flex-start;
        .calc__radio-wrapper-buttons {
          flex-direction: column;
          gap: 8px;
        }
      }

      &.base {
        .calc__radio-indicator {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 1px solid $c-border-default;
          position: relative;

          &:after {
            content: "";
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            border-radius: 50%;
            width: 10px;
            height: 10px;
          }
        }
      }
    }
    &-title {
      @include style-label-main;
      display: flex;
      margin-bottom: 8px;
      gap: 2px;
      flex-shrink: 1;
      text-align: start;
    }

    &-label {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 21px 35px;
      background-color: $c-background-default_light;
      @include style-border-radius;
      border: 1px solid $c-border-default;
      font-weight: 700;
      cursor: pointer;
      @include transition;
      gap: 8px;
      text-align: start;
      &:hover {
        background-color: $c-background-hover-orange;
        .calc__radio-name, .calc__radio-subname {
          color: $c-color-text-white-hover;
        }
        .calc__radio-indicator {
          border-color: $c-color-text-white-hover;
          &:after {
            background-color: $c-color-text-white-hover;
          }
        }
      }
      &.checked {
        background-color: $c-background-hover-orange;
        .calc__radio-name,
        .calc__radio-subname {
          color: $c-color-text-white-selected;
        }
        .calc__radio-indicator {
          border-color: $c-color-text-white-selected;
          &:after {
            background-color: $c-color-text-white-selected;
          }
        }
      }

      &.error {
        border-color: $c-border-error;
       .calc__radio-text {
          color: $c-color-text-error;
        }
        .calc__radio-indicator {
          border-color: $c-border-error;
          &:after {
            background-color: $c-border-error;
          }
        }
      }
    }
    &-text {
      display: flex;
      align-items: flex-start;
      flex-direction: column;
    }
    &-name {
      font-size: 16px;
      line-height: 20px;
    }
    &-subname {
      @include style-label-sub;
    }
  }

  //--------Стили чекбокса --------------

  &__checkbox {
    @include checkbox;
    &-wrapper {
      display: flex;
      gap: 8px;
      cursor: pointer;
      align-items: center;
      flex-wrap: wrap;
      @media all and (max-width: 480px) {
        flex-direction: column;
        align-items: flex-start;
      }
    }
    &-label {
      @include style-label-main;
      display: flex;
      align-items: center;
      gap: 2px;
      @include transition;
      text-align: start;
      &.button {
        border: 1px solid $c-border-default;
        background-color: $c-background-default_light;
        padding: 20px 35px;
        font-weight: 700;
        @include style-border-radius;
        &:hover {
          background-color: $c-background-selected;
          color: $c-color-text-white-selected;
        }
        &.checked {
          background-color: $c-background-selected;
          color: $c-color-text-white-selected;
        }
        &.error {
          color: $c-color-text-error;
          border-color: $c-border-error;
        }
      }
    }
    &-label_second {
      @include style-label-main;
      text-align: start;
    }
    &-element {
      @include transition;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 1px solid $c-border-default;
      position: relative;
      &:after {
        content: "";
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        border-radius: 50%;
        width: 10px;
        height: 10px;
      }
      &.checked {
        @include transition;
        border-color: $c-border-selected;
        &:after {
          @include transition;
          background-color: $c-border-selected;
        }
      }
      &:hover {
        @include transition;
        border-color: $c-border-selected;
        &:after {
          @include transition;
          background-color: $c-border-selected;
        }
      }
      &.error {
        @include transition;
        border-color: $c-border-error;
        &:after {
          @include transition;
          background-color: $c-border-error;
        }
      }
    }

    &-element_switcher {
      display: inline-block;
      @include transition;
      height: 26px;
      width: 50px;
      position: relative;
      border-radius: 90px;
      background: $c-background-default_light;
      border: 1px solid $c-border-default;

      &:not(.checked):before,
      &.checked:after {
        @include transition;
        content: "";
        display: inline-block;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        position: absolute;
      }

      &:not(.checked):before {
        border: 1px solid $c-border-default;
        background-color: $c-background-default_light;
        left: 5px;
        top: 50%;
        transform: translateY(-50%);
      }

      &.checked:after {
        border: 1px solid $c-border-default;
        background-color: $c-background-selected;
        right: 5px;
        top: 50%;
        transform: translateY(-50%);
      }

      &.vertical {
        height: 50px;
        width: 26px;

        &:not(.checked):before {
          top: 5px;
          left: 50%;
          transform: translate(-50%, 0);
        }

        &.checked:after {
          right: 0;
          bottom: 5px;
          left: 50%;
          transform: translate(-50%, 0);
        }
      }
      &.error {
        border-color: $c-border-error;
        &:not(.checked):before {
          border-color: $c-border-error;
        }
      }
    }
  }

  //-------всплывающая подсказка ------
  &__prompt {
    @include prompt;
    &-wrapper {
      margin-left: 5px;
    }

    &-button {
      cursor: pointer;
      width: 20px;
      height: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: $c-background-selected;
      color: $c-color-text-white-selected;
      border: 1px solid $c-border-default;
      border-radius: 50%;
      font-weight: 600;
      line-height: 18px;
      &:hover {
        background-color: $c-background-default_light;
        color: $c-color-text-orange;
        border-color: $c-border-hover;
      }
    }
  }
  .prompt {
    &-wrapper {
      z-index: 100;
      position: absolute;
      display: flex;
      justify-content: center;
      align-items: center;
      left: 0;
      right: 0;
      overflow: hidden;
      padding-bottom: 20px;
      &.prompt-enter-active,
      &.prompt-leave-active {
        transition: all 0.3s ease;
        opacity: 1;
        max-height: 80vh;
        transform: scale(1);
      }

      &.prompt-enter-from,
      &.prompt-leave-to {
        transition: all 0.3s ease;
        opacity: 0;
        max-height: 0;
        transform: scale(0.8);
      }
    }

    &-content {
      background-color: white;
      padding: 13px;
      max-width: 80%;
      overflow-y: auto;
      border: 1px solid $c-border-selected;
      @include style-border-radius;
      box-shadow: 0 4px 10px $c-border-selected;
    }
  }

  // tooltip
  &__tooltip {
    &-wrapper {
      display: flex;
      position: absolute;
      border-color: $c-border-error;
      z-index: 100;
      padding: 2px;
      box-shadow: 0 0 3px 0 $c-border-error;
      bottom: calc(100% + 10px);
      left: 50%;
      transform: translateX(-50%);
      background-color: $c-background-default_light;

      &.isLeft {
        left: auto;
        right: 0;
        transform: none;
      }
      &.isFlex {
        display: flex;
      }

      &.isRight {
        left: 0;
        right: auto;
        transform: none;
      }

      &.tooltip-transition-enter-active {
        transition: all 0.3s ease-in-out;
      }

      &.tooltip-transition-leave-to,
      &.tooltip-transition-enter-from {
        opacity: 0;
        transform: perspective(1000px) translateX(-50%) rotateX(-360deg)
          scale(0.1);
        &.isLeft,
        &.isRight {
          transform: perspective(1000px) rotateX(-360deg);
        }
      }
      &.tooltip-transition-leave-from,
      &.tooltip-transition-enter-to {
        opacity: 1;
        transform: perspective(1000px) translateX(-50%) rotateX(-360deg)
          scale(1.1);

        &.isLeft,
        &.isRight {
          transform: perspective(1000px) rotateX(-360deg);
        }
      }
    }
    &-decor {
      content: "";
      width: 20px;
      height: 20px;
      background-color: white;
      position: absolute;
      border-radius: 4px;
      z-index: -1;
      right: calc(50% - 10px);
      top: calc(100% - 12px);
      transform: translateX(-50%) rotate(45deg);
      border-bottom: 1px solid $c-border-error;
      border-right: 1px solid $c-border-error;
      display: block;
    }
    &-text {
      display: flex;
      color: $c-color-text-error;
      @include style-border-radius;
      justify-content: center;
      min-width: 300px;
    }
  }

  //---------------аккордеон----------------
  &__accordion {
    @include accordion;
    &-main-label {
      @include style-label-main;
      display: flex;
      margin-bottom: 8px;
    }
    &-wrapper {
      display: flex;
      flex-direction: column;
      width: calc(100% - 20px);
      margin: 0 10px 10px;
    }
    &-item {
      &-label {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 19px 6px 21px 20px;
        min-height: 60px;
        margin-bottom: 11px;
        background-color: $c-background-default_light;
        border: 1px solid $c-border-default;
        cursor: pointer;
        @include style-border-radius;
        @include transition;
        text-align: start;
        &.isOpen {
          margin-bottom: 0;
          .calc__accordion-item-label-sub,
          .calc__accordion-item-label-main {
            color: $c-color-text-orange;
          }
          border-color: $c-border-selected;
          border-bottom-color: transparent;
          border-bottom-left-radius: 0;
          border-bottom-right-radius: 0;
        }
        &:hover {
          background-color: $c-background-hover-gray;
          .calc__accordion-item-label-sub,
          .calc__accordion-item-label-main {
            color: $c-color-text-white-hover;
          }
        }
        &.isError {
          border-color: $c-border-error;
          .calc__accordion-item-label-main {
            color: $c-color-text-error;
          }
        }

        &-wrapper {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        &-text {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        &-main {
          @include style-label-main;
          font-weight: 700;
        }

        &-sub {
          @include style-label-sub;
        }

      }
      &-content {
        margin-top: -2px;
        width: 100%;
        border: 1px solid $c-border-selected;
        border-bottom-left-radius: 9px;
        border-bottom-right-radius: 9px;
        border-top-color: transparent;
        margin-bottom: 10px;
        position: relative;
        &-wrapper {
          .calc__wrapper-group-data {
            padding-left: 20px;
            padding-right: 20px;
            margin: 0 0 10px 0;
            &:first-child {
              padding-top: 20px;
            }
            &:last-child {
              padding-bottom: 20px;
            }
          }
        }

      }
      &-plus,
      &-minus {
        position: relative;
        width: 24px;
        height: 20px;
        display: flex;
      }
      &-plus:before,
      &-minus:before {
        font-size: 24px;
        font-weight: 600;
        position: absolute;
        color: $c-color-text-default_dark;
        border-radius: 50%;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        display: flex;
        justify-content: center;
        align-items: center;
      }

      &-plus:before {
        content: "+";
      }

      &-minus:before {
        content: "-";
      }
    }
  }

  //---------------------табы-----------------
  &__tab {
    @include tab;
    &-main-label {
      @include style-label-main;
      display: flex;
      margin-bottom: 8px;
    }
    &-wrapper {
      display: flex;
      justify-content: flex-start;
      align-items: start;
      flex-direction: column;
      flex-wrap: wrap;
      width: calc(100% - 20px);
      margin: 10px;
    }
    &-item {
      &-label {
        @include style-border-radius;
        background-color: $c-background-default_light;
        border: 1px solid $c-border-default;
        display: flex;
        align-items: center;
        padding: 19px 54px;
        cursor: pointer;
        gap: 20px;
        &:hover {
          background-color: $c-background-hover-gray;
          border-color: $c-border-hover;
          .calc__tab-item-label-main,
          .calc__tab-item-label-sub {
            color: $c-color-text-white-hover;
          }
        }
        &.isOpen {
          background-color: $c-background-selected;
          .calc__tab-item-label-main,
          .calc__tab-item-label-sub {
            color: $c-color-text-white-selected;

          }
        }
        &.isError {
          border-color: $c-border-error;
          .calc__tab-item-label-main,
          .calc__tab-item-label-sub {
            color: $c-color-text-error;
          }
        }
        &-wrapper {
          display: flex;
          flex: 1 1 auto;
          flex-wrap: wrap;
          gap: 10px;
        }
        &-text {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        &-main {
          @include style-label-main;
          font-weight: 700;
        }

        &-sub {
          @include style-label-sub;
        }
      }
      &-content-wrapper {
        display: flex;
        flex-direction: column;
        width: 100%;
        padding: 20px;
        margin-bottom: 10px;
        position: relative;
        .calc__background-image-wrapper.tab {
          width: calc(100% - 40px);
          height: calc(100% - 40px);
        }
      }
      &-content {
        display: flex;
        width: 100%;
        flex-direction: column;
        align-items: flex-start;

      }
    }
  }

  &__bisection {
    &-label {
      @include style-label-main;
      margin-bottom: 10px;
    }

    &-wrapper {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      width: calc(100% - 20px);
      margin: 10px;
    }
    &-content-wrapper {
      position: relative;
      display: flex;
      width: 100%;
      gap: 15px;
      @media all and (max-width: 768px) {
        flex-direction: column;
        align-items: start;
      }
    }
    &-left-side-wrapper,
    &-right-side-wrapper {
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    &-left-label,
    &-right-label {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 10px;
      color: $c-color-text-default_dark;
    }
  }

  .calc__error {
    @include error;
    &-control-wrapper {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
    }
    &-toggle {
      width: 40px;
      height: 40px;
      display: flex;
      justify-content: center;
      align-items: center;
      @include style-border-radius;
      background-color: $c-background-default_dark;
      border: 1px solid $c-background-error;
      color: $c-color-text-default_light;
      cursor: pointer;
    }
    &-checkbox {
      &-label {
        display: flex;
      }
      &-text {
        color: $c-color-text-default_dark;
      }
      &-input {
        width: 20px;
        height: 20px;
        margin-left: 10px;
      }
    }

    &-wrapper {
      display: none;
      position: fixed;
      right: 0;
      flex-direction: column;
      bottom: 0;
      margin: 10px;
      background-color: $c-background-default_light;
      padding: 10px;
      border: 1px solid $c-background-error;
      @include style-border-radius;
      max-width: 650px;
      max-height: 500px;
      z-index: 10000;
      &.isShow {
        display: flex;
      }
    }
    &-content {
      overflow: auto;
      display: flex;
      flex-direction: column;
    }
    &-label {
      color: $c-color-text-error;
      margin-top: 35px;
    }
    &-item {
      color: $c-color-text-default_dark;
      display: flex;
      flex-direction: column;
      margin: 5px 0;
      &-name {
        color: $c-color-text-default_dark;
      }
    }
    &-alert {
      color: $c-color-text-error;
      margin-top: 15px;
      font-size: 18px;
    }
  }

  &__image {
    @include image;
    &-wrapper {
      display: flex;
      flex-direction: column;
      align-items: start;
      &-image {
        width: 100%;
        height: auto;
        overflow: hidden;
        img {
          width: 100%;
          object-fit: contain;
          height: auto;
        }
      }
    }
    &-label {
      @include style-label-main;
      &-wrapper {
        display: flex;
        margin: 5px 0;
      }
    }
  }
  .resultDataBlock {
    color: $c-color-text-default_dark;
  }
  &__duplicator {
    width: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
    margin-bottom: 5px;
    &-wrapper {
      position: relative;
      padding: 30px 0 10px;
      &::before {
        position: absolute;
        content: "";
        bottom: 0;
        width: 30%;
        transform: translateX(-50%);
        border: 1px solid $c-border-default;
      }
    }
    &-label {
      color: $c-color-text-default_dark;
      @include style-label-main;
      font-weight: 600;
    }
    &-duplicate,
    &-delete {
      cursor: pointer;
      position: absolute;
      display: flex;
      right: 0;
      top: 0;
      background-color: $c-background-default_dark;
      color: $c-color-text-default_light;
      border: 1px solid $c-border-default;
      padding: 10px;
      @include style-border-radius;
    }
    &-duplicate {
    }
    &-delete {
      color: $c-color-text-white-selected;
      background-color: $c-background-error;
    }
  }
  .dev-block {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 10px;
    border: 2px dotted gray;
    width: 100%;
    margin-bottom: 10px;
  }

  .empty-block {
    color: $c-color-text-error;
    font-weight: bold;
    font-size: 18px;
    text-shadow: 0 0 3px white;
  }

  &__icon-wrapper {
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    justify-content: flex-end;
    flex-shrink: 0;
    img {
      width: 100%;
      height: auto;
      object-fit: contain;
    }
  }

  &__background-image {
    &-wrapper {
      position: absolute;
      width: calc(100% - 10px);
      height: auto;
      display: flex;
      justify-content: flex-end;
      align-items: flex-end;
      overflow: hidden;

      &::after {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        content: '';
        background-color: #fff;
        opacity: .5
      }
    }
    &-img {
      object-fit: contain;
      width: 100%;
      height: auto;
    }
  }
}
</style>
