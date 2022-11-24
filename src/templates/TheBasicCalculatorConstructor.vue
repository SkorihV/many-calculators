<template>
  <div id="app-base-constructor-calculator">
    <div class="calc calc__wrapper" id="custom-stile">
      <template v-for="(template, inx) in calculatorTemplates" :key="inx">
        <ui-accordion
          v-if="template.template === 'UiAccordion'"
          :accordion-data="template"
          :label="template?.label"
          :classes="template?.classes"
          :element-name="template?.json_id || 'UiAccordion' + inx"
          :dependency-formula-display="template?.dependencyFormulaDisplay"
          @changedValue="changeValue"
        />
        <ui-tab
          v-else-if="template.template === 'UiTab'"
          :tab-data="template"
          :label="template?.label"
          :classes="template?.classes"
          :element-name="template?.json_id || 'UiTab' + inx"
          :dependency-formula-display="template?.dependencyFormulaDisplay"
          @changedValue="changeValue"
        />
        <ui-bisection
          v-else-if="template.template === 'UiBisection'"
          :template-data="template"
          :label="template?.label"
          :width-left-side="template?.widthLeftSide"
          :classes="template?.classes"
          :element-name="template?.json_id || 'UiBisection' + inx"
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
              : template?.json_id || 'UiRange' + index
          "
          :classes="template?.classes"
          :dependency-formula-display="template?.dependencyFormulaDisplay"
          :form-output-method="template?.formOutputMethod"
          :exclude-from-calculations="template?.excludeFromCalculations"
          :duplicate-template="template"
          @changedValue="changeValue"
        />
        <templates-wrapper
          v-else
          :template="template"
          :index="inx"
          @changedValue="changeValue"
        />
      </template>
      <div v-if="showErrorTextBlock" class="calc__error-block">
        Возможно, некоторые поля не заполнены или заполнены не корректно!
      </div>
      <div v-if="showErrorSummBlock" class="calc__error-block">
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
      >
	      {{ finalTextForOutput }}
	    </pre
      >
      <div id="prompt-text-element"></div>
    </div>
    <teleport v-if="initTeleport && submitResult" to="#teleportelement">
      {{ finalTextForOutput }}
    </teleport>
  </div>
  <pre
    >{{ getAllResultsElements }}
  </pre>
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
    this.tryToggleDevMode(Boolean(this.outOptions?.showErrorTemplate));
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

      let {
        name,
        type,
        label,
        cost,
        value,
        displayValue,
        formOutputMethod,
        eventType,
        unit,
        isShow,
        excludeFromCalculations,
      } = data;
      // || !isShow
      if (eventType === "delete") {
        this.hiddenElementOnResults(name);
        this.checkEnabledResultButton();
        return false;
      }
      this.tryAddResultElement({
        name,
        data: {
          name,
          type,
          label,
          cost,
          formOutputMethod,
          value,
          summ: cost,
          displayValue,
          unit: unit ? unit : null,
          isShow,
          excludeFromCalculations,
        },
      });
      if (type === "duplicator") {
        this.tryModifiedResultElement({
          elementName: name,
          modifiedFieldName: "insertedTemplates",
          newData: data.insertedTemplates,
        });
      }

      if (
        eventType !== "delete" &&
        eventType !== "mounted" &&
        eventType !== "dependency" &&
        eventType !== "timer"
      ) {
        if (this.mistake === "useAutomatic") {
          this.showAllTooltipsOn();
        }
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
          "#App + .tpl-anketa input[type=submit]"
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
    hiddenElementOnResults(name) {
      if (name in this.getAllResultsElements) {
        this.tryModifiedResultElement({
          elementName: name,
          modifiedFieldName: "isShow",
          newData: false,
        });
      }
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
    ]),
    /**
     * Данные которые подходят для вывода или расчета
     * @returns {{length}|unknown[]|*[]}
     */
    baseDataForCalculate() {
      return this.getBaseDataForCalculateInArray(this.getAllResultsElements);
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
     * Собираем всю формулу целиком и рассчитываем через eval
     * @returns {boolean|any}
     */
    combinedFormulaDataTogether() {
      const resultTextForComputed = this.parsingDataInFormulaOnSumma(
        this.dataListVariablesOnFormula
      );
      try {
        return eval(resultTextForComputed);
      } catch (e) {
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
        if (item.formOutputMethod && item.displayValue && item.isShow) {
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
          "Общая сумма составляет = " +
          this.finalSummaForOutput +
          " " +
          this.currency;
      }

      return result;
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
    showErrorSummBlock() {
      return (
        (this.finalSummaForOutput === null ||
          this.finalSummaForOutput === false) &&
        this.isCanShowAllTooltips &&
        this.displayResultData
      );
    },
  },
};
</script>

<style lang="scss">
//normal orange - FF5D2B
//normal dark- 464657
//hover orange - FF7044
//hover dark- 5A5A70
//font - 00000
//серый - CCCCCC
// border - E6E6E6 -
// background - F2F2F2

$color-dark-normal: #464657;
$color-orange-normal: #ff5d2b;

$color-dark-hover: #5a5a70;
$color-orange-hover: #ff7044;

$color-danger: #ff4444;

$color-black: #000000;
$color-white: #ffffff;

$color-gray-light: #f2f2f2;
$color-gray-middle: #e6e6e6;
$color-gray-dark: #cccccc;

$border-radius: 4px;

@mixin style-border {
  border: 1px solid $color-gray-middle;
  border-radius: $border-radius;
}

@mixin style-border-hover {
  border: 1px solid $color-gray-dark;
}

@mixin style-button {
  color: $color-white;
  cursor: pointer;
  background-color: $color-dark-normal;
  @include style-flex-center;
  @include style-border;
}

@mixin style-button-hover {
  background-color: $color-dark-hover;
  box-shadow: 0 0 3px 1px $color-gray-dark;
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

.button {
  @include style-button;
}

#app-base-constructor-calculator {
}
</style>
