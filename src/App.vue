<template>
  <div id="app-base-constructor-calculator" v-show="appIsMounted">
    <div class="calc calc__wrapper" id="custom-stile">
      <template v-for="(template, index) in calculatorTemplates" :key="index">
        <templates-wrapper-structural
          v-if="isStructureTemplate(template?.template)"
          :parent-is-show="true"
          :template="template"
          :index="index"
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
          :maximum-duple="template?.maximumDuple"
          :formula-processing-logic="template?.formulaProcessingLogic"
          :template-name="template.template"
          :position-element="template?.position"
          :zero-value-display-ignore="template?.zeroValueDisplayIgnore"
          :parent-is-show="true"
          @changedValue="changeValue"
        />
        <templates-wrapper-column
          v-if="template?.template === 'UiColumns'"
          :parent-is-show="true"
          :template="template"
          :index="index"
          :parent-name="'calc__app'"
          @changedValue="changeValue"
        />
        <templates-wrapper
          v-else
          :parent-is-show="true"
          :template="template"
          :index="index"
          @changedValue="changeValue"
        />
      </template>
      <div v-if="showErrorTextBlock" class="calc__error-block">
        Заполните, пожалуйста, все обязательные поля.
      </div>
      <div
        v-if="!showErrorTextBlock && showErrorSummaBlock"
        class="calc__error-block"
      >
        Не все поля участвующие в расчете были заполнены.
      </div>
      <result-button-for-computed
        :resultOptions="outOptions?.resultOptions"
        @checkEnabledResultButton="checkEnabledResultButton"
      />

      <result-block-for-output
        v-if="outOptions?.resultOptions"
        :result-options="outOptions?.resultOptions"
        :dataForResult="sortPositionDataForOutput"
        :final-summa-for-output="finalSummaForOutput"
      />
      <error-names-templates
        v-if="devMode"
        :templates="calculatorTemplates"
        :init-template="devMode"
        :formula="mainFormulaIsExist && isUseFormula ? formula : ''"
      />
      <div id="prompt-text-element"></div>
    </div>
    <teleport v-if="allowTeleport" to="#teleport">
      {{ finalTextForOutputForTeleport }}
    </teleport>
    <dev-block
      :formula="formula"
      :formula-variables="resultTextForComputed"
      :local-cost="finalSummaForOutput"
      hidden-value
    />
  </div>
  <spinner-element :init-show="!appIsMounted"></spinner-element>
</template>

<script>
import TemplatesWrapperStructural from "@/components/UI/supporting/TemplatesWrapperStructural.vue";
import UiDuplicator from "@/components/UI/structural/UiDuplicator.vue";
import TemplatesWrapper from "@/components/UI/supporting/TemplatesWrapper.vue";
import TemplatesWrapperColumn from "@/components/UI/supporting/TemplatesWrapperColumn.vue";

import ErrorNamesTemplates from "@/components/UI/devMode/ErrorNamesTemplates.vue";
import SpinnerElement from "@/components/UI/other/Spinner-element.vue";
import ResultBlockForOutput from "@/components/UI/other/ResultBlockForOutput.vue";
import ResultButtonForComputed from "@/components/UI/other/ResultButtonForComputed.vue";

import devBlock from "@/components/UI/devMode/devBlock.vue";

import { MixinsUtilityServices } from "@/mixins/MixinsUtilityServices";
import { useBaseStore } from "@/store/piniaStore";
import { mapState } from "pinia";

import localData from "@/servises/localData";

import {
  parseResultValueObjectItem,
  processingArrayOnFormulaProcessingLogic,
  parsingDataInFormulaOnSumma,
  getSummaFreeVariablesInFormula,
  getListVariablesMissedInFormula,
} from "@/servises/UtilityServices.js";

import {updatePositionElementsInBlockSection, updatePositionElementsInTabAndAccordion, updatePositionInBaseTemplates} from "@/servises/UpdatedPositionOnTemplates.js"

export default {
  name: "TheBasicCalculatorConstructor",
  mixins: [MixinsUtilityServices],
  components: {
    TemplatesWrapperStructural,
    TemplatesWrapperColumn,
    TemplatesWrapper,
    ResultButtonForComputed,
    ResultBlockForOutput,
    SpinnerElement,
    UiDuplicator,
    ErrorNamesTemplates,
    devBlock,
  },
  async mounted() {
    let isLocal = false;
    if (typeof localData !== "undefined") {
      isLocal = localData?.isLocal ? localData?.isLocal : false;
    }

    if (isLocal) {
      const localPathData = localData?.localPathData;
      const localPathOptions = localData?.localPathOptions;
      await fetch(localPathData)
        .then((response) => response.json())
        .then((data) => {
          this.outData = data;
        });
      await fetch(localPathOptions)
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
    /**
     * у всех элементов калькулятора добавляем порядковый номер.
     * @type {*[]}
     */
    const calculatorTemplatesWitchPositions = [];
    const countTemplatesInOutData = this.outData?.calculatorTemplates?.length;
    if (Boolean(countTemplatesInOutData)) {
      let templatesPositionIndex = 0;

      this.outData?.calculatorTemplates.forEach((item) => {
        let currentMainItem = item;
        const currentMainTemplateName = currentMainItem?.template;

        if (currentMainTemplateName === "UiBlockSection") {
          const { newItem, shiftIndex } = updatePositionElementsInBlockSection(
            currentMainItem,
            templatesPositionIndex
          );
          templatesPositionIndex = shiftIndex;
          calculatorTemplatesWitchPositions.push(newItem);
        } else if (
          currentMainTemplateName === "UiTab" ||
          currentMainTemplateName === "UiAccordion"
        ) {

          const { newItem, shiftIndex } = updatePositionElementsInTabAndAccordion(currentMainItem, templatesPositionIndex);
          currentMainItem = newItem;
          templatesPositionIndex = shiftIndex;
          calculatorTemplatesWitchPositions.push(currentMainItem);

        } else if (currentMainTemplateName === "UiDuplicator") {

          const currentDuplicatorItem = currentMainItem;
          const duplicatorTemplates = currentDuplicatorItem?.templates;
          const lengthDuplicatorTemplates = duplicatorTemplates?.length

          if (Boolean(lengthDuplicatorTemplates)) {
            let currentPositionDuplicatorIndex = 0;
            const newDuplicatorTemplates = [];

            for (let r = 0; r < lengthDuplicatorTemplates; r++) {
              const duplicatorItemTemplateName = duplicatorTemplates[r].template;
              let newTemplate = duplicatorTemplates[r];

              if (
                duplicatorItemTemplateName === "UiBlockSection"
              ) {
                const { newItem, shiftIndex } =
                  updatePositionElementsInBlockSection(
                    newTemplate,
                    currentPositionDuplicatorIndex
                  );
                currentPositionDuplicatorIndex = shiftIndex;
                newTemplate = newItem;
              } else if (
                duplicatorItemTemplateName === "UiTab" ||
                duplicatorItemTemplateName === "UiAccordion"
              ) {
                const {newItem, shiftIndex} = updatePositionElementsInTabAndAccordion(newTemplate, currentPositionDuplicatorIndex);
                currentPositionDuplicatorIndex = shiftIndex;
                newTemplate = newItem;
              } else {
                const {newItem, shiftIndex} = updatePositionInBaseTemplates(newTemplate, currentPositionDuplicatorIndex)
                currentPositionDuplicatorIndex = shiftIndex;
                newTemplate = newItem;
              }
              newDuplicatorTemplates.push(newTemplate);
            }
            currentDuplicatorItem.templates = newDuplicatorTemplates;
            currentMainItem.position = templatesPositionIndex;
            templatesPositionIndex++;
            calculatorTemplatesWitchPositions.push(currentDuplicatorItem);
          }
        } else {
          const {newItem, shiftIndex} = updatePositionInBaseTemplates(currentMainItem, templatesPositionIndex)
          templatesPositionIndex = shiftIndex;
          calculatorTemplatesWitchPositions.push(newItem);
        }
      });
    }

    this.calculatorTemplates = calculatorTemplatesWitchPositions;
    this.formula = this.outOptions?.formula?.length
      ? this.outOptions?.formula
      : "";

    this.isUseFormula = this.outOptions?.computedMethod === "formula";
    this.displayResultData = this.outOptions?.computedMethod !== "no";
    this.methodWorksForm = this.outOptions?.methodWorksForm
      ? this.outOptions.methodWorksForm
      : "show";
    this.existFormulaForHiddenResultButton = Boolean(this.outOptions?.resultOptions?.formulaDisplayButton?.length);

    this.setMethodBeginningCalculation(this.outOptions);
    this.setCurrency(this.outOptions);
    this.findForm();
    this.findTeleportField();
    this.findSubmitForm();

    if (this.showFormIsAllow) {
      this.showForm();
    }

    this.setInitEnabledSendForm(this.methodBeginningCalculationIsAutomatic);
    this.tryToggleDevMode(Boolean(this.outOptions?.devModeEnabled));
    this.setTooltipOn(this.outOptions);

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
      eventNotShowTooltips: [
        "delete",
        "mounted",
        "timer",
        "dependency",
        "currentSelectedRadioButton",
        "changeAmountSelectList",
      ], // События при которых не должно срабатывать отображение ошибок
      isHoverButtonResult: false,
      methodWorksForm: "show",
      formElement: null,
      teleportField: null,
      submitResult: null,
      eventSubmittingFormAdded: null,
      intervalName: null,
      existFormulaForHiddenResultButton: false
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
        this.methodBeginningCalculationIsAutomatic
      ) {
        this.showAllTooltipsOn();
        this.setAllowShowResultBlock(true);
      }
      if (!this.eventNotShowTooltips.includes(eventType) && this.existFormulaForHiddenResultButton && this.methodBeginningCalculationIsButton) {
        this.showAllTooltipsOn();
      }

      this.checkEnabledResultButton();
    },
    /**
     * Разрешаем отправку формы
     */
    checkEnabledResultButton() {
      if (!this.formElement) {
        this.findForm();
      }
      if (!this.submitResult) {
        this.findSubmitForm();
      }
      this.setReadOnlyForTeleportField();

      if (this.submitResult && !this.eventSubmittingFormAdded) {
        this.setEventOnSubmit();
      }

      if (this.showFormIsAllow) {
        this.showForm();
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
    showForm() {
      if (!this.formElement) {
        return false;
      }
      if (
        Number(this.outOptions?.resultOptions?.timerForSpinner) > 0 &&
        this.methodWorksForm !== "show"
      ) {
        setTimeout(() => {
          if (this.showFormIsAllow) {
            this.formElement.style.display = "block";
          }
        }, this.outOptions?.resultOptions?.timerForSpinner * 1000);
      } else {
        this.formElement.style.display = "block";
      }
    },
    hiddenForm() {
      if (this.formElement) {
        this.formElement.style.display = "none";
      }
    },
    findForm() {
      const form = document.querySelector(".calc__form-for-result");
      this.formElement = form ? form : null;
    },
    findSubmitForm() {
      if (this.formElement) {
        const submit = this.formElement.querySelector("button[type=submit]");
        this.submitResult = submit ? submit : null;
      }
    },
    findTeleportField() {
      if (this.formElement) {
        const teleportField = this.formElement.querySelector("#teleport");
        this.teleportField = teleportField ? teleportField : null;
      }

    },
    setReadOnlyForTeleportField() {
      if (this.teleportField) {
        this.findTeleportField();
      }
      if (this.teleportField) {
        this.teleportField.readOnly = true;
      }
    },
    setEventOnSubmit() {
      if (!this.intervalName) {
        this.submitResult.addEventListener("click", () => {
          let counter = 0;
          this.intervalName = setInterval(() => {
            this.formElement = null;
            this.submitResult = null;
            this.eventSubmittingFormAdded = false;
            this.checkEnabledResultButton();
            counter++;
            if (counter > 5) {
              clearInterval(this.intervalName);
            }
          }, 1000);
        });
      }
      this.eventSubmittingFormAdded = true;
    },
    toggleTextAreaResultForDevMode() {
      if (this.showInsideElementStatus) {
        if (this.teleportField) {
          this.findTeleportField();
        }
        if (this.teleportField ) {
          this.teleportField.style.display = 'block';
        }
      }
      if (!this.showInsideElementStatus && this.teleportField) {
        this.teleportField.style.display = 'none';
      }
    },
    tryPassDependency(name, value, isShow, displayValue, type) {
      this.tryAddDependencyElement({
        name,
        value,
        isShow,
        displayValue,
        type,
      });
    },

  },
  watch: {
    isExistGlobalErrorsValidationIgnoreHiddenElement() {
      this.checkEnabledResultButton();
    },
    showFormIsAllow: {
      handler(newValue) {
        if (newValue) {
          this.showForm();
        } else {
          this.hiddenForm();
        }
      },
    },
    showInsideElementStatus() {
      this.toggleTextAreaResultForDevMode();
    },
    showErrorSummaBlock: {
      handler(newValue) {
        if (newValue) {
          this.setAllowShowResultBlock(false)
        }
      }
    }
  },
  computed: {
    ...mapState(useBaseStore, [
      "showAllTooltipsOn",
      "tryAddResultElement",
      "tryModifiedResultElement",
      "tryToggleDevMode",
      "isCanShowAllTooltips",
      "isExistGlobalErrorsValidationIgnoreHiddenElement",
      "globalDependenciesList",
      "getNameReserveVariable",
      "getAllResultsElements",
      "devMode",
      "showInsideElementStatus",
      "getImageDir",
      "appIsMounted",
      "setTooltipOn",
      "setCurrency",
      "getCurrency",
      "setMethodBeginningCalculation",
      "methodBeginningCalculationIsAutomatic",
      "methodBeginningCalculationIsButton",
      "setInitEnabledSendForm",
      "checkInitEnabledSendForm",
      "setAllowShowResultBlock",
      "checkAllowShowResultBlock",
      "isStructureTemplate",
      "tryAddDependencyElement"
    ]),
    mainFormulaIsExist() {
      return Boolean(this.formula?.length);
    },
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
      if (this.mainFormulaIsExist) {
        return this.getArrayElementsFromFormula(this.formula);
      }
      return [];
    },
    /**
     * Список переменных не используемых в формуле
     * @returns {[]}
     */
    freeVariablesOutsideFormula() {
      return getListVariablesMissedInFormula(
        this.baseDataForCalculate,
        this.variablesInFormula
      );
    },

    /**
     * сумма всех не используемых в формуле переменных
     * @returns {*}
     */
    summaFreeVariables() {
      return getSummaFreeVariablesInFormula(this.freeVariablesOutsideFormula);
    },
    /**
     * Список переменных из формулы вместе с данными
     * @returns {*}
     */
    dataListVariablesOnFormula() {
      return this.variablesInFormula?.map((item) => {
        if (item === this.getNameReserveVariable) {
          this.tryPassDependency("_otherSum_", this.summaFreeVariables, Boolean(this.summaFreeVariables !== null), this.summaFreeVariables, "_otherSum_");
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
      const resultString = parsingDataInFormulaOnSumma(
        processingArrayOnFormulaProcessingLogic(this.dataListVariablesOnFormula)
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
          console.error(
            "Ошибка в расчете формулы: ",
            this.resultTextForComputed
          );
        }
        return null;
      }
    },

    /**
     * Данные нужные только для вывода в форму
     * @returns {*[]}
     */
    sortPositionDataForOutput() {
      return this.baseDataForCalculate.sort(
        (itemA, itemB) => itemA.position - itemB.position
      );
    },
    /**
     * Текст со всеми полями которые должны отображаться в форме
     * @returns {string}
     */
    resultTextDataForForm() {
      let result = "";
      this.sortPositionDataForOutput.forEach((item) => {
        if (item.type === "duplicator") {
          if (item?.insertedTemplates?.length && item.isShow) {
            item?.insertedTemplates.forEach((duplicator) => {
              if (duplicator?.insertedTemplates?.length) {
                if (
                  parseResultValueObjectItem(
                    duplicator,
                    "formOutputMethod",
                    this.getCurrency
                  )?.length
                ) {
                  result += "<div class='calc__result-block-delimiter'></div>";
                  result +=
                    "<div class='calc__result-block-field-wrapper'>" +
                    parseResultValueObjectItem(
                      duplicator,
                      "formOutputMethod",
                      this.getCurrency
                    ) +
                    "</div>";
                }
                duplicator?.insertedTemplates.forEach(
                  (templateInDuplicator) => {
                    if (
                      parseResultValueObjectItem(
                        templateInDuplicator,
                        "formOutputMethod",
                        this.getCurrency
                      )?.length
                    ) {
                      result +=
                        "<div class='calc__result-block-field-wrapper'>" +
                        parseResultValueObjectItem(
                          templateInDuplicator,
                          "formOutputMethod",
                          this.getCurrency
                        ) +
                        "</div>";
                    }
                  }
                );
                result += "<div class='calc__result-block-delimiter'></div>";
              }
            });
          }
        } else {
          const data = parseResultValueObjectItem(
            item,
            "formOutputMethod",
            this.getCurrency
          );
          if (data.length) {
            result +=
              "<div class='calc__result-block-field-wrapper'> " +
              data +
              "</div>";
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
      if (!this.displayResultData || this.isExistGlobalErrorsValidationIgnoreHiddenElement) {
        this.tryPassDependency("_globalSum_", null, false, null, "App_calc");
        return null;
      }
      let resultSum = null;
      if (this.isUseFormula && this.mainFormulaIsExist) {
        resultSum = this.combinedFormulaDataTogether;
      } else {
        resultSum = this.baseDataForCalculate.reduce((sum, item) => {
          if (item.cost !== null && !item.excludeFromCalculations) {
            return sum + parseFloat(item.cost);
          }
          return sum + 0;
        }, 0);
      }
      this.tryPassDependency("_globalSum_", resultSum, Boolean(resultSum !== null), resultSum, "App_calc");
      return resultSum;
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
        const titleSumma = !!this.outOptions?.resultOptions?.titleSumma
          ? this.outOptions?.resultOptions?.titleSumma
          : "";
        result +=
          "\n" +
          "<div class='calc__result-block-field-summ'>" +
          "<div class='calc__result-block-field-summ-title'>" +
          titleSumma +
          "</div>" +
          "<div class='calc__result-block-field-summ-cost'> " +
          this.finalSummaForOutput +
          "</div>" +
          "<div class='calc__result-block-field-summ-currency'> " +
          this.getCurrency +
          "</div>" +
          "</div>";
      }
      return result;
    },

    finalTextForOutputForTeleport() {
      return this.finalTextForOutput.replaceAll(/<\/?[a-z][^>]*(>|$)/gi, "");
    },
    /**
     * Отобразить блок с текстом о наличии ошибок,
     * если ошибки есть и глобально разрешено их отображение
     * @returns {false|boolean}
     */
    showErrorTextBlock() {
      return Boolean(
        this.isExistGlobalErrorsValidationIgnoreHiddenElement &&
        this.isCanShowAllTooltips
      );
    },
    isEnabledSendForm() {
      return (
        this.checkInitEnabledSendForm &&
        this.finalTextForOutput?.length &&
        !this.isExistGlobalErrorsValidationIgnoreHiddenElement &&
        !this.showErrorSummaBlock
      );
    },
    /**
     * Отправить данные в форму если нет ошибок валидации и разрешена отправка
     * @returns {null|false|(function({initEnabledSendForm: *}): *)|*}
     */
    allowTeleport() {
      return Boolean(
        this.submitResult &&
        !this.isExistGlobalErrorsValidationIgnoreHiddenElement &&
        this.checkInitEnabledSendForm
      );
    },
    showErrorSummaBlock() {
      return Boolean(
        (this.finalSummaForOutput === null ||
          this.finalSummaForOutput === false) &&
        this.isCanShowAllTooltips &&
        this.displayResultData
      );
    },
    showFormIsAllow() {
      if (this.formElement === false || this.methodWorksForm === "hidden") {
        return false;
      }

      if (this.methodWorksForm === "show") {
        return true;
      }

      return Boolean(
        !this.isExistGlobalErrorsValidationIgnoreHiddenElement &&
        this.checkInitEnabledSendForm &&
        this.checkAllowShowResultBlock
      );
    },
  },
};
</script>

<style lang="scss">
//$c_base_title                   : var(--c_base_title);
//$c_base_error_color             : var(--c_base_error_color);
//$c_base_error_bg                : var(--c_base_error_bg);
//$c_base_error_border            : var(--c_base_error_border);
//$c_base_error_border_radius     : var(--c_base_error_border_radius);
//$c_base_error_border_width      : var(--c_base_error_border_width);
//
//$c_base_button_text_color        : var(--c_base_button_text_color);
//$c_base_button_text_color_hover  : var(--c_base_button_text_color_hover);
//
//$c_base_button_bg                : var(--c_base_button_bg);
//$c_base_button_bg_hover          : var(--c_base_button_bg_hover);
//
//$c_base_button_border            : var(--c_base_button_border);
//$c_base_button_border_hover      : var(--c_base_button_border_hover);
//
//$c_base_button_border_radius     : var(--c_base_button_border_radius);
//$c_base_button_border_width      : var(--c_base_button_border_width);

$c_base_title: #000000;
$c_base_error_color: #e80000;
$c_base_error_bg: #ffffff;
$c_base_error_border: #e80000;
$c_base_error_border_radius: 5px;
$c_base_error_border_width: 1px;

$c_base_button_text_color: #ffffff;
$c_base_button_text_color_hover: #ffffff;

$c_base_button_bg: #464657;
$c_base_button_bg_hover: #ff5e00;

$c_base_button_border: #464657;
$c_base_button_border_hover: #ff5e00;

$c_base_button_border_radius: 5px;
$c_base_button_border_width: 1px;

//$c_decor_text_default           : var(--c_decor_text_default);
//$c_decor_text_hover             : var(--c_decor_text_hover);
//$c_decor_text_selected          : var(--c_decor_text_selected);

//$c_decor_bg_color               : var(--c_decor_bg_color);
//$c_decor_bg_color_hover         : var(--c_decor_bg_color_hover);
//$c_decor_bg_color_selected      : var(--c_decor_bg_color_selected);

//$c_decor_border_color           : var(--c_decor_border_color);
//$c_decor_border_color_hover     : var(--c_decor_border_color_hover);
//$c_decor_border_color_selected  : var(--c_decor_border_color_selected);
//$c_decor_border_radius          : var(--c_decor_border_radius);
//$c_decor_border_width           : var(--c_decor_border_width);

$c_decor_text_default: #000000;
$c_decor_text_hover: #ff5e00;
$c_decor_text_selected: #ffffff;

$c_decor_bg_color: #f9f9f9;
$c_decor_bg_color_hover: #f9f9f9;
$c_decor_bg_color_selected: #ff6531;

$c_decor_border_color: #cccccc;
$c_decor_border_color_hover: #ff6531;
$c_decor_border_color_selected: #ff6531;
$c_decor_border_radius: 5px;
$c_decor_border_width: 1px;

//$c_element_text_default            : var(--c_element_text_default);
//$c_element_text_hover              : var(--c_element_text_hover);
//$c_element_text_selected           : var(--c_element_text_selected);

//$c_element_bg_color                : var(--c_element_bg_color);
//$c_element_bg_color_hover          : var(--c_element_bg_color_hover);
//$c_element_bg_color_selected       : var(--c_element_bg_color_selected);

//$c_element_border_color            : var(--c_element_border_color);
//$c_element_border_color_hover      : var(--c_element_border_color_hover);
//$c_element_border_color_selected   : var(--c_element_border_color_selected);
//$c_element_border_radius           : var(--c_element_border_radius);
//$c_element_border_width            : var(--c_element_border_width);

//$c_element_input_color             : var(--c_element_input_color);
//$c_element_range_color             : var(--c_element_range_color);

$c_element_text_default: #000000;
$c_element_text_hover: #ff5e00;
$c_element_text_selected: #ffffff;

$c_element_bg_color: #f9f9f9;
$c_element_bg_color_hover: #f9f9f9;
$c_element_bg_color_selected: #ff6531;

$c_element_border_color: #cccccc;
$c_element_border_color_hover: #ff6531;
$c_element_border_color_selected: #ff6531;
$c_element_border_radius: 5px;
$c_element_border_width: 1px;

$c_element_input_color: #f9f9f9;
$c_element_range_color: #cccccc;

//$c_prompt_popup_text                : var(--c_prompt_popup_text);
//$c_prompt_popup_border              : var(--c_prompt_popup_border);
//$c_prompt_popup_bg                  : var(--c_prompt_popup_bg);

//$c_prompt_decor_sign_color          : var(--c_prompt_decor_sign_color);
//$c_prompt_decor_sign_color_hover    : var(--c_prompt_decor_sign_color_hover);
//$c_prompt_decor_sing_bg             : var(--c_prompt_decor_sing_bg);
//$c_prompt_decor_sing_bg_hover       : var(--c_prompt_decor_sing_bg_hover);

//$c_prompt_element_sign_color        : var(--c_prompt_element_sign_color);
//$c_prompt_element_sign_color_hover  : var(--c_prompt_element_sign_color_hover);
//$c_prompt_element_sing_bg           : var(--c_prompt_element_sing_bg);
//$c_prompt_element_sing_bg_hover     : var(--c_prompt_element_sing_bg_hover);

$c_prompt_popup_text: #000000;
$c_prompt_popup_border: #ff6531;
$c_prompt_popup_bg: #ffffff;

$c_prompt_decor_sign_color: #ff6531;
$c_prompt_decor_sign_color_hover: #ffffff;
$c_prompt_decor_sing_bg: #ffffff;
$c_prompt_decor_sing_bg_hover: #ff6531;

$c_prompt_element_sign_color: #ff6531;
$c_prompt_element_sign_color_hover: #ffffff;
$c_prompt_element_sing_bg: #ffffff;
$c_prompt_element_sing_bg_hover: #ff6531;

@mixin style-decor-border-radius {
  border-radius: $c_decor_border_radius;
}

@mixin style-title-main {
  font-size: 17px;
  line-height: 20px;
  color: $c_base_title;
}

@mixin style-label-sub {
  font-size: 12px;
  line-height: 14px;
  color: $c_base_title;
}

@mixin transition {
  transition: all 0.2s ease-in-out;
}

@mixin style-prompt-absolute-shift {
  position: absolute;
  top: 0;
  right: 0;
  margin: 5px;
}

@mixin style-element-main-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  width: 100%;
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
  }
}

* {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: 0;
}

.main-wrapper {
  max-width: 980px;
  margin: 0 auto;
  background-color: #dadada;
  padding: 3px;
  border: 1px solid black;
}

.calc {
  position: relative;
  * {
    margin: 0;
    box-sizing: border-box;
  }
  &__form .tpl-anketa {
    display: flex;
    flex-direction: column;
  }

  &__wrapper {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin: 10px;
    &-group-data {
      display: flex;
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
    background-color: $c_base_error_color;
    color: $c_base_error_bg;
    margin: 20px;
  }
  &__show-result-btn {
    padding: 21px 70px;
    background-color: $c_base_button_bg;
    color: $c_base_button_text_color;
    border: $c_base_button_border_width solid $c_base_button_border;
    align-self: center;
    display: flex;
    gap: 20px;
    align-items: center;
    font-weight: 900;
    font-size: 17px;
    line-height: 23px;
    text-transform: uppercase;
    cursor: pointer;
    @include style-decor-border-radius;
    &:hover {
      background-color: $c_decor_bg_color_selected;
      color: $c_decor_text_selected;
      border-color: $c_decor_border_color_selected;
    }
    @media all and (max-width: 480px) {
      padding: 11px 50px;
    }
  }
  //--------Стили input text-----
  &__input {
    &-wrapper {
      @include style-element-main-wrapper;
      &.is-stretch {
        flex: 1 1 100%;
      }
      &-data {
        display: flex;
        align-items: center;
        position: relative;
        gap: 2px;
        flex: 1 1 100%;
      }
      &.column {
        flex-direction: column;
        align-items: flex-start;
      }
    }

    &-label {
      &-text {
        @include style-title-main;
        align-items: flex-start;
        display: flex;
        gap: 2px;
      }
    }

    &-item {
      font-size: 16px;
      line-height: 20px;
      padding: 20px 35px;
      max-width: 304px;
      background: $c_element_input_color;
      color: $c_element_text_default;
      border: $c_element_border-width solid $c_element_border_color;
      text-align: center;
      border-radius: $c_element_border_radius;
      @media all and (max-width: 480px) {
        padding: 10px 15px;
      }
      &:focus,
      &:hover {
        outline: none;
        border-color: $c_element_border_color_hover;
        background: $c_element_bg_color_hover;
        color: $c_element_text_hover;
      }
      &.is-number {
        max-width: 150px;
        padding: 20px 15px;
        @media all and (max-width: 480px) {
          padding: 10px 15px;
        }
      }

      &.error {
        outline-color: $c_base_error_color;
        border-color: $c_base_error_color;
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
        color: $c_base_title;
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
          opacity: 0.6;
          &:hover {
            cursor: not-allowed;
          }
        }
      }
    }
    &-unit {
      margin-left: 5px;
      font-size: 17px;
      line-height: 20px;
      color: $c_element_text_default;
    }
  }
  //--------Стили RANGE-----

  &__range {
    &-wrapper {
      @include style-element-main-wrapper;
      &.column {
        flex-direction: column;
        align-items: flex-start;
      }
    }
    &-label {
      &-text {
        @include style-title-main;
        display: flex;
        align-items: flex-start;
        gap: 2px;
      }
    }
    &-item-left-side {
      width: 100%;
      display: flex;
      flex-direction: column;
      position: relative;
    }

    &-unit {
      font-size: 17px;
      line-height: 20px;
      color: $c_element_text_default;
    }
    &-item {
      &-wrapper {
        display: flex;
        align-items: baseline;
        gap: 32px;
        width: 100%;
      }

      -webkit-appearance: none;
      appearance: none;
      border-radius: 90px;
      cursor: pointer;
      width: 100%;
      &:focus {
        outline: none;
      }

      &::-webkit-slider-runnable-track {
        background-color: $c_element_range_color;
        height: 8px;
        border-radius: 90px;
      }

      &::-moz-range-track {
        background-color: $c_element_range_color;
        height: 8px;
        border-radius: 90px;
      }

      &::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        height: 24px;
        width: 24px;
        border-radius: 50%;
        background-color: $c_element_bg_color_selected;
        border: 4px solid $c_element_border_color_selected;
        box-shadow: 0 7px 11px -4px $c_element_border_color_selected;
        margin-top: -10px;

        &:hover {
          background-color: $c_element_bg_color_hover;
          border: 4px solid $c_element_border_color_hover;
          box-shadow: 0 7px 11px -4px $c_element_border_color_hover;
        }
      }

      &::-moz-range-thumb {
        -webkit-appearance: none;
        appearance: none;
        height: 24px;
        width: 24px;
        border-radius: 50%;
        background-color: $c_element_bg_color_selected;
        border: 4px solid $c_element_border_color_selected;
        box-shadow: 0 7px 11px -4px $c_element_border_color_selected;
        margin-top: -16px;
        &:hover {
          background-color: $c_element_bg_color_hover;
          border: 4px solid $c_element_border_color_hover;
          box-shadow: 0 7px 11px -4px $c_element_border_color_hover;
        }
      }
      &.isError {
        &::-moz-range-thumb {
          border-color: $c_base_error_color;
        }
        &::-webkit-slider-thumb {
          border-color: $c_base_error_color;
        }
      }
    }
    &-steps {
      &-wrapper {
        display: flex;
        align-items: center;
        height: 22px;
        position: relative;
        margin-top: 11px;
        -moz-user-select: none;
        -webkit-user-select: none;
        user-select: none;
        @media all and (max-width: 480px) {
          display: none;
        }
      }
      &-item {
        position: absolute;
        cursor: pointer;
        &-value {
          font-size: 12px;
          line-height: 12px;
          color: $c_base_title;
          position: absolute;
          z-index: 10;
          left: 50%;
          transform: translateX(-50%);
        }
        &:after {
          position: absolute;
          content: "";
          display: block;
          width: 1px;
          z-index: 10;
          background-color: $c_base_title;
          left: 50%;
          transform: translateX(-50%);
          height: 10px;
          bottom: calc(100% + 2px);
        }
        &_selected {
          .calc__range-steps-item-value {
            font-size: 15px;
            line-height: 15px;
            font-weight: 700;
          }
          &:after {
            width: 2px;
          }
        }
        &:hover {
          .calc__range-steps-item-value {
            color: $c_element_text_hover;
            font-weight: 700;
          }
          &:after {
            background-color: $c_element_text_hover;
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
        color: $c_element_text_default;
        background-color: $c_element_bg_color;
        border: 1px solid $c_element_border_color;
        min-width: 26px;
        min-height: 26px;
        border-radius: 50%;
        position: absolute;
        z-index: 15;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 14px;
        line-height: 16px;
        top: 15px;
        &:hover {
          color: $c_element_text_hover;
          background-color: $c_element_bg_color_hover;
          border: 1px solid $c_element_border_color_hover;
        }
      }
      &-dynamic {
        font-weight: normal;
        font-size: 16px;
        line-height: 20px;
        padding: 20px 20px;
        max-width: 90px;
        right: 0;
        border: $c_base_error_border_width solid $c_element_border_color;

        outline: none;
        color: $c_element_text_default;
        background: $c_element_input_color;
        text-align: center;
        border-radius: $c_element_border_radius;
        &:hover {
          color: $c_element_text_hover;
          background-color: $c_element_bg_color_hover;
        }
        @media all and (max-width: 480px) {
          padding: 10px 10px;
        }
        &:hover,
        &:focus-visible {
          outline: none;
          border-color: $c_element_border_color_hover;
          background: $c_element_bg_color_hover;
          color: $c_element_text_hover;
        }
        &.isError {
          border-color: $c_base_error_border;
          outline-color: $c_base_error_color;
        }
      }
    }
  }

  //---------Стили select-----
  &__select {
    &-wrapper {
      @include style-element-main-wrapper;
      &.column {
        flex-direction: column;
        align-items: flex-start;
      }
      &.open {
        .calc__select-arrow {
          border-color: $c_element_text_default;
          transform: rotate(-135deg);
          -webkit-transform: rotate(-135deg);
        }
        .calc__select-change-item {
          border-color: $c_element_border_color;
          border-bottom-left-radius: 0;
          border-bottom-right-radius: 0;
        }
        .calc__select-option-wrapper {
          border-color: $c_element_border_color;
        }
      }
      @media all and (max-width: 480px) {
        flex-direction: column;
        align-items: flex-start;
      }
    }
    &-label {
      &-text {
        @include style-title-main;
        align-items: flex-start;
        display: flex;
        gap: 2px;
      }
    }
    &-change {
      &-wrapper {
        cursor: pointer;
        font-size: 15px;
        line-height: 16px;
        position: relative;
        flex: 1 1 100%;
        min-width: 30%;
        @media all and (max-width: 480px) {
          width: 100%;
        }
        &.error {
          .calc__select-change-item {
            border-color: $c_base_error_color;
            color: $c_base_error_color;
          }
          .calc__select-arrow {
            border-color: $c_base_error_color;
          }
          .calc__select-option-wrapper {
            border-color: $c_base_error_color;
          }
        }
      }
      &-item {
        color: $c_element_text_default;
        border-radius: $c_element_border_radius;
        border: $c_element_border_width solid $c_element_border_color;
        background-color: $c_element_bg_color;
        padding: 20px 40px;
        font-weight: 400;
        font-size: 16px;
        line-height: 20px;
        gap: 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        text-align: start;
        position: relative;
        &:hover {
          border-color: $c_element_border_color_hover;
          background-color: $c_element_bg_color_hover;
          color: $c_element_text_hover;
          .calc__select-arrow {
            border-color: $c_element_text_hover;
          }
        }

        .calc__select-arrow {
          width: 10px;
          height: 10px;
          border: solid $c_element_text_default;
          border-width: 0 $c_element_border_width $c_element_border_width 0;
          display: inline-block;
          margin-left: auto;
          flex: 0 0 auto;
          transform: rotate(45deg);
          -webkit-transform: rotate(45deg);
        }

        .calc__prompt-wrapper {
          @include style-prompt-absolute-shift;
        }
      }
    }
    &-option {
      &-wrapper {
        display: flex;
        flex-direction: column;
        position: absolute;
        top: calc(100% - $c_element_border_width);
        border-bottom-left-radius: $c_element_border-radius;
        border-bottom-right-radius: $c_element_border-radius;
        z-index: 99;
        left: 50%;
        overflow: hidden;
        transform: translateX(-50%);
        border-left: $c_element_border_width solid
          $c_element_border_color_selected;
        border-right: $c_element_border_width solid
          $c_element_border_color_selected;
        border-bottom: $c_element_border_width solid
          $c_element_border_color_selected;
        .calc__select-image-wrapper {
          margin: 5px;
        }
        &:hover {
        }
      }
      &-item {
        background-color: $c_element_bg_color;
        display: flex;
        align-items: center;
        gap: 20px;
        text-align: start;
        padding: 10px 40px;
        cursor: pointer;
        width: 100%;
        position: relative;
        &-text {
          font-weight: 400;
          font-size: 16px;
          line-height: 20px;
          text-align: start;
          color: $c_element_text_default;
        }
        &:hover {
          background-color: $c_element_bg_color_hover;
          .calc__select-option-item-text {
            color: $c_element_text_hover;
          }
        }
        .calc__prompt-wrapper {
          @include style-prompt-absolute-shift;
        }
      }
    }
  }

  //-----------------Радио кнопки ---------------
  &__radio {
    &-wrapper {
      @include style-element-main-wrapper;
    &-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
        flex: 1 1 100%;
      }
      &.column {
        flex-direction: column;
        align-items: flex-start;
      }
      &.base {
        .calc__radio-indicator {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 1px solid $c_element_text_default;
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
    &-label-text {
      @include style-title-main;
      align-items: flex-start;
      display: flex;
      gap: 2px;
    }
    &-label-button {
      display: flex;
      position: relative;
      align-items: center;
      justify-content: center;
      padding: 21px 35px;
      background-color: $c_element_bg_color;
      border-radius: $c_element_border_radius;
      border: $c_element_border_width solid $c_element_border_color;
      cursor: pointer;
      @include transition;
      gap: 8px;
      text-align: start;
      .calc__icon-element-label-wrapper {
        flex: none;
      }
      @media all and (max-width: 480px) {
        padding: 11px 15px;
      }
      &.onlyImage {
        padding: 10px;
      }
      &.isShowPrompt {
        padding-right: 35px;
      }
      .calc__prompt-wrapper {
        @include style-prompt-absolute-shift;
      }
      &:hover {
        background-color: $c_element_bg_color_hover;
        border-color: $c_element_border_color_hover;
        .calc__radio-name,
        .calc__radio-subname {
          color: $c_element_text_hover;
        }
        .calc__radio-indicator {
          border-color: $c_element_text_hover;
          &:after {
            background-color: $c_element_text_hover;
          }
        }
      }
      &.checked {
        background-color: $c_element_bg_color_selected;
        border-color: $c_element_border_color_selected;
        .calc__radio-name,
        .calc__radio-subname {
          color: $c_element_text_selected;
        }
        .calc__radio-indicator {
          border-color: $c_element_text_selected;
          &:after {
            background-color: $c_element_text_selected;
          }
        }
      }
      &.error {
        border-color: $c_base_error_color;
        .calc__radio-text {
          color: $c_base_error_color;
        }
        .calc__radio-indicator {
          border-color: $c_base_error_color;
          &:after {
            background-color: $c_base_error_color;
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
      color: $c_element_text_default;
    }
    &-subname {
      @include style-label-sub;
      color: $c_element_text_default;
    }
  }

  //--------Стили чекбокса --------------
  &__checkbox {
    &-wrapper {
      @include style-element-main-wrapper;
      &.column {
        flex-direction: column;
        align-items: flex-start;
      }
    }
    &-label {
      &-text {
        @include style-title-main;
        align-items: flex-start;
        display: flex;
        gap: 2px;
      }
    }

    &-control {
      &-wrapper {
        -moz-user-select: none;
        -webkit-user-select: none;
        user-select: none;
        position: relative;
        align-items: center;
        display: flex;
        cursor: pointer;
        flex: 1 1 100%;
      }
      &-text,
      &-text_checked {
        display: flex;
        align-items: center;
        @include style-title-main;
        color: $c_element_text_default;
      }

      &-base {
        @include transition;
        position: relative;
        display: flex;
        justify-content: center;
        gap: 2px;
        font-size: 16px;
        line-height: 20px;
        align-items: center;
        &.switcher {
          @media all and (max-width: 480px) {
            flex-direction: column;
          }
        }
      }
      &-button {
        border: $c_element_border_width solid $c_element_border_color;
        background-color: $c_element_bg_color;
        color: $c_element_text_default;
        padding: 20px 35px;
        display: flex;
        align-items: center;
        position: relative;
        @media all and (max-width: 480px) {
          padding: 10px 15px;
        }
        @include style-decor-border-radius;
        &:hover {
          background-color: $c_element_bg_color_hover;
          color: $c_element_text_hover;
          border-color: $c_element_border_color_hover;
        }
        &.checked {
          background-color: $c_element_bg_color_selected;
          color: $c_element_text_selected;
          border-color: $c_element_border_color_selected;
        }
        &.error {
          color: $c_base_error_color;
          border-color: $c_base_error_color;
        }
        .calc__prompt-wrapper {
          @include style-prompt-absolute-shift;
        }
      }
      &-element {
        margin: 0 8px;
        display: flex;
        flex: 1 0 auto;
        &.base {
          @include transition;
          width: 24px;
          height: 24px;
          border-radius: 4px;
          border: 2px solid $c_element_border_color;
          position: relative;
          &:after {
            content: "";
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            width: 10px;
            height: 10px;
          }
          &.checked {
            @include transition;
            border-color: $c_element_border_color_selected;
            &:after {
              @include transition;
              background-color: $c_element_border_color_selected;
            }
          }
          &:hover {
            @include transition;
            border-color: $c_element_border_color_hover;
            &:after {
              @include transition;
              background-color: $c_element_border_color_hover;
            }
          }
          &.error {
            @include transition;
            border-color: $c_base_error_color;
            &:after {
              @include transition;
              background-color: $c_base_error_color;
            }
          }
        }
        &.switcher {
          display: inline-block;
          @include transition;
          height: 26px;
          width: 50px;
          position: relative;
          border-radius: 90px;
          background: $c_element_bg_color;
          border: 1px solid $c_element_border_color;
          &:hover {
            border-color: $c_element_border_color_hover;
            &:not(.checked):before {
              border-color: $c_element_border_color_hover;
              background-color: $c_element_bg_color_hover;
            }
          }
          &:not(.checked):before,
          &.checked:after {
            @include transition;
            content: "";
            display: inline-block;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            position: absolute;
          }
          &:not(.checked):before {
            border: 1px solid $c_element_border_color;
            background-color: $c_element_bg_color;
            left: 5px;
            top: 50%;
            transform: translateY(-50%);
          }
          &.checked {
            border-color: $c_element_border_color_selected;
            &:after {
              border: 1px solid $c_element_border_color_selected;
              background-color: $c_element_bg_color_selected;
              right: 5px;
              top: 50%;
              transform: translateY(-50%);
            }
          }
          &.error {
            border-color: $c_base_error_color;
            &:not(.checked):before {
              border-color: $c_base_error_color;
            }
          }
        }
        &.switcher-vertical {
          height: 50px;
          width: 26px;
          &:not(.checked):before {
            right: 0;
            bottom: 5px;
            left: 50%;
            transform: translate(-50%, 0);
          }
          &.checked:after {
            top: 5px;
            left: 50%;
            transform: translate(-50%, 0);
            border: 1px solid $c_element_border_color_selected;
          }
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
      cursor: pointer;
      width: 20px;
      height: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: $c_prompt_element_sing_bg;
      color: $c_prompt_element_sign_color;
      border: 1px solid $c_prompt_element_sign_color;
      border-radius: 50%;
      line-height: 20px;
      font-size: 12px;
      text-align: center;
      &:hover {
        background-color: $c_prompt_element_sing_bg_hover;
        color: $c_prompt_element_sign_color_hover;
        border-color: $c_prompt_element_sign_color_hover;
      }
      &.decor {
        background-color: $c_prompt_decor_sing_bg;
        color: $c_prompt_decor_sign_color;
        border: 1px solid $c_prompt_decor_sign_color;
        &:hover {
          background-color: $c_prompt_decor_sing_bg_hover;
          color: $c_prompt_decor_sign_color_hover;
          border-color: $c_prompt_decor_sign_color_hover;
        }
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
      background-color: $c_prompt_popup_bg;
      color: $c_prompt_popup_text;
      padding: 13px;
      max-width: 80%;
      overflow-y: auto;
      border: 1px solid $c_prompt_popup_border;
      @include style-decor-border-radius;
      box-shadow: 0 4px 10px $c_prompt_popup_border;
    }
  }

  // -------tooltip сообщение об ошибке внутри элемента
  &__tooltip {
    &-wrapper {
      display: flex;
      position: absolute;
      color: $c_base_error_color;
      z-index: 100;
      border-radius: $c_base_error_border_radius;
      border: $c_base_error_border_width solid $c_base_error_border;
      box-shadow: 0 0 3px 0 $c_base_error_border;
      bottom: calc(100% + 10px);
      left: 50%;
      transform: translateX(-50%);
      background-color: $c_base_error_bg;
      padding: 21px 35px;
      @media all and (max-width: 480px) {
        padding: 11px 15px;
      }
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
      background-color: $c_base_error_bg;
      position: absolute;
      border-radius: 4px;
      z-index: -1;
      right: calc(50% - 10px);
      top: calc(100% - 12px);
      transform: translateX(-50%) rotate(45deg);
      border-bottom: $c_base_error_border_width solid $c_base_error_border;
      border-right: $c_base_error_border_width solid $c_base_error_border;
      display: block;
    }
    &-text {
      display: flex;
      color: $c_base_error_color;
      border-radius: $c_base_error_border_radius;
      justify-content: center;
      min-width: 300px;
    }
  }

  //---------------аккордеон----------------
  &__accordion {
    &-main-label {
      @include style-title-main;
    }
    &-wrapper {
      display: flex;
      gap: 8px;
      position: relative;
      width: 100%;
      flex-direction: column;
      &:hover {
        .open.calc__accordion-item-label {
          border-color: $c_decor_border_color_selected;
          border-bottom-color: transparent;
          color: $c_decor_text_selected;
          background-color: $c_decor_bg_color_selected;
        }
      }
    }
    &-item {
      &-label {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 19px 6px 21px 20px;
        min-height: 60px;
        background-color: $c_decor_bg_color;
        border: $c_decor_border_width solid $c_decor_border_color;
        cursor: pointer;
        @include style-decor-border-radius;
        @include transition;
        text-align: start;
        position: relative;
        @media all and (max-width: 480px) {
          padding: 10px 15px;
        }
        &.open {
          margin-bottom: 0;
          .calc__accordion-item-label-sub,
          .calc__accordion-item-label-main,
          .calc__accordion-item-plus:before,
          .calc__accordion-item-minus:before {
            color: $c_decor_text_selected;
          }
          border-color: $c_decor_border_color_selected;
          color: $c_decor_text_selected;
          background-color: $c_decor_bg_color_selected;
          border-bottom-color: transparent;
          border-bottom-left-radius: 0;
          border-bottom-right-radius: 0;
        }
        &:hover:not(.open) {
          background-color: $c_decor_bg_color_hover;
          border-color: $c_decor_border_color_hover;
          .calc__accordion-item-label-sub,
          .calc__accordion-item-label-main,
          .calc__accordion-item-plus:before,
          .calc__accordion-item-minus:before {
            color: $c_decor_text_hover;
          }
        }

        &.error {
          border-color: $c_base_error_color;
          .calc__accordion-item-label-main {
            color: $c_base_error_color;
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
          @include style-title-main;
          color: $c_decor_text_default;
        }
        &-sub {
          @include style-label-sub;
          color: $c_decor_text_default;
        }
        .calc__prompt-wrapper {
          @include style-prompt-absolute-shift;
        }
      }
      &-content {
        margin-top: -$c_decor_border_width - 8px;
        width: 100%;
        border: $c_decor_border_width solid $c_decor_border_color_selected;
        border-bottom-left-radius: $c_decor_border_radius;
        border-bottom-right-radius: $c_decor_border_radius;
        border-top-color: transparent;
        position: relative;
        @include transition;
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
        padding-right: 60px;
      }
      &-plus:before,
      &-minus:before {
        font-size: 24px;
        font-weight: 600;
        position: absolute;
        color: $c_decor_text_default;
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
      @include style-title-main;
    }
    &-wrapper {
      @include style-element-main-wrapper;
      flex-direction: column;
      align-items: start;
    }
    &-item {
      &-label {
        @include style-decor-border-radius;
        background-color: $c_decor_bg_color;
        border: $c_decor_border_width solid $c_decor_border_color;
        display: flex;
        align-items: center;
        padding: 19px 54px;
        cursor: pointer;
        gap: 20px;
        position: relative;
        flex: 1 1 auto;
        @media all and (max-width: 480px) {
          padding: 10px 15px;
        }
        &:hover {
          background-color: $c_decor_bg_color_hover;
          border-color: $c_decor_border_color_hover;
          .calc__tab-item-label-main,
          .calc__tab-item-label-sub {
            color: $c_decor_text_hover;
          }
        }
        &.isOpen {
          background-color: $c_decor_bg_color_selected;
          border-color: $c_decor_border_color_selected;
          .calc__tab-item-label-main,
          .calc__tab-item-label-sub {
            color: $c_decor_text_selected;
          }
        }
        &.isError {
          border-color: $c_base_error_color;
          .calc__tab-item-label-main,
          .calc__tab-item-label-sub {
            color: $c_base_error_color;
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
          @include style-title-main;
          color: $c_decor_text_default;
        }

        &-sub {
          @include style-label-sub;
          color: $c_decor_text_default;
        }
        .calc__prompt-wrapper {
          @include style-prompt-absolute-shift;;
        }
      }
      &-content-wrapper {
        display: flex;
        flex-direction: column;
        width: 100%;
        padding: 20px 0;
        margin-bottom: 10px;
        position: relative;
      }
      &-content {
        display: flex;
        width: 100%;
        flex-direction: column;
        align-items: flex-start;
      }
    }
  }

  &__block-section {
    &-label {
      &-wrapper {
        display: flex;
        flex: 1 1 100%;
        border-bottom: 1px dashed $c_decor_border_color;
      }
      &_text {
        display: flex;
        flex-direction: column;
      }
      &_main {
        @include style-title-main;
        font-size: 21px;
      }
      &_sub {
        @include style-label-sub;
      }
      &-desktop {
        width: 100%;
        display: flex;
        @media all and (max-width: 768px) {
          display: none;
        }
      }
    }

    &-wrapper {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 100%;
      @include style-decor-border-radius;
      &.isVisualSeparate {
        box-shadow: 0 0 25px -10px $c_decor_text_default;
        padding: 10px;
      }
    }
    &-content-wrapper {
      position: relative;
      display: flex;
      flex-direction: column;
      width: 100%;
    }
  }

  &__columns {
    &-wrapper {
      display: flex;
      flex-direction: column;
      width: 100%;
      gap: 8px;
    }
    &-label {
      &-text {
        @include style-title-main;
      }
    }
    &-column {
      &-wrapper {
        display: flex;
        flex-wrap: wrap;
        width: 100%;
      }
      &-label {
        @include style-title-main;
      }
      &-item {
        display: flex;
        flex: 1 0 auto;
        flex-direction: column;
        width: 100%;
      }
    }
  }

  //----------Системный блок с общим набором ошибок----------------
  .calc__error {
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
      @include style-decor-border-radius;
      background-color: $c_decor_bg_color;
      border: $c_decor_border_width solid $c_decor_border_color;
      color: $c_decor_text_default;
      cursor: pointer;
    }
    &-checkbox {
      &-label {
        display: flex;
      }
      &-text {
        color: $c_decor_text_default;
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
      background-color: $c_decor_bg_color;
      padding: 10px;
      border: $c_decor_border_width solid $c_decor_border_color;
      @include style-decor-border-radius;
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
      color: $c_decor_text_default;
      font-weight: bold;
      margin-top: 35px;
    }
    &-item {
      color: $c_decor_text_default;
      display: flex;
      flex-direction: column;
      margin: 5px 0;
      &-name {
        color: $c_decor_text_default;
      }
    }
    &-alert {
      color: $c_decor_text_default;
      font-weight: bold;
      margin-top: 15px;
      font-size: 18px;
    }
  }

  //----------Элемент image--------------
  &__image {
    &-wrapper {
      @include style-element-main-wrapper;
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
      @include style-title-main;
      &-wrapper {
        display: flex;
        margin: 5px 0;
      }
    }
  }

  &__result-block {
    &-wrapper {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      margin-bottom: 10px;
      width: 100%;
      position: relative;
      overflow: hidden;
      &.isVisualSeparate {
        margin: 20px 10px;
        box-shadow: 0 0 25px -10px $c_decor_text_default;
        padding: 15px;
        width: calc(100% - 20px);
      }
    }
    &-title {
      &-wrapper {
        display: flex;
        flex-direction: column;
        width: 100%;
        margin-bottom: 10px;
        gap: 8px;
        border-bottom: 1px dashed $c_decor_text_default;
      }
      &-main {
        @include style-title-main;
        margin-top: 20px;
        font-size: 21px;
      }
      &-sub {
        @include style-label-sub;
        margin-bottom: 10px;
      }
    }
    &-data {
      color: $c_base_title;
      display: flex;
      flex-direction: column;
      align-items: start;
      padding: 10px 0;
      margin: 10px 0;
      width: 100%;
    }

    &-field {
      &-wrapper {
        display: flex;
        width: 100%;
        padding: 4px 0;
        @media all and (max-width: 768px) {
          flex-direction: column;
        }
        &:hover {
          background-color: $c_decor_bg_color_hover;
          color: $c_decor_text_hover;
        }
      }
      &-label {
        width: 50%;
        white-space: pre-wrap;
        @media all and (max-width: 768px) {
          width: 100%;
        }
      }
      &-right {
        display: flex;
        width: 50%;
        white-space: pre-wrap;
        @media all and (max-width: 768px) {
          width: 100%;
        }
      }
      //&-value {
      //  font-weight: bold;
      //}
      //&-cost {
      //  font-weight: bold;
      //}
      &-summ {
        @include style-title-main;
        margin: 20px 0;
        display: flex;
        white-space: pre-wrap;
        align-items: baseline;
        &-cost {
          font-size: 25px;
        }
      }
    }
    &-delimiter {
      display: flex;
      width: 80%;
      border-bottom: 1px dotted black;
      margin: 10px 0;
    }
  }

  //-------------Элемент дупликатора-----------------
  &__duplicator {
    width: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
    margin-bottom: 5px;
    &-wrapper {
      position: relative;
      padding: 50px 0 10px;
      border-bottom: 2px groove $c_decor_border_color;
      margin-bottom: 10px;
      .calc__icon-element-label-wrapper {
        margin-bottom: 8px;
      }
      &:hover {
        border-color: $c_decor_border_color_selected;
      }
    }
    &-label {
      @include style-title-main;
      text-align: center;
    }
    &-duplicate,
    &-delete {
      cursor: pointer;
      position: absolute;
      display: flex;
      right: 0;
      top: 0;
      background-color: $c_decor_bg_color;
      color: $c_decor_text_default;
      border: $c_decor_border_width solid $c_decor_border_color;
      padding: 10px;
      @include style-decor-border-radius;
    }
    &-duplicate {
      &:hover {
        background-color: $c_decor_bg_color_hover;
        color: $c_decor_text_hover;
        border-color: $c_decor_border_color_hover;
      }
    }
    &-delete {
      color: $c_base_error_bg;
      background-color: $c_base_error_color;
    }
  }
  &__dev-block {
    &-wrapper {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      padding: 10px;
      border: 1px dotted gray;
      width: calc(100% - 30px);
      margin-bottom: 10px;
      background-color: #fff;
    }
    &-element {
      color: #000;
      padding: 1px 5px;
      &-name {
        background-color: red;
        color: white;
      }
      &-value {
        background-color: blue;
        color: white;
      }
      &-show {
        background-color: orange;
      }
      &-cost {
        background-color: yellow;
      }
    }
  }

  .empty-block {
    color: $c_base_error_color;
    font-weight: bold;
    font-size: 18px;
    text-shadow: 0 0 3px white;
  }

  //-----------Элемент иконки-----------
  &__icon-element-label-wrapper {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 20px;
    @include transition;
    text-align: start;
    flex: 1 2 100%;
  }
  &__icon-wrapper {
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    justify-content: flex-end;
    border-radius: $c_decor_border_radius;
    flex-shrink: 0;
    overflow: hidden;
    img {
      width: 100%;
      height: auto;
      object-fit: contain;
    }
  }
  //-----------элемент фоновой картинки------------
  &__background-image {
    &-wrapper {
      position: absolute;
      width: calc(100% - 20px);
      height: calc(100% - 20px);
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      justify-content: flex-end;
      align-items: flex-end;
      overflow: hidden;
      background-repeat: no-repeat;
      background-position: right bottom;
      background-size: contain;
      z-index: -1;
      &.result {
        width: 100%;
      }
      @media all and (max-width: 480px) {
        display: none;
      }
      @include style-decor-border-radius;
    }
    &-img {
      object-fit: contain;
      width: 100%;
      height: auto;
    }
    &-substrate {
      width: 100%;
      height: 100%;
    }
  }

  &__spinner {
    &-wrapper {
      width: 100%;
      min-height: 70px;
      display: flex;
      margin: 20px;
      justify-content: center;
      align-items: center;
      flex-direction: column;
    }

    &-text {
      font-size: 25px;
      font-style: italic;
      color: $c_base_title;
    }

    &-block {
      position: relative;
      width: 70px;
      height: 70px;
      &:before,
      &:after {
        content: "";
        display: block;
        position: absolute;
        border-width: 4px;
        border-style: solid;
        border-radius: 50%;
      }

      @keyframes rotate-animation {
        0% {
          transform: rotate(0deg);
        }

        100% {
          transform: rotate(360deg);
        }
      }

      @keyframes anti-rotate-animation {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(-360deg);
        }
      }

      &:before {
        width: 60px;
        height: 60px;
        border-bottom-color: $c_decor_border_color_selected;
        border-right-color: $c_decor_border_color_selected;
        border-top-color: rgba($c_decor_border_color, 0);
        border-left-color: rgba($c_decor_border_color, 0);
        top: 0;
        left: 0;
        animation: rotate-animation 1s linear 0s infinite;
      }

      &:after {
        width: 50px;
        height: 50px;
        border-bottom-color: $c_decor_border_color_hover;
        border-right-color: $c_decor_border_color_hover;
        border-top-color: rgba($c_decor_border_color, 0);
        border-left-color: rgba($c_decor_border_color, 0);
        top: (100px - 90px) / 2;
        left: (100px - 90px) / 2;
        animation: anti-rotate-animation 0.85s linear 0s infinite;
      }
    }
  }
}

.calc__form-for-result {
  display: none;
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  .title {
    color: $c_base_title;
    font-size: 16px;
    line-height: 20px;
  }

  form {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;

    .field-title {
      color: $c_base_title;
      font-size: 16px;
      line-height: 20px;
    }

    label {
      color: $c_base_title;
      display: flex;
      flex-direction: column;
      align-items: self-start;
      gap: 8px;
    }
    input {
      @include style-decor-border-radius;
      outline: none;
      border-width: 2px;
      border-style: solid;
      font-size: 16px;
      line-height: 20px;
      color: $c_base_title;
      min-height: 60px;
      padding: 20px 35px;
      width: 100%;
      &:focus,
      &:hover {
        border-color: $c_decor_border_color_hover;
      }
    }
    textarea {
      @include style-decor-border-radius;
      font-size: 16px;
      line-height: 20px;
      color: $c_decor_text_default;
      padding: 20px 35px;
      outline: none;
      border-width: 2px;
      border-style: solid;
      width: 100%;
      &:focus,
      &:hover {
        border-color: $c_decor_border_color_hover;
      }
      &#teleport {
        display: none;
      }
    }
    button {
      @include style-decor-border-radius;
      background-color: $c_decor_bg_color_selected;
      color: $c_decor_text_selected;
      font-weight: 900;
      font-size: 17px;
      line-height: 23px;
      display: flex;
      align-items: center;
      text-align: center;
      text-transform: uppercase;
      padding: 21px 25px;
      border: none;
      cursor: not-allowed;
      &:hover:enabled {
        cursor: pointer;
        background-color: $c_decor_bg_color_hover;
        color: $c_decor_text_hover;
      }
    }
  }
}
</style>
