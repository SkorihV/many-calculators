<script setup>
import { computed, reactive } from "vue";

import {useBaseStore} from "@/store/baseStore";
import {storeToRefs} from "pinia";
import { parseResultValueObjectItem } from "@/servises/UtilityServices";
import { useIsChecks } from "@/components/UI/other/ResultBlock/useIsChecks";
import { updateTextOnVariables } from "@/servises/UpdateTextOnVariables";
import { useLocalDependencyList } from "@/composables/useLocalDependencyList";
import { useProcessingFormula } from "@/composables/useProcessingFormula";

import DevBlock from "@/components/UI/devMode/devBlock.vue";

const baseStore = useBaseStore()
const baseStoreRefs = storeToRefs(baseStore)

const { getCurrency, getTitleSum } = baseStoreRefs

const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
  resultOptions: {
    type: Object,
    default: () => {},
  },
  sum: {
    type: [Number, Boolean],
    default: null,
  }
});

const { isShowSuma } = useIsChecks(props.resultOptions);
const localTitleSum = computed(() => {
  return updateTextOnVariables(getTitleSum.value)
})

const {localDependencyList, constructLocalListElementDependencyInFormula} = useLocalDependencyList()
const {isVisibilityFromDependency: showTitleSumBlock, formulaAfterProcessingVariables} = useProcessingFormula(
  reactive({
    localDependencyList,
    constructLocalListElementDependencyInFormula,
    parentIsShow: true,
    formula: props.resultOptions?.formulaDependencyForTitleSumma,
  })
)

/**
 * Текст со всеми полями которые должны отображаться в блоке
 * @returns {string}
 */
const resultTextDataForResultBlock = computed(() => {
  let result = "";
  props.data.forEach((item) => {
    if (item.type === "UiDuplicator") {
      if (item?.insertedTemplates?.length && item?.isShow && item?.isShowOutput) {
        item?.insertedTemplates.forEach((duplicator) => {
          if (duplicator?.insertedTemplates?.length && duplicator?.isShow && duplicator?.isShowOutput) {
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
            duplicator?.insertedTemplates.forEach((templateInDuplicator) => {
              if (templateInDuplicator.isShow && templateInDuplicator.isShowOutput) {
                const resultValueObjectItemInDuplicator =
                  parseResultValueObjectItem(
                    templateInDuplicator,
                    "resultOutputMethod",
                    getCurrency.value
                  );
                if (resultValueObjectItemInDuplicator?.length) {
                  result +=
                    "<div class='calc__result-block-field-wrapper'>" +
                    resultValueObjectItemInDuplicator +
                    "</div>";
                }
              }
            });
            result += "<div class='calc__result-block-delimiter'></div>";
          }
        });
      }
    } else {
      let data = ""
      if (item?.isShowOutput && item?.isShow) {
        data = parseResultValueObjectItem(
          item,
          "resultOutputMethod",
          getCurrency.value
        );
      }
      if (data?.length) {
        result +=
          "<div class='calc__result-block-field-wrapper'> " + data + "</div>"
      }
    }
  });
  return result
});

const showTitleSum = computed(() => {
  return props.sum !== false && isShowSuma && showTitleSumBlock.value
})

/**
 * Текст для вывода в форму
 * @returns {string}
 */
const finalTextForOutput = computed(() => {
  let result = resultTextDataForResultBlock.value;
  if (props.sum === null || props.sum === false) {
    return result;
  }

  if (props.sum === false) {
    result += "Есть ошибка в расчетах!";
  } else if (showTitleSum.value) {
    const sum = parseFloat(props.sum)?.toLocaleString("ru");
    result +=
      "\n" +
      "<div class='calc__result-block-field-summ'>" +
      "<div class='calc__result-block-field-summ-title'>" +
      localTitleSum.value +
      "</div>" +
      "<div class='calc__result-block-field-summ-cost'> " +
      sum +
      "</div>" +
      "<div class='calc__result-block-field-summ-currency'> " +
      getCurrency.value +
      "</div>" +
      "</div>";
  }
  return result;
});

</script>

<template>
  <div class="calc__result-block-data" v-html="finalTextForOutput"></div>
  <dev-block
    :label="getTitleSum"
    :is-visibility-from-dependency="showTitleSum"
    :dependency-formula-display="props.resultOptions?.formulaDependencyForTitleSumma"
    hidden-cost
    hidden-value
  />
</template>
