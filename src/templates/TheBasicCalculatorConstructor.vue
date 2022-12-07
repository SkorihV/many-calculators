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

<script setup >
import { useStore } from "@/store/piniaStore";

const piniaStore = useStore();
</script>


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
  setup() {

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

<style lang="scss"></style>
