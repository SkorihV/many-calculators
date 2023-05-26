<script setup>
import BackgroundImageElement from "@/components/UI/supporting/c_background-image-element.vue";
import SpinnerElement from "@/components/UI/other/c_Spinner-element.vue";
import DevBlock from "@/components/UI/devMode/devBlock.vue";
import {computed, ref, watch} from "vue";

import { getBaseStoreGetters } from "@/composables/useBaseStore";
import {parseResultValueObjectItem} from "@/servises/UtilityServices";
import { useUtilityServices} from "@/composables/useUtilityServices"
import {processingVariablesOnFormula} from "@/servises/ProcessingFormula";

const {getArrayElementsFromFormula} = useUtilityServices();
const {
  getCurrency,
  isExistGlobalErrorsValidationIgnoreHiddenElement,
  checkInitEnabledSendForm,
  checkAllowShowResultBlock,
  globalDependenciesList,
  getTitleSum,
} = getBaseStoreGetters();

const props = defineProps({
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
});
const isNeedSpinner = ref(false);

function spinnerIsFinished() {
  isNeedSpinner.value = false;
}

const isShowResultBlockTitle = computed(() => Boolean(props.resultOptions?.title?.length));
const isShowResultBlockSubtitle = computed(() => Boolean(props.resultOptions?.subtitle?.length));
const allowShowResultInOptions = computed(() => props.resultOptions
    ? !props.resultOptions?.hiddenResultBlock &&
    showResultBlockForDependency.value
    : false) ;
const showSumma = computed(() => !props.resultOptions?.hiddenSumma)
/**
 * Добавить данные в форму если нет ошибок валидации
 * @returns {boolean}
 */
const isShowResultBlock = computed(() => !isExistGlobalErrorsValidationIgnoreHiddenElement.value &&
    checkInitEnabledSendForm.value &&
    allowShowResultInOptions.value &&
    checkAllowShowResultBlock.value);

watch(isShowResultBlock, (newValue) => {
  isNeedSpinner.value =
      Boolean(props.resultOptions?.timerForSpinner) && newValue;
});

/**
 * Текст со всеми полями которые должны отображаться в блоке
 * @returns {string}
 */
const resultTextDataForResultBlock = computed(() => {
  let result = "";
  props.dataForResult.forEach((item) => {
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
                          getCurrency.value
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
          getCurrency.value
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
})
/**
 * Текст для вывода в форму
 * @returns {string}
 */
const finalTextForOutput = computed(() => {
  let result = resultTextDataForResultBlock.value;
  if (
      props.finalSummaForOutput === null ||
      props.finalSummaForOutput === false
  ) {
    return result;
  }

  if (props.finalSummaForOutput === false) {
    result += "Есть ошибка в расчетах!";
  } else if (props.finalSummaForOutput !== false && showSumma.value) {
    const sum = parseFloat(props.finalSummaForOutput)?.toLocaleString("ru");
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
})

const timeForSpinner = computed(() => Number(props.resultOptions?.timerForSpinner))
const textForSpinner = computed(() => props.resultOptions?.textForSpinner)
const showResultBlockForDependency = computed(() => isFormulaDisplayResultBlock.value
    ? isDisplayResultBlockFormulaDependency.value
    : true)
const isFormulaDisplayResultBlock = computed(() => Boolean(
    props.resultOptions?.formulaDependencyForResultBlock?.length))

const variablesInFormula = computed(() => isFormulaDisplayResultBlock.value
    ? getArrayElementsFromFormula(
        props.resultOptions.formulaDependencyForResultBlock
    )
    : [])


const localDependencyListResultBlock = computed(() => {
  let listObject = {};
  variablesInFormula.value.forEach((name) => {
    if (globalDependenciesList.value[name]) {
      listObject[name] = globalDependenciesList.value[name];
    }
  });
  return listObject;
})

const formulaOnDataVariables = computed(() => processingVariablesOnFormula(
      variablesInFormula.value,
      localDependencyListResultBlock.value
  ))
const isDisplayResultBlockFormulaDependency = computed(() =>{
  try {
    return eval(formulaOnDataVariables.value);
  } catch (e) {
    if (devMode.value) {
      console.warn(
          "Рассчитываемая формула результирующего блока: ",
          formulaOnDataVariables.value
      );
    }
    return null;
  }
})


</script>

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

