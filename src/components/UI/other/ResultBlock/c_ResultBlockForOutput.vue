<script setup>
import BackgroundImageElement from "@/components/UI/supporting/c_background-image-element.vue";
import SpinnerElement from "@/components/UI/other/c_Spinner-element.vue";
import DevBlock from "@/components/UI/devMode/c_devBlock.vue";
import ResultBlockTitle from "@/components/UI/other/ResultBlock/ResultBlockTitle.vue";
import ResultBlockData from "@/components/UI/other/ResultBlock/ResultBlockData.vue";
import { computed, reactive, ref, watch } from "vue";

import { getBaseStoreGetters } from "@/composables/useBaseStore";

import {useLocalDependencyList} from "@/composables/useLocalDependencyList"
import {useProcessingFormula} from "@/composables/useProcessingFormula";

const {
  isExistGlobalErrorsValidationIgnoreHiddenElement,
  checkInitEnabledSendForm,
  checkAllowShowResultBlock,
  globalDependenciesList,
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

const {localDependencyList, constructLocalListElementDependencyInFormula} = useLocalDependencyList()
const {isVisibilityFromDependency, formulaAfterProcessingVariables} = useProcessingFormula(
  reactive({
    localDependencyList,
    constructLocalListElementDependencyInFormula,
    parentIsShow: true,
    formula: props.resultOptions?.formulaDependencyForResultBlock
  })
)


const isFormulaDisplayResultBlock = computed(() => Boolean(
  props.resultOptions?.formulaDependencyForResultBlock?.length))
const showResultBlockForDependency = computed(() => isFormulaDisplayResultBlock.value
  ? isVisibilityFromDependency.value
  : true)
const allowShowResultInOptions = computed(() => props.resultOptions
    ? !props.resultOptions?.hiddenResultBlock &&
    showResultBlockForDependency.value
    : false) ;
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


const spinnerIsFinished = () => isNeedSpinner.value = false;
const timeForSpinner = Number(props.resultOptions?.timerForSpinner)
const textForSpinner = props.resultOptions?.textForSpinner

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
    <result-block-title :data="resultOptions"/>
    <result-block-data :data="dataForResult" :sum="finalSummaForOutput"/>
  </div>
  <dev-block
    label="Блок с результатами"
    :formula="resultOptions?.formulaDependencyForResultBlock"
    :formula-variables="formulaAfterProcessingVariables"
    :is-visibility-from-dependency="isShowResultBlock"
    hidden-cost
    hidden-value
  ></dev-block>
</template>

