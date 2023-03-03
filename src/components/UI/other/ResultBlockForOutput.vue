<template>
  <div
    class="calc__result-block-wrapper"
    :class="{
      isVisualSeparate: options.resultOptions?.visuallySeparateElement,
    }"
    v-if="showResultDataForBlock && initTeleportIsReady"
  >
    <background-image-element
      class="result"
      v-if="options.resultOptions?.backgroundImageSettings"
      :image-settings-data="options.resultOptions?.backgroundImageSettings"
    />
    <div
      class="calc__result-block-title-wrapper"
      v-if="isShowResultBlockTitle || isShowResultBlockSubtitle"
    >
      <div class="calc__result-block-title-main" v-if="isShowResultBlockTitle">
        {{ options.resultOptions.title }}
      </div>
      <div
        class="calc__result-block-title-sub"
        v-if="isShowResultBlockSubtitle"
        v-html="options.resultOptions.subtitle"
      />
    </div>
    <div class="calc__result-block-data" v-html="finalTextForOutput"></div>
  </div>
</template>

<script>
import { useBaseStore } from "@/store/piniaStore";
import { mapState } from "pinia";

import backgroundImageElement from "@/components/UI/supporting/background-image-element.vue";
import { parseResultValueObjectItem } from "@/servises/UtilityServices";
export default {
  name: "ResultBlockForOutput",
  components: { backgroundImageElement },
  props: {
    options: {
      type: Object,
      require: true,
    },
    initTeleportIsReady: {
      type: Boolean,
      default: false,
    },
    dataForResult: {
      type: Array,
      default: () => [],
    },
    finalSummaForOutput: {
      type: Number,
      default: null,
    },
  },
  computed: {
    ...mapState(useBaseStore, ["getCurrency"]),
    isShowResultBlockTitle() {
      return Boolean(this.options?.resultOptions?.title?.length);
    },
    isShowResultBlockSubtitle() {
      return Boolean(this.options?.resultOptions?.subtitle?.length);
    },
    showResultDataForBlock() {
      return this.options?.resultOptions
        ? this.options?.resultOptions?.showResultDataForBlock
        : false;
    },
    showSumma() {
      return !this.options?.resultOptions?.hiddenSumma;
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
      if (this.finalSummaForOutput === null) {
        return result;
      }

      if (this.finalSummaForOutput === false) {
        result += "Есть ошибка в расчетах!";
      } else if (this.finalSummaForOutput !== false && this.showSumma) {
        result +=
          "\n" +
          "<div class='calc__result-block-field-summ'>" +
          "<div class='calc__result-block-field-summ-title'>" +
          this.options?.resultOptions?.titleSumma +
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
  },
};
</script>

<style scoped></style>
