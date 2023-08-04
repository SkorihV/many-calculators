<script setup>
import { computed } from "vue";
import {useBaseStore} from "@/store/piniaStore";
import {storeToRefs} from "pinia";
import { parseResultValueObjectItem } from "@/servises/UtilityServices";
import { useIsChecks } from "@/components/UI/other/ResultBlock/useIsChecks";

const baseStore = useBaseStore()
const baseStoreRefs = storeToRefs(baseStore)
const { getCurrency, getTitleSum } = baseStoreRefs;

const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
  sum: {
    type: [Number, Boolean],
    default: null,
  },
});

const { isShowSuma } = useIsChecks(props.resultOptions);

/**
 * Текст со всеми полями которые должны отображаться в блоке
 * @returns {string}
 */
const resultTextDataForResultBlock = computed(() => {
  let result = "";
  props.data.forEach((item) => {
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
            duplicator?.insertedTemplates.forEach((templateInDuplicator) => {
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
            });
            result += "<div class='calc__result-block-delimiter'></div>";
          }
        });
      }
    } else {
      const data = parseResultValueObjectItem(
        item,
        "resultOutputMethod",
        getCurrency.value
      );
      if (data?.length) {
        result +=
          "<div class='calc__result-block-field-wrapper'> " + data + "</div>";
      }
    }
  });
  return result;
});
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
  } else if (props.sum !== false && isShowSuma) {
    const sum = parseFloat(props.sum)?.toLocaleString("ru");
    result +=
      "\n" +
      "<div class='calc__result-block-field-summ'>" +
      "<div class='calc__result-block-field-summ-title'>" +
      getTitleSum.value +
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
</template>
