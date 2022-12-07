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
          @changedValue="changeValue"
        />
        <ui-tab
          v-else-if="template.template === 'UiTab'"
          :tab-data="template"
          :label="template?.label"
          :classes="template?.classes"
          :element-name="template?.json_id || 'UiTab' + index"
          :dependency-formula-display="template?.dependencyFormulaDisplay"
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
        Рассчитать
      </div>
      <error-names-templates
        v-if="devMode"
        :templates="calculatorTemplates"
        :init-template="devMode"
        :formula="formula?.length && isUseFormula ? formula : ''"
      />
      <pre
        class="resultDataBlock"
        v-if="showResultDataForBlock && initTeleport"
        v-html="finalTextForOutput"
      ></pre
      >
      <div id="prompt-text-element"></div>
    </div>
    <teleport v-if="initTeleport && submitResult" to="#teleportelement">
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
import { mapActions, mapGetters } from "vuex";
import { MixinsUtilityServices } from "@/components/UI/MixinsUtilityServices";



export default {
  name: "TheBasicCalculatorConstructor",
  mixins: [MixinsUtilityServices],
  components: {
    TemplatesWrapper,
    UiAccordion,
    UiTab,
    UiBisection,
    UiDuplicator,
    ErrorNamesTemplates,
  },
  async mounted() {
    const isGlobal = window.location.hostname !== "localhost";
    const localPath = "http://localhost:3000/test-dependency";
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
      : null;
    this.isUseFormula = this.outOptions?.useFormula
      ? this.outOptions?.useFormula
      : false;
    this.mistake = this.outOptions?.methodProcessingMistakes
      ? this.outOptions?.methodProcessingMistakes
      : "no";
    this.currency =
      this?.outOptions !== null ? this?.outOptions?.currency : "руб";
    this.initEnabledSendForm =
      this?.outOptions?.methodProcessingMistakes === "useAutomatic";
    this.tryToggleDevMode(Boolean(this.outOptions?.devMode));
    this.displayResultData = this.outOptions?.displayResultData;
    this.showResultDataForBlock = this.outOptions.showResultDataForBlock;
    delete window?.calculatorTemplates;
    delete window?.calculatorOptions;
  },
  data() {
    return {
      outData: {}, // внешние данные с шаблонами элементов калькулятора
      outOptions: {}, // внешние данные с общими настройками калькулятора
      calculatorTemplates: [], // список шаблонов элементов
      resultsElements: {}, // список элементов которые будут участвовать в расчетах результата
      formula: null, // формула для кастомного расчета
      isUseFormula: false, // использовать формулу
      shownAllTooltips: false, // глобальная переменная дающая разрешение показывать ошибки валидации для всех шаблонов
      mistake: "no",
      currency: "руб",
      submitResult: null,
      initEnabledSendForm: false,
      displayResultData: false, // включить работу формул и вывод данных
      showResultDataForBlock: false, // выводить результаты выбора и расчета вне формы
      eventNotShowTooltips: ["delete", "mounted", "timer", "dependency"], // События при которых не должно срабатывать отображение ошибок
    };
  },
  methods: {
    ...mapActions([
      "showAllTooltipsOn",
      "tryAddResultElement",
      "tryModifiedResultElement",
      "tryToggleDevMode",
    ]),
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
      const textAreaTeleportElement =
        document.querySelector("#teleportelement");
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
          let sum = item.cost.toString();
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
    ...mapGetters([
      "isCanShowAllTooltips",
      "isCheckedGlobalValidation",
      "validationList",
      "globalDependenciesList",
      "getNameReserveVariable",
      "getAllResultsElements",
      "devMode",
      "showInsideElementStatus",
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
      if (this.formula !== null && this.formula?.length) {
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
      let resultString = this.parsingDataInFormulaOnSumma(this.processingArrayOnFormulaProcessingLogic(this.dataListVariablesOnFormula));
      return resultString?.replace(/[\+\-\*\/] *\( *\)|\( *\) *[\+\-\*\/]/g, '');

    },

    /**
     *  рассчитываем формулу  через eval
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
          if (Object.keys(item?.insertedTemplates) && item?.cost > 0) {
            Object.values(item?.insertedTemplates).forEach((duplicator) => {
              if (Object.keys(duplicator?.insertedTemplates)) {
                if (this.parseResultValueObjectItem(duplicator)?.length) {
                  result += "<p>------------------------------</p>";
                  result += this.parseResultValueObjectItem(duplicator);
                }
                Object.values(duplicator?.insertedTemplates).forEach(
                  (templateInDuplicator) => {
                    if (this.parseResultValueObjectItem(templateInDuplicator)?.length) {

                      result +=
                        "<p>" + this.parseResultValueObjectItem(templateInDuplicator) + "</p>";
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
          "Общая сумма составляет = " +
          this.finalSummaForOutput +
          " " +
          this.currency;
      }
      return result;
    },

    finalTextForOutputForTeleport() {
      return this.finalTextForOutput.replace(/<p>|<\/p\>/g, '');
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

@mixin style-border {
  border: 1px solid $calc-color-btn;
  border-radius: $border-radius;
  margin: 1px;
}

@mixin style-border-hover {
  border: 1px solid $calc-color-more;
}

@mixin style-button {
  color: $calc-color-btn-text;
  cursor: pointer;
  background-color: $calc-color-btn;
  @include style-flex-center;
  @include style-border;
}

@mixin style-button-hover {
  background-color: $calc-color-btn-hover;
  box-shadow: 0 0 3px 1px $calc-color-btn-hover;
}

@mixin style-flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

@mixin style-flex-start {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

@mixin style-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

* {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: 0;
}

.main-wrapper {
  max-width: 980px;
  margin: 0 auto;
  background-color: #f6f2f2;
  padding: 3px;
}

.main-menu {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin: 5px;
  &__item {
    padding: 10px;
    text-decoration: none;
    display: flex;
    align-items: center;
    justify-content: center;
    @include style-border;
    @include style-button;
    color: white;
    background-color: gray;
    font-weight: 500;
    &:hover {
      @include style-border-hover;
      @include style-button-hover;
      color: white;
    }
    &_active {
      @include style-border-hover;
      @include style-button-hover;
      color: white;
    }
  }
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
    color: $calc-color-text;
    font-family: Arial, Helvetica, sans-serif;
    box-sizing: border-box;
  }

  &__wrapper {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    &-group-data {
      margin-bottom: 5px;
      padding-left: 20px;
      border-left: 3px solid $calc-color-btn-hover;
      width: 100%;
      position: relative;
    }
  }
  &__error-block {
    width: 100%;
    @include style-flex-center;
    padding: 20px;
    background-color: $calc-color-danger;
    color: $calc-color-danger-text;
  }
  &__show-result-btn {
    @include style-button;
    padding: 20px;
    margin: 5px 0;
    align-self: center;
    &:hover {
      @include style-button-hover;
      background-color: $calc-color-btn-hover;
    }
  }
  //--------Стили input text-----
  &__input {
    &-wrapper {
      @include style-flex-center;
      flex-direction: column;
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
      @include style-flex-start;
      width: 100%;
      justify-content: space-between;
      align-items: flex-start;
      font-weight: 600;
      &.is-column {
        flex-direction: column;
      }
      @media all and (max-width: 480px) {
        flex-direction: column;
        align-items: start;
        justify-content: center;
      }
      &-text {
        display: flex;
        justify-content: flex-start;
        margin-right: 10px;
        padding: 5px 0;
        text-align: start;
      }
    }

    &-item {
      font-size: 15px;
      line-height: 16px;
      padding: 5px;
      max-width: 120px;
      @include style-border;
      border-bottom: 2px solid $calc-color-btn-hover;
      &:hover,
      &:focus-visible {
        @include style-border-hover;
        border-bottom: 2px solid $calc-color-btn;
        outline: none;
      }
    }

    &-buttons {
      &-plus,
      &-minus {
        width: 24px;
        height: 24px;
        @include style-button;
        font-weight: 600;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        &:hover {
          @include style-button-hover;
        }
      }
    }
    &-unit {
      margin-left: 5px;
    }
  }
  //--------Стили input range-----

  &__range {
    &-wrapper {
      display: flex;
      flex-direction: column;
      width: 100%;
      position: relative;
    }
    &-label {
      @include style-flex-start;
      padding: 5px;
      font-weight: 600;
    }
    &-item {
      -webkit-appearance: none;
      width: 100%;
      height: 15px;
      max-height: 30px;
      border-radius: 5px;
      background: #d3d3d3;
      outline: none;

      -webkit-transition: 0.2s;
      transition: opacity 0.2s;
      &::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 25px;
        height: 25px;
        background: $calc-color-btn;
        cursor: pointer;
        @include style-button;
        &:hover {
          background-color: $calc-color-btn-hover;
          @include style-button-hover;
        }
      }
      &::-moz-range-thumb {
        width: 25px;
        height: 25px;
        border-radius: 50%;
        background: $calc-color-btn;
        cursor: pointer;
        @include style-border;
        &:hover {
          @include style-border-hover;
        }
      }
    }

    &-steps {
      &-wrapper {
        @include style-flex-center;
        justify-content: space-around;
        margin: 5px 0;
        max-height: 30px;
      }
      &-item {
        flex: 1 1 auto;
        position: relative;
        cursor: pointer;
        max-height: 30px;
        &:after {
          content: "";
          display: block;
          padding-bottom: 100%;
        }
        &-content {
          @include style-flex-center;
          position: absolute;
          width: 100%;
          height: 100%;
          font-size: 10px;
          border-radius: $border-radius;
          &_selected {
            background-color: $calc-color-btn;
            color: $calc-color-btn-text;
          }
        }
      }
    }

    &-current {
      &-wrapper {
        @include style-flex-start;
        margin-left: auto;
        gap: 5px;
      }

      &-static {
        color: $calc-color-btn-text;
        padding: 4px 6px;
        @include style-button;
        min-width: 25px;
        min-height: 27px;
      }

      &-dynamic {
        font-size: 15px;
        line-height: 16px;
        padding: 5px;
        max-width: 40px;
        right: 0;
        @include style-border;
        border-bottom: 2px solid $calc-color-btn-hover;
        &:hover,
        &:focus-visible {
          @include style-border-hover;
          border-bottom: 2px solid $calc-color-btn;
          outline: none;
        }
      }
    }
  }

  //---------Стили select-----

  &__select {
    &-wrapper {
      @include style-flex-center;
      gap: 5px;
      position: relative;
      width: 100%;
      &.is-column {
        flex-direction: column;
        align-items: flex-start;
      }
      @media all and (max-width: 480px) {
        flex-direction: column;
      }
    }

    &-label {
      @include style-flex-start;
      flex: 1 1 100%;
      font-weight: 600;
    }

    &-change {
      &-wrapper {
        cursor: pointer;
        @include style-border;
        font-size: 15px;
        line-height: 16px;
        position: relative;
        flex: 1 1 100%;
        width: 100%;
        border-bottom: 2px solid $calc-color-btn-hover;
        background-color: white;
        &:hover {
          @include style-border-hover;
          border-bottom: 2px solid $calc-color-btn;
          .calc__select-change-item {
            &:before {
              border: solid $calc-color-btn;
              border-width: 0 3px 3px 0;
            }
          }
        }
      }

      &-item {
        padding: 5px 25px 5px 10px;
        @include style-flex-center;
        justify-content: flex-start;
        min-height: 36px;
        text-align: start;
        flex: 1 1 auto;
        gap: 5px;

        &:before {
          content: "";
          width: 7px;
          height: 7px;
          border: solid $calc-color-btn-hover;
          border-width: 0 3px 3px 0;
          display: inline-block;
          position: absolute;
          top: 50%;
          right: 5px;
          transform: translateY(-50%) rotate(45deg);
          -webkit-transform: translateY(-50%) rotate(45deg);
        }
        &.is-open {
          &:before {
            transform: translateY(-50%) rotate(-135deg);
            -webkit-transform: translateY(-50%) rotate(-135deg);
          }
        }
      }
    }

    &-image {
      &-wrapper {
        width: 50px;
        max-height: 50px;
        margin-left: 10px;
      }
      &-item {
        @include style-img;
      }
    }

    &-option {
      &-wrapper {
        display: flex;
        flex-direction: column;
        position: absolute;
        top: calc(100% + 2px);
        @include style-border;
        z-index: 10;
        width: 100%;

        border-left: 1px solid $calc-color-btn-hover;
        border-right: 1px solid $calc-color-btn-hover;
        border-bottom: 1px solid $calc-color-btn-hover;
      }
      &-item {
        background-color: white;
        @include style-flex-start;
        &:hover {
          background-color: $calc-color-btn-hover;
          .calc__select-option-item-text {
            color: $calc-color-btn-text-hover;
          }
        }
        gap: 5px;
        text-align: start;
        &-text {
          padding: 10px 25px 10px 10px;
          text-align: start;
        }
      }
    }
  }

  //-----------------Радио кнопки ---------------
  &__radio {
    &-wrapper {
      @include style-flex-start;
      justify-content: space-between;
      align-items: stretch;
      position: relative;
      gap: 5px;
      min-height: 31px;
      flex-wrap: wrap;

      &-buttons {
        display: flex;
        justify-content: flex-end;
        flex-wrap: wrap;
        flex: 0 1 auto;
        gap: 5px;
      }

      &.column {
        flex-direction: column;
        align-items: start;
        .calc__radio-wrapper-buttons {
          flex-direction: column;
        }
        .calc__radio-label {
          flex: 1 1 auto;
          margin: 1px 0;
        }
      }

      &.base {
        .calc__radio {
          &-indicator {
            position: relative;
            display: flex;
            width: 16px;
            height: 16px;
            border: 1px solid $calc-color-btn-text;
            border-radius: 50%;
            margin-right: 4px;
            flex-shrink: 0;
            &:hover {
              border: 1px solid $calc-color-btn-text-hover;
            }
          }
        }
        .calc__radio-label {
          &::after {
            content: "";
            display: block;
            left: 0;
            width: 100%;
            position: absolute;
            background-color: $calc-color-btn-text;
            height: 1px;
            bottom: 1px;
          }
          &:hover {
            box-shadow: 0 0 3px 1px $calc-color-btn-hover;
            background-color: $calc-color-btn-hover;
            .calc__radio-text {
              color: $calc-color-btn-text-hover;
            }
          }
          &.checked {
            .calc__radio-text {
              color: $calc-color-btn-text;
            }
            &:hover {
              box-shadow: 0 0 3px 1px $calc-color-btn-checked;
              background-color: $calc-color-btn-checked;
              .calc__radio-text {
                color: $calc-color-btn-checked-text;
              }
            }
            .calc__radio-indicator {
              box-shadow: 0 0 1px 3px $calc-color-more inset;
              &::after {
                content: "";
                position: absolute;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                border-radius: 50%;
                width: 8px;
                height: 8px;
                background-color: $calc-color-btn-checked;
              }
              + .calc__radio-text {
                color: $calc-color-btn-text;
              }
            }
          }
        }
      }

      &.buttons {
        .calc__radio-label {
          &:hover {
            background-color: $calc-color-btn-hover;
            .calc__radio-text {
              color: $calc-color-btn-text-hover;
            }
          }
          &.checked {
            background-color: $calc-color-btn-checked;
            color: $calc-color-btn-checked-text;
            &:hover {
              box-shadow: 0 0 3px 1px $calc-color-btn-checked;
            }
          }
        }
      }
      &.onlyImage {
        .calc__radio-label.checked {
          background-color: $calc-color-btn-checked;
        }
      }
    }
    &-title {
      @include style-flex-start;
      font-weight: 600;
      flex: 0 1 auto;
    }

    &-label {
      @include style-button;
      @include style-flex-start;
      border-bottom: 1px solid $calc-color-btn;
      padding: 10px 20px;
      position: relative;
      gap: 5px;
      &:hover {
        @include style-button-hover;
      }
      &.checked {
        .calc__radio-text {
          color: $calc-color-btn-checked-text;
        }
      }
    }
    &-text {
      display: flex;
      color: $calc-color-btn-text;
    }
  }

  //--------Стили чекбокса --------------

  &__checkbox {
    &-wrapper {
      @include style-flex-start;
      position: relative;
    }
    &-label {
      @include style-flex-center;
      justify-content: flex-start;
      flex: 1 1 auto;
      position: relative;
      @media all and (max-width: 480px) {
        flex-direction: column;
        align-items: flex-start;
      }
    }
    &-text {
      @include style-flex-center;
      justify-content: flex-start;
      position: relative;

      &.button {
        @include style-button;
        padding: 10px 15px;
        &:hover {
          @include style-button-hover;
        }
      }
      &_second {
        font-weight: bold;
      }
    }

    &-element {
      position: relative;
      margin: 5px;
      height: 30px;

      &.base {
        width: 30px;
        &:after {
          display: none;
        }
      }

      &.button {
        display: none;
      }
      &.switcher {
        width: 70px;
        &-vertical {
          width: 25px;
          height: 65px;
        }
      }

      &:after,
      &:before {
        box-sizing: border-box;
        cursor: pointer;
        content: "";
        position: absolute;
        @include style-border;
      }

      &.switcher-vertical:after,
      &.switcher:after,
      &:before {
        transition: all 0.3s ease-in-out;
        height: 22px;
        top: 50%;
        transform: translateY(-50%);
        border-width: 2px;
        border-color: $calc-color-btn;
        @include style-flex-center;
        font-size: 13px;
        box-sizing: border-box;
      }
      &.base:before {
        width: 22px;
      }
      &.switcher-vertical:before,
      &.switcher:before {
        transition: all 0.3s ease-in-out;
        width: 35px;
        border-bottom-left-radius: 0;
        border-top-left-radius: 0;
        border-color: $calc-color-btn;
        z-index: 1;
        right: 0;
      }
      &.switcher {
        &:after {
          width: 35px;
          border-right: none;
          background-color: $calc-color-btn;
          border-color: $calc-color-btn;
          border-style: solid;
          box-shadow: 0 0 0 2px $calc-color-more inset;
          border-right-width: 2px;
          border-bottom-right-radius: 0;
          border-top-right-radius: 0;
          z-index: 1;
          left: 0;
        }
        &:hover:after {
          background-color: $calc-color-btn-hover;
          border-color: $calc-color-btn-hover;
        }
        &:hover:before {
          border-color: $calc-color-btn-hover;
        }
      }
      &.switcher-vertical:after,
      &.switcher-vertical:before {
        width: 25px;
        height: 35px;
        transform: translateY(0);
      }

      &.switcher-vertical {
        &:before {
          right: auto;
          top: 0;
          border-top-left-radius: $border-radius;
          border-bottom-right-radius: 0;
          background-color: $calc-color-btn;
          box-shadow: 0 0 0 2px $calc-color-more inset;
        }
        &:hover:before {
          background-color: $calc-color-btn-hover;
          border-color: $calc-color-btn-hover;
        }
      }
      &.switcher-vertical {
        &:after {
          border-color: $calc-color-btn;
        }
        &:hover:after {
          border-color: $calc-color-btn-hover;
        }
      }

      &:hover {
        &.base:before {
          border-color: $calc-color-btn-hover;
          background-color: $calc-color-btn-hover;
          box-shadow: 0 0 0 2px $calc-color-more inset;
        }
      }
    }

    &-item {
      position: absolute;
      z-index: -1;
      opacity: 0;
      display: block;
      width: 0;
      height: 0;
      &:checked {
        ~ .calc__checkbox-element {
          &.base {
            &:before {
              background-color: $calc-color-btn-checked;
              box-shadow: 0 0 0 2px $calc-color-more inset;
            }
            &:hover:before {
              background-color: $calc-color-btn-hover;
            }
          }
          &.switcher-vertical:before,
          &.switcher:after {
            border-color: $calc-color-btn-checked;
            background-color: inherit;
            box-shadow: none;
          }
          &.switcher-vertical:hover:before,
          &.switcher:hover:after {
            border-color: $calc-color-btn-hover;
          }

          &.switcher-vertical:after,
          &.switcher:before {
            background-color: $calc-color-btn-checked;
            border-color: $calc-color-btn-checked;
            box-shadow: 0 0 0 2px $calc-color-more inset;
          }

          &.switcher-vertical:hover:after,
          &.switcher:hover:before {
            background-color: $calc-color-btn-hover;
            border-color: $calc-color-btn-hover;
          }
        }
        ~ .calc__checkbox-text.button {
          background-color: $calc-color-btn-checked;
          color: $calc-color-btn-checked-text;
        }
      }
    }
  }

  //-------всплывающая подсказка ------
  &__prompt {
    &-wrapper {
      margin-left: 5px;
    }

    &-button {
      background-color: #f2f2f2;
      cursor: pointer;
      width: 20px;
      height: 20px;
      @include style-flex-center;
      border: 1px solid $calc-color-btn;
      border-radius: 50%;
      font-weight: 600;
      line-height: 15px;
      &:hover {
        background-color: $calc-color-btn-hover;
        color: $calc-color-btn-text-hover;
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
      padding: 30px;
      max-width: 80%;
      overflow-y: auto;
      border: 1px solid $calc-color-btn;
      border-radius: $border-radius;
      box-shadow: 0 0 9px 0 $calc-color-btn;
    }
  }

  // tooltip
  &__tooltip {
    &-wrapper {
      display: flex;
      position: absolute;
      @include style-border;
      border-color: $calc-color-danger;
      z-index: 100;
      padding: 2px;
      box-shadow: 0 0 3px 0 $calc-color-danger;
      bottom: calc(100% + 10px);
      left: 50%;
      transform: translateX(-50%);
      background-color: white;

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
      border-bottom: 1px solid $calc-color-danger;
      border-right: 1px solid $calc-color-danger;
      display: block;
    }
    &-text {
      display: flex;
      color: $calc-color-danger;
      border-radius: $border-radius;
      justify-content: center;
      min-width: 300px;
    }
  }

  //---------------аккордеон----------------
  &__accordion {
    &-main-label {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 10px;
    }
    &-wrapper {
      @include style-flex-start;
      align-items: start;
      flex-direction: column;
      width: 100%;
    }
    &-item {
      &-label {
        @include style-button;
        @include style-flex-start;
        border-radius: 0;
        padding: 10px;
        width: 100%;
        margin-bottom: 5px;
        position: relative;
        gap: 5px;
        &:hover {
          @include style-button-hover;
          .calc__accordion-item-plus:before,
          .calc__accordion-item-minus:before {
            border: 1px solid $calc-color-btn-text;
            color: $calc-color-btn-text;
          }
        }
        &.isOpen {
          background-color: $calc-color-btn-checked;
          color: $calc-color-btn-checked-text;
          .calc__accordion-item-plus:before,
          .calc__accordion-item-minus:before {
            border: 1px solid $calc-color-btn-checked-text;
            color: $calc-color-btn-checked-text;
          }
          &:hover {
            box-shadow: 0 0 3px 1px $calc-color-btn-checked;
          }
        }
        &.isError {
          background-color: $calc-color-danger;
          color: $calc-color-danger-text;
        }
        &-wrapper {
          @include style-flex-start;
          flex-direction: column;
          flex: 1 1 auto;
          width: 100%;
        }
      }
      &-content {
        width: 100%;
      }
      &-plus,
      &-minus {
        position: relative;
        width: 30px;
        height: 30px;
      }
      &-plus:before,
      &-minus:before {
        width: 30px;
        height: 30px;
        color: #ffffff;
        font-size: 30px;
        position: absolute;
        border: 1px solid $calc-color-btn-text;
        color: $calc-color-btn-text;
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
    &-main-label {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 10px;
      width: 100%;
      text-align: start;
    }
    &-wrapper {
      @include style-flex-start;
      align-items: start;
      flex-direction: column;
      width: 100%;
      margin: 10px 0;
    }
    &-item {
      &-label {
        @include style-button;
        @include style-flex-start;
        border-radius: 0;
        padding: 10px;
        margin-bottom: 5px;
        position: relative;
        flex: 0 1 auto;

        &:hover {
          @include style-button-hover;
        }
        &.isOpen {
          background-color: $calc-color-btn-checked;
          color: $calc-color-btn-checked-text;
          &:hover {
            box-shadow: 0 0 3px 1px $calc-color-btn-checked;
          }
        }
        &.isError {
          background-color: $calc-color-danger;
          color: $calc-color-danger-text;
        }
        &-wrapper {
          @include style-flex-start;
          flex: 1 1 auto;
          width: 100%;
          flex-wrap: wrap;
        }
      }
      &-content-wrapper {
        display: flex;
        flex-direction: column;
        width: 100%;
      }
      &-content {
        @include style-flex-start;
        width: 100%;
      }
    }
  }

  &__bisection {
    &-label {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 10px;
      color: $calc-color-text;
    }

    &-wrapper {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      width: 100%;
    }
    &-content-wrapper {
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
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    &-left-label,
    &-right-label {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 10px;
      color: $calc-color-text;
    }
  }

  .calc__error {
    &-toggle {
      position: absolute;
      right: 0;
      top: 0;
      width: 40px;
      height: 40px;
      @include style-button;
    }
    &-checkbox {
      &-label {
        display: flex;
      }
      &-text {
        color: $calc-color-btn-text;
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
      background-color: $calc-color-btn;
      padding: 10px;
      color: $calc-color-btn-text;
      border-radius: $border-radius;
      max-width: 650px;
      max-height: 500px;
      box-shadow: 0 0 2px 2px $calc-color-danger;
      min-height: 42px;
      min-width: 42px;
      overflow: auto;
      box-sizing: border-box;
      z-index: 10000;
      &.isShow {
        display: flex;
      }
    }
    &-label {
      color: $calc-color-danger;
      margin-top: 35px;
    }
    &-item {
      color: $calc-color-btn-text;
      display: flex;
      flex-direction: column;
      margin: 5px 0;
      &-name {
        color: $calc-color-btn-text;
      }
    }
    &-alert {
      color: $calc-color-danger;
      margin-top: 15px;
      font-size: 18px;
    }
  }

  &__image {
    &-wrapper {
      display: flex;
      flex-direction: column;
      align-items: start;
      &-image {
        width: 100%;
        height: auto;
        overflow: hidden;
        img {
          @include style-img;
          height: auto;
        }
      }
    }
    &-label {
      &-wrapper {
        display: flex;
        margin: 5px 0;
      }
    }
  }
  .resultDataBlock {
    color: $calc-color-text;
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
        border: 1px solid $calc-color-btn;
      }
    }
    &-label {
      color: $calc-color-text;
      font-weight: 600;
    }
    &-duplicate,
    &-delete {
      position: absolute;
      display: flex;
      right: 0;
      top: 0;
      @include style-button;
      padding: 10px;
      &:hover {
        @include style-button-hover;
      }
    }
    &-duplicate {
    }
    &-delete {
      color: $calc-color-danger-text;
      background-color: $calc-color-danger;
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
    color: $calc-color-danger;
    font-weight: bold;
    font-size: 18px;
    text-shadow: 0 0 3px white;
  }
}
</style>
