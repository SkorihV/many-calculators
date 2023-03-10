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
</template>

<script>
import { useBaseStore } from "@/store/piniaStore";
import { mapState } from "pinia";
import SpinnerElement from "@/components/UI/other/Spinner-element.vue";

import BackgroundImageElement from "@/components/UI/supporting/background-image-element.vue";
import { parseResultValueObjectItem } from "@/servises/UtilityServices";
export default {
  name: "ResultBlockForOutput",
  components: { BackgroundImageElement, SpinnerElement },
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
      isNeedSpinner: false
    }
  },
  methods: {
    spinnerIsFinished() {
      this.isNeedSpinner = false;
    }
  },
  watch: {
    isShowResultBlock(newValue) {
      this.isNeedSpinner = Boolean(this.resultOptions?.timerForSpinner) && newValue;
    }
  },
  computed: {
    ...mapState(useBaseStore, ["getCurrency","isExistGlobalErrorsValidationIgnoreHiddenElement", "checkInitEnabledSendForm", "checkAllowShowResultBlock"]),
    isShowResultBlockTitle() {
      return Boolean(this.resultOptions?.title?.length);
    },
    isShowResultBlockSubtitle() {
      return Boolean(this.resultOptions?.subtitle?.length);
    },
    allowShowResultInOptions() {
      return this.resultOptions
        ? this.resultOptions?.showResultDataForBlock
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
                if (
                  parseResultValueObjectItem(
                    duplicator,
                    "resultOutputMethod",
                    this.getCurrency
                  )?.length
                ) {
                  result += "<div class='calc__result-block-delimiter'></div>";
                  result +=
                    "<div class='calc__result-block-field-wrapper'>" +
                    parseResultValueObjectItem(
                      duplicator,
                      "resultOutputMethod",
                      this.getCurrency
                    ) +
                    "</div>";
                }
                duplicator?.insertedTemplates.forEach(
                  (templateInDuplicator) => {
                    if (
                      parseResultValueObjectItem(
                        templateInDuplicator,
                        "resultOutputMethod",
                        this.getCurrency
                      )?.length
                    ) {
                      result +=
                        "<div class='calc__result-block-field-wrapper'>" +
                        parseResultValueObjectItem(
                          templateInDuplicator,
                          "resultOutputMethod",
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
          if (
            parseResultValueObjectItem(
              item,
              "resultOutputMethod",
              this.getCurrency
            )?.length
          ) {
            result +=
              "<div class='calc__result-block-field-wrapper'> " +
              parseResultValueObjectItem(
                item,
                "resultOutputMethod",
                this.getCurrency
              ) +
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
      if (this.finalSummaForOutput === null || this.finalSummaForOutput === false) {
        return result;
      }

      if (this.finalSummaForOutput === false) {
        result += "Есть ошибка в расчетах!";
      } else if (this.finalSummaForOutput !== false && this.showSumma) {
        const titleSumma = !!this.outOptions?.resultOptions?.titleSumma ? this.outOptions?.resultOptions?.titleSumma : "";
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
    timeForSpinner() {
      return Number(this.resultOptions?.timerForSpinner);
    },
    textForSpinner() {
      return this.resultOptions?.textForSpinner;
    }
  },
};
</script>

<style scoped></style>
