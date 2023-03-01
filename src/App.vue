<template>
  <div id="app-base-constructor-calculator" v-show="appIsMounted">
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
          :position-element="template?.position"
          :zero-value-display-ignore="template?.zeroValueDisplayIgnore"
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
        Заполните, пожалуйста, все обязательные поля корректно.
      </div>
      <div v-if="!showErrorTextBlock && showErrorSummaBlock" class="calc__error-block">
        Не все поля участвующие в расчете были заполнены.
      </div>
      <button
        class="calc__show-result-btn"
        @click="calculateResult"
        v-if="showResultBtn"
        @mouseover="isHoverButtonResult = true"
        @mouseleave="isHoverButtonResult = false"
      >
        <icon-element-wrapper
          :alt="outOptions?.resultOptions?.titleButton ?? 'Рассчитать'"
          :icon-settings="outOptions?.resultOptions?.iconSettings"
        >
          {{ outOptions?.resultOptions?.titleButton ?? "Рассчитать" }}
        </icon-element-wrapper>
      </button>
      <div
        class="calc__result-block-wrapper"
        :class="{
          isVisualSeparate: outOptions.resultOptions?.visuallySeparateElement,
        }"
        v-if="showResultDataForBlock && initTeleportIsReady"
      >
        <background-image-element
          class="result"
          v-if="outOptions.resultOptions?.backgroundImageSettings"
          :image-settings-data="
            outOptions.resultOptions?.backgroundImageSettings
          "
        />
        <div
          class="calc__result-block-title-wrapper"
          v-if="isShowResultBlockTitle || isShowResultBlockSubtitle"
        >
          <div
            class="calc__result-block-title-main"
            v-if="isShowResultBlockTitle"
          >
            {{ outOptions.resultOptions.title }}
          </div>
          <div
            class="calc__result-block-title-sub"
            v-if="isShowResultBlockSubtitle"
            v-html="outOptions.resultOptions.subtitle"
          />
        </div>
        <div class="calc__result-block-data" v-html="finalTextForOutput"></div>
      </div>
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
    <div
      class="calc__dev-block-wrapper"
      v-if="showDevBlock"
      v-html="devModeData"
    ></div>
  </div>
  <spinner-element v-if="!appIsMounted" />
</template>

<script>
import UiAccordion from "@/components/UI/structural/UiAccordion.vue";
import UiTab from "@/components/UI/structural/UiTab.vue";
import UiDuplicator from "@/components/UI/structural/UiDuplicator.vue";
import TemplatesWrapper from "@/components/UI/supporting/TemplatesWrapper.vue";
import UiBisection from "@/components/UI/structural/UiBisection.vue";
import ErrorNamesTemplates from "@/components/UI/other/ErrorNamesTemplates.vue";
import SpinnerElement from "@/components/UI/other/Spinner-element.vue";

import { MixinsUtilityServices } from "@/mixins/MixinsUtilityServices";
import { useBaseStore } from "@/store/piniaStore";
import { mapState } from "pinia";
import BackgroundImageElement from "@/components/UI/supporting/background-image-element.vue";
import IconElementWrapper from "@/components/UI/supporting/icon-element-wrapper.vue";

import localData from "@/servises/localData";
export default {
  name: "TheBasicCalculatorConstructor",
  mixins: [MixinsUtilityServices],
  components: {
    IconElementWrapper,
    BackgroundImageElement,
    SpinnerElement,
    TemplatesWrapper,
    UiAccordion,
    UiTab,
    UiBisection,
    UiDuplicator,
    ErrorNamesTemplates,
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
    let calculatorTemplatesWitchPositions = [];
    if (this.outData?.calculatorTemplates?.length) {
      let templatesPositionIndex = 0;

      this.outData?.calculatorTemplates.forEach((item) => {
        let currentItem = item;

        if (currentItem.template === "UiBisection") {
          let { newItem, shiftIndex } = this.updatePositionElementsInBiSection(
            currentItem,
            templatesPositionIndex
          );
          templatesPositionIndex = shiftIndex;
          calculatorTemplatesWitchPositions.push(newItem);
        } else if (
          currentItem.template === "UiTab" ||
          currentItem.template === "UiAccordion"
        ) {
          if (currentItem.items?.length) {
            const itemsLength = currentItem?.items.length;
            for (let i = 0; i < itemsLength; i++) {
              let currentTemplates = currentItem?.items[i].templates;
              let currentTempLength = currentTemplates.length;
              let newTemplates = [];

              for (let q = 0; q < currentTempLength; q++) {
                currentTemplates[q].position = templatesPositionIndex;
                templatesPositionIndex++;
                newTemplates.push(currentTemplates[q]);
              }
              currentItem.items[i].templates = newTemplates;
            }
          }
          calculatorTemplatesWitchPositions.push(currentItem);
        } else if (currentItem.template === "UiDuplicator") {
          let currentDuplicatorItem = currentItem;
          if (currentDuplicatorItem?.templates?.length) {
            let currentPositionDuplicatorIndex = 0;
            let newDuplicatorTemplates = [];

            for (let r = 0; r < currentDuplicatorItem.templates.length; r++) {
              if (
                currentDuplicatorItem.templates[r].template === "UiBisection"
              ) {
                let { newItem, shiftIndex } =
                  this.updatePositionElementsInBiSection(
                    currentDuplicatorItem.templates[r],
                    currentPositionDuplicatorIndex
                  );
                currentPositionDuplicatorIndex = shiftIndex;
                newDuplicatorTemplates.push(newItem);
              } else {
                currentDuplicatorItem.templates[r].position =
                  currentPositionDuplicatorIndex;
                currentPositionDuplicatorIndex++;
                newDuplicatorTemplates.push(currentDuplicatorItem.templates[r]);
              }
            }

            currentDuplicatorItem.templates = newDuplicatorTemplates;
            currentItem.position = templatesPositionIndex;
            templatesPositionIndex++;
            calculatorTemplatesWitchPositions.push(currentDuplicatorItem);
          }
        } else {
          currentItem.position = templatesPositionIndex;
          templatesPositionIndex++;
          calculatorTemplatesWitchPositions.push(currentItem);
        }
      });
    }
    this.calculatorTemplates = calculatorTemplatesWitchPositions;

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
    this.tryToggleDevMode(Boolean(this.outOptions?.devModeEnabled));
    this.showResultDataForBlock = this.outOptions?.resultOptions
      ? this.outOptions?.resultOptions.showResultDataForBlock
      : false;
    this.outOptions.resultOptions.titleButton = this.outOptions?.resultOptions
      ? this.outOptions?.resultOptions?.titleButton
      : "Рассчитать";
    this.setTooltipOn(Boolean(this.outOptions?.tooltipOff));

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
      eventNotShowTooltips: [
        "delete",
        "mounted",
        "timer",
        "dependency",
        "currentSelectedRadioButton",
        "changeAmountSelectList",
      ], // События при которых не должно срабатывать отображение ошибок
      isHoverButtonResult: false,
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
          "#App ~ .tpl-anketa button[type=submit]"
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
      let currentValue =
        !isNaN(parseFloat(item.value)) && isFinite(item.value)
          ? Math.abs(item.value)
          : item.value;

      const isAllowZeroValue = !item?.zeroValueDisplayIgnore || !!currentValue;
      const isAllowDataOutput = item.formOutputMethod && item.displayValue !== null && item.isShow && isAllowZeroValue;
      const isAllowValueOutput = item.formOutputMethod === "value" ||  item.formOutputMethod === "valueSumm";
      const isAllowCostOutput = item.cost !== null && (item.formOutputMethod === "summ" || item.formOutputMethod === "valueSumm");
      const unit = item?.unit ? item.unit : "";

      if (isAllowDataOutput) {
        result +=
          "\n<div class='calc__result-block-field-label'>" +
          item.label +
          " </div>";

        result += "<div class='calc__result-block-field-right'>";
        if (isAllowValueOutput) {
          result +=
            "<div class='calc__result-block-field-value'>" +
            item.displayValue +
            " " +
            unit;

          if (isAllowCostOutput) {
            result += " - ";
          }

          result += "</div>";
        }
        if (isAllowCostOutput) {
          let sum = item?.cost?.toString();
          result +=
            "<div class='calc__result-block-field-cost'>" +
            sum +
            " " +
            this.currency +
            "</div>";
        }
        result += "</div>";
      }
      return result;
    },
    /**
     *
     * @param item
     * @param index
     * @returns {{newItem: Object, shiftIndex: Number}}
     */
    updatePositionElementsInBiSection(item, index) {
      let newItem = item;
      let shiftIndex = index;
      if (newItem.leftSide?.length) {
        newItem.leftSide = newItem?.leftSide?.map((itemLeft) => {
          itemLeft.position = shiftIndex;
          shiftIndex++;
          return itemLeft;
        });
      }
      if (newItem.rightSide?.length) {
        newItem.rightSide = newItem?.rightSide?.map((itemRight) => {
          itemRight.position = shiftIndex;
          shiftIndex++;
          return itemRight;
        });
      }
      return { newItem, shiftIndex };
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
      "appIsMounted",
      "setTooltipOn",
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
          console.error("Ошибка в расчете формулы: ", this.resultTextForComputed);
        }
        return false;
      }
    },

    /**
     * Данные нужные только для вывода в форму
     * @returns {*[]}
     */
    dataForOutputText() {
      return this.baseDataForCalculate
        .filter((item) => item.formOutputMethod !== "no")
        .sort((itemA, itemB) => itemA.position - itemB.position);
    },
    /**
     * Текст со всеми полями которые должны отображаться в форме
     * @returns {string}
     */
    resultTextDataForForm() {
      let result = "";
      this.dataForOutputText.forEach((item) => {
        if (item.type === "duplicator") {
          if (item?.insertedTemplates?.length && item.isShow) {
            item?.insertedTemplates.forEach((duplicator) => {
              if (duplicator?.insertedTemplates?.length) {
                if (this.parseResultValueObjectItem(duplicator)?.length) {
                  result += "<div class='calc__result-block-delimiter'></div>";
                  result +=
                    "<div class='calc__result-block-field-wrapper'>" +
                    this.parseResultValueObjectItem(duplicator) +
                    "</div>";
                }
                duplicator?.insertedTemplates.forEach(
                  (templateInDuplicator) => {
                    if (
                      this.parseResultValueObjectItem(templateInDuplicator)
                        ?.length
                    ) {
                      result +=
                        "<div class='calc__result-block-field-wrapper'>" +
                        this.parseResultValueObjectItem(templateInDuplicator) +
                        "</div>";
                    }
                  }
                );
                result += "<div class='calc__result-block-delimiter'></div>";
              }
            });
          }
        } else {
          if (this.parseResultValueObjectItem(item)?.length) {
            result +=
              "<div class='calc__result-block-field-wrapper'> " +
              this.parseResultValueObjectItem(item) +
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
      if (!this.displayResultData) {
        return null;
      }

      if (this.isUseFormula && this.mainFormulaIsExist) {
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
          "\n" +
          "<div class='calc__result-block-field-summ'>" +
          "<div class='calc__result-block-field-summ-title'>" +
          this.outOptions?.resultOptions?.titleSumma +
          "</div>" +
          "<div class='calc__result-block-field-summ-cost'> " +
          this.finalSummaForOutput +
          "</div>" +
          "<div class='calc__result-block-field-summ-currency'> " +
          this.currency +
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
      return this.isCheckedGlobalValidation && this.isCanShowAllTooltips;
    },
    /**
     * Добавить данные в форму если нет ошибок валидации
     * @returns {boolean}
     */
    initTeleportIsReady() {
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
    allowTeleport() {
      return this.initTeleportIsReady && this.submitResult;
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
      return `
      ${this.formulaHtml}
      ${this.formulaVariablesHtml}
      `;
    },
    formulaHtml() {
      return this.variablesInFormula?.length
        ? `<div class="calc__dev-block-element">Формула расчета: ${this.variablesInFormula.join(" ")}</div>`
        : "";
    },
    formulaVariablesHtml() {
      return this.mainFormulaIsExist
        ? `<div class="calc__dev-block-element">Формула с подставленными значениями: ${this.resultTextForComputed}</div>`
        : "";
    },
    isShowResultBlockTitle() {
      return Boolean(this.outOptions?.resultOptions?.title?.length);
    },
    isShowResultBlockSubtitle() {
      return Boolean(this.outOptions?.resultOptions?.subtitle?.length);
    },
    showDevBlock() {
      return this.devMode && this.showInsideElementStatus;
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
//$c_base_button_bg                : var(--c_base_button_bg);
//$c_base_button_border            : var(--c_base_button_border);
//$c_base_button_border_radius     : var(--c_base_button_border_radius);
//$c_base_button_border_width      : var(--c_base_button_border_width);


$c_base_title: #000000;
$c_base_error_color: #e80000;
$c_base_error_bg: #f5f5f5;
$c_base_error_border: #e80000;
$c_base_error_border_radius: 9px;
$c_base_error_border_width: 2px;

$c_base_button_text_color: #000000;
$c_base_button_bg: #f9f9f9;
$c_base_button_border: #ff6531;
$c_base_button_border_radius: 9px;
$c_base_button_border_width: 2px;


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
$c_decor_bg_color_hover: #ffffff;
$c_decor_bg_color_selected: #ff6531;

$c_decor_border_color:  #ff6531;
$c_decor_border_color_hover: #ff6531;
$c_decor_border_color_selected: #ff6531;
$c_decor_border_radius: 9px;
$c_decor_border_width: 2px;


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
$c_element_text_selected: #fff;

$c_element_bg_color: #f9f9f9;
$c_element_bg_color_hover: #f9f9f9;
$c_element_bg_color_selected: #ff6531;

$c_element_border_color: #e8e8e8;
$c_element_border_color_hover: #ff6531;
$c_element_border_color_selected: #ff6531;
$c_element_border_radius: 9px;
$c_element_border_width: 1px;

$c_element_input_color: #e8e8e8;
$c_element_range_color: #e8e8e8;

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
$c_prompt_element_sing_bg:  #ffffff;
$c_prompt_element_sing_bg_hover: #ff6531;



@mixin style-decor-border-radius  {
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
    @include style-decor-border-radius ;
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
      flex-wrap: wrap;

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
        @include style-title-main;
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
        font-weight: 700;
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
        color: $c_element_text_default;
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
          color: $c_element_text_default;
          opacity: 0.6;
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
      color: $c_element_text_default;
    }
  }
  //--------Стили RANGE-----

  &__range {
    &-wrapper {
      display: flex;
      flex-direction: column;
      width: 100%;
      position: relative;
      min-height: 60px;
    }
    &-label {
      @include style-title-main;
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
      color: $c_element_text_default;
    }
    &-item {
      &-wrapper {
        display: flex;
        align-items: baseline;
        gap: 32px;
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
        background-color: $c_element_range_color;
        border: 4px solid $c_element_border_color;
        box-shadow: 0 7px 11px -4px $c_element_border_color;
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
        background-color: $c_element_range_color;
        border: 4px solid $c_element_border_color;
        box-shadow: 0 7px 11px -4px $c_element_border_color;
        margin-top: -16px;
        &:hover {
          background-color: $c_element_bg_color_hover;
          border: 4px solid $c_element_border_color_hover;
          box-shadow: 0 7px 11px -4px $c_element_border_color_hover;
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
        font-weight: 700;
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
        font-weight: 700;
        font-size: 16px;
        line-height: 20px;
        padding: 20px 20px;
        max-width: 90px;
        right: 0;
        border: none;
        color: $c_element_text_default;
        background-color: $c_element_range_color;
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
        }
      }
    }
  }

  //---------Стили select-----
  &__select {
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
      display: flex;
      flex: 1 2 100%;
      @include style-title-main;
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
        min-width: 30%;
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
        border-left: $c_element_border_width solid $c_element_border_color_selected;
        border-right: $c_element_border_width solid $c_element_border_color_selected;
        border-bottom: $c_element_border_width solid $c_element_border_color_selected;
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
      }
    }
  }

  //-----------------Радио кнопки ---------------
  &__radio {
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
          gap: 8px;
        }
      }
      &.base {
        .calc__radio-indicator {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 2px solid $c_element_text_default;
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
      @include style-title-main;
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
      background-color: $c_element_bg_color;
      border-radius: $c_element_border_radius;
      border: $c_element_border_width solid $c_element_border_color;
      font-weight: 700;
      cursor: pointer;
      @include transition;
      gap: 8px;
      text-align: start;
      @media all and (max-width: 480px) {
        padding: 11px 15px;
      }
      &.onlyImage {
        padding: 10px;
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
      color:$c_element_text_default;
    }
    &-subname {
      @include style-label-sub;
      color:$c_element_text_default;
    }
  }

  //--------Стили чекбокса --------------
  &__checkbox {
    &-wrapper {
      display: flex;
      gap: 10px;
      cursor: pointer;
      align-items: center;
      flex-wrap: wrap;
      @media all and (max-width: 480px) {
        flex-direction: column;
        align-items: flex-start;
      }
      &.is-column {
        flex-direction: column;
        align-items: flex-start;
      }
    }
    &-label {
      @include style-title-main;
      display: flex;
      align-items: center;
      gap: 2px;
      @include transition;
      text-align: start;
    }

    &-control {
      &-wrapper {
        -moz-user-select: none;
        -webkit-user-select: none;
        user-select: none;
        position: relative;
        align-items: center;
        display: flex;
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
        font-weight: 700;
        display: flex;
        align-items: center;
        @media all and (max-width: 480px) {
          padding: 10px 15px;
        }
        @include style-decor-border-radius ;
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
      @include style-decor-border-radius ;
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
      border-radius: $c_base_error_border_radius ;
      justify-content: center;
      min-width: 300px;
    }
  }

  //---------------аккордеон----------------
  &__accordion {
    &-main-label {
      @include style-title-main;
      display: flex;
      margin-bottom: 8px;
    }
    &-wrapper {
      display: flex;
      flex-direction: column;
      width: 100%;
      margin-bottom: 10px;
      &:hover {
        //.calc__accordion-item-content {
        //  border-color: $c_decor_border_color_hover;
        //  border-top-color: transparent;
        //  color: $c_decor_text_hover;
        //  background-color: $c_decor_bg_color_hover;
        //}

        .isOpen.calc__accordion-item-label {
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
        margin-bottom: 11px;
        background-color: $c_decor_bg_color;
        border: $c_decor_border_width solid $c_decor_border_color;
        cursor: pointer;
        @include style-decor-border-radius ;
        @include transition;
        text-align: start;
        position: relative;
        @media all and (max-width: 480px) {
          padding: 10px 15px;
        }
        &.isOpen {
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
        &:hover:not(.isOpen) {
          background-color: $c_decor_bg_color_hover;
          border-color: $c_decor_border_color_hover;
          .calc__accordion-item-label-sub,
          .calc__accordion-item-label-main,
          .calc__accordion-item-plus:before,
          .calc__accordion-item-minus:before {
            color: $c_decor_text_hover;
          }
        }

        &.isError {
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
          font-weight: 700;
        }
        &-sub {
          @include style-label-sub;
          color: $c_decor_text_default;
        }
      }
      &-content {
        margin-top: - $c_decor_border_width;
        width: 100%;
        border: $c_decor_border_width solid $c_decor_border_color_selected;
        border-bottom-left-radius: $c_decor_border_radius;
        border-bottom-right-radius: $c_decor_border_radius;
        border-top-color: transparent;
        margin-bottom: 10px;
        position: relative;
        //overflow: hidden;
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
      color: $c_base_title;
      display: flex;
      margin-bottom: 8px;
    }
    &-wrapper {
      display: flex;
      justify-content: flex-start;
      align-items: start;
      flex-direction: column;
      flex-wrap: wrap;
      width: 100%;
      margin-bottom: 10px;
    }
    &-item {
      &-label {
        @include style-decor-border-radius ;
        background-color: $c_decor_bg_color;
        border: $c_decor_border_width solid $c_decor_border_color;
        display: flex;
        align-items: center;
        padding: 19px 54px;
        cursor: pointer;
        gap: 20px;
        position: relative;
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
          font-weight: 700;
        }

        &-sub {
          @include style-label-sub;
          color: $c_decor_text_default;
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

  &__bisection {
    &-label {
      &-wrapper {
        display: flex;
        flex-direction: column;
        margin: 0 10px 10px 10px;
        gap: 5px;
        border-bottom: 1px dashed $c_decor_border_color;
        width: calc(100% - 20px);
        padding-bottom: 10px;
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
      align-items: flex-start;
      margin-bottom: 10px;
      width: 100%;
      @include style-decor-border-radius ;
      &.isVisualSeparate {
        margin: 20px 10px;
        box-shadow: 0 0 25px -10px $c_decor_text_default;
        padding: 15px;
        width: calc(100% - 20px);
      }
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
      flex: 1 0 auto;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      width: 100%;
    }
    &-left-label,
    &-right-label {
      font-size: 16px;
      font-weight: 600;
      color: $c_base_title;
      width: 100%;
      padding: 10px;
      &.desktop {
        @media all and (max-width: 768px) {
          display: none;
        }
      }
      &.mobile {
        @media all and (min-width: 768px) {
          display: none;
        }
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
      @include style-decor-border-radius ;
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
      border: $c_decor_border_width  solid $c_decor_border_color;
      @include style-decor-border-radius ;
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
        font-weight: 700;
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
      &-value {
        font-weight: bold;
      }
      &-cost {
        font-weight: bold;
      }
      &-summ {
        @include style-title-main;
        font-weight: 700;
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
      padding: 30px 0 10px;
      border-bottom: 2px groove $c_decor_border_color;
      margin-bottom: 10px;
      &:hover {
        border-color: $c_decor_border_color_selected;
      }
    }
    &-label {
      @include style-title-main;
      font-weight: 600;
      text-align: center;
    }
    &-duplicate,
    &-delete {
      cursor: pointer;
      position: absolute;
      display: flex;
      right: 0;
      top: 5px;
      background-color: $c_decor_bg_color;
      color: $c_decor_text_default;
      border: $c_decor_border_width solid $c_decor_border_color;
      padding: 10px;
      @include style-decor-border-radius ;
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
    }
  }

  .empty-block {
    color: $c_base_error_color;
    font-weight: bold;
    font-size: 18px;
    text-shadow: 0 0 3px white;
  }

  //-----------Элемент иконки-----------
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
      @include style-decor-border-radius ;
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
      height: 70px;
      display: flex;
      margin: 20px;
      justify-content: center;
      align-items: center;
    }

    &-block {
      position: relative;
      width: 100px;
      height: 100px;
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
      @include style-decor-border-radius ;
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
      &:invalid {
        border-color: $c_base_error_color;
        color: $c_base_error_color;
      }
    }
    textarea {
      @include style-decor-border-radius ;
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
      &:invalid {
        border-color: $c_base_error_color;
        color: $c_base_error_color;
      }
    }
    button {
      @include style-decor-border-radius ;
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
