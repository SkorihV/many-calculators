<template>
  <spinner-element
    :init-show="isNeedSpinner"
    :timer-time="timeForSpinner"
    :text="textForSpinner"
    @finished="spinnerIsFinished"
  />
  <div
    class="calc__result-block-wrapper"
    :class="{
      isVisualSeparate: resultOptions?.visuallySeparateElement,
    }"
    v-if="isShowResultBlock && !isNeedSpinner"
  >
    <background-image-element
      class="result"
      v-if="resultOptions?.backgroundImageSettings"
      :image-settings-data="resultOptions?.backgroundImageSettings"
    />
    <div
      class="calc__result-block-title-wrapper"
      v-if="isShowResultBlockTitle || isShowResultBlockSubtitle"
    >
      <div class="calc__result-block-title-main" v-if="isShowResultBlockTitle">
        {{ resultOptions.title }}
      </div>
      <div
        class="calc__result-block-title-sub"
        v-if="isShowResultBlockSubtitle"
        v-html="resultOptions.subtitle"
      />
    </div>
    <div class="calc__result-block-data" v-html="finalTextForOutput"></div>
  </div>
  <dev-block
    label="Блок с результатами"
    :formula="resultOptions?.formulaDependencyForResultBlock"
    :formula-variables="formulaOnDataVariables"
    :is-visibility-from-dependency="isShowResultBlock"
    hidden-cost
    hidden-value
  ></dev-block>
</template>

<script>
import { useBaseStore } from "@/store/piniaStore";
import { mapState } from "pinia";
import SpinnerElement from "@/components/UI/other/Spinner-element.vue";
import { MixinsUtilityServices } from "@/mixins/MixinsUtilityServices";

import BackgroundImageElement from "@/components/UI/supporting/c_background-image-element.vue";
import { parseResultValueObjectItem } from "@/servises/UtilityServices";
import { processingVariablesOnFormula } from "@/servises/ProcessingFormula";
import DevBlock from "@/components/UI/devMode/devBlock.vue";
export default {
  name: "ResultBlockForOutput",
  components: { BackgroundImageElement, SpinnerElement, DevBlock },
  mixins: [MixinsUtilityServices],
  props: {
    resultOptions: {
      type: Object,
      require: true,
    },
    dataForResult: {
      type: Array,
      default: () => [],
    },
    finalSummaForOutput: {
      type: [Number, Boolean],
      default: null,
    },
  },
  data() {
    return {
      isNeedSpinner: false,
    };
  },
  methods: {
    spinnerIsFinished() {
      this.isNeedSpinner = false;
    },
  },
  watch: {
    isShowResultBlock(newValue) {
      this.isNeedSpinner =
        Boolean(this.resultOptions?.timerForSpinner) && newValue;
    },
  },
  computed: {
    ...mapState(useBaseStore, [
      "getCurrency",
      "isExistGlobalErrorsValidationIgnoreHiddenElement",
      "checkInitEnabledSendForm",
      "checkAllowShowResultBlock",
      "globalDependenciesList",
      "getTitleSum",
    ]),
    isShowResultBlockTitle() {
      return Boolean(this.resultOptions?.title?.length);
    },
    isShowResultBlockSubtitle() {
      return Boolean(this.resultOptions?.subtitle?.length);
    },
    allowShowResultInOptions() {
      return this.resultOptions
        ? !this.resultOptions?.hiddenResultBlock &&
            this.showResultBlockForDependency
        : false;
    },
    showSumma() {
      return !this.resultOptions?.hiddenSumma;
    },
    /**
     * Добавить данные в форму если нет ошибок валидации
     * @returns {boolean}
     */
    isShowResultBlock() {
      return (
        !this.isExistGlobalErrorsValidationIgnoreHiddenElement &&
        this.checkInitEnabledSendForm &&
        this.allowShowResultInOptions &&
        this.checkAllowShowResultBlock
      );
    },

    /**
     * Текст со всеми полями которые должны отображаться в блоке
     * @returns {string}
     */
    resultTextDataForResultBlock() {
      let result = "";
      this.dataForResult.forEach((item) => {
        if (item.type === "duplicator") {
          if (item?.insertedTemplates?.length && item.isShow) {
            item?.insertedTemplates.forEach((duplicator) => {
              if (duplicator?.insertedTemplates?.length) {
                const resultValueObjectItem = parseResultValueObjectItem(
                  duplicator,
                  "resultOutputMethod",
                  duplicator?.unit
                );

                if (resultValueObjectItem?.length) {
                  result += "<div class='calc__result-block-delimiter'></div>";
                  result +=
                    "<div class='calc__result-block-field-wrapper'>" +
                    resultValueObjectItem +
                    "</div>";
                }
                duplicator?.insertedTemplates.forEach(
                  (templateInDuplicator) => {
                    const resultValueObjectItemInDuplicator =
                      parseResultValueObjectItem(
                        templateInDuplicator,
                        "resultOutputMethod",
                        this.getCurrency
                      );
                    if (resultValueObjectItemInDuplicator?.length) {
                      result +=
                        "<div class='calc__result-block-field-wrapper'>" +
                        resultValueObjectItemInDuplicator +
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
            "resultOutputMethod",
            this.getCurrency
          );
          if (data?.length) {
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
     * Текст для вывода в форму
     * @returns {string}
     */
    finalTextForOutput() {
      let result = this.resultTextDataForResultBlock;
      if (
        this.finalSummaForOutput === null ||
        this.finalSummaForOutput === false
      ) {
        return result;
      }

      if (this.finalSummaForOutput === false) {
        result += "Есть ошибка в расчетах!";
      } else if (this.finalSummaForOutput !== false && this.showSumma) {
        const sum = parseFloat(this.finalSummaForOutput)?.toLocaleString("ru");
        result +=
          "\n" +
          "<div class='calc__result-block-field-summ'>" +
          "<div class='calc__result-block-field-summ-title'>" +
          this.getTitleSum +
          "</div>" +
          "<div class='calc__result-block-field-summ-cost'> " +
          sum +
          "</div>" +
          "<div class='calc__result-block-field-summ-currency'> " +
          this.getCurrency +
          "</div>" +
          "</div>";
      }
      return result;
    },
    timeForSpinner() {
      return Number(this.resultOptions?.timerForSpinner);
    },
    textForSpinner() {
      return this.resultOptions?.textForSpinner;
    },
    showResultBlockForDependency() {
      return this.isFormulaDisplayResultBlock
        ? this.isDisplayResultBlockFormulaDependency
        : true;
    },
    isFormulaDisplayResultBlock() {
      return Boolean(
        this.resultOptions?.formulaDependencyForResultBlock?.length
      );
    },
    variablesInFormula() {
      return this.isFormulaDisplayResultBlock
        ? this.getArrayElementsFromFormula(
            this.resultOptions.formulaDependencyForResultBlock
          )
        : [];
    },
    localDependencyListResultBlock() {
      let listObject = {};
      this.variablesInFormula.forEach((name) => {
        if (this.globalDependenciesList[name]) {
          listObject[name] = this.globalDependenciesList[name];
        }
      });
      return listObject;
    },
    formulaOnDataVariables() {
      return processingVariablesOnFormula(
        this.variablesInFormula,
        this.localDependencyListResultBlock
      );
    },
    isDisplayResultBlockFormulaDependency() {
      try {
        return eval(this.formulaOnDataVariables);
      } catch (e) {
        if (this.devMode) {
          console.warn(
            "Рассчитываемая формула результирующего блока: ",
            this.formulaOnDataVariables
          );
        }
        return null;
      }
    },
  },
};
</script>

<style scoped></style>
