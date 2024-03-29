<script>
const typeElement = "ResultBlock";
const label = "Блок с результатами";
</script>

<script setup>
import { computed, reactive, ref, watch } from "vue";
import {useBaseStore} from "@/store/baseStore";
import {useValidationListStore} from "@/store/validationListStore";

import {storeToRefs} from "pinia";

import BackgroundImageElement from "@/components/supporting/background-image-element.vue";
import SpinnerElement from "@/components/UI/other/Spinner-element.vue";
import DevBlock from "@/components/UI/devMode/devBlock.vue";
import ResultBlockTitle from "@/components/UI/other/ResultBlock/ResultBlockTitle.vue";
import ResultBlockData from "@/components/UI/other/ResultBlock/ResultBlockData.vue";

import { useLocalDependencyList } from "@/composables/useLocalDependencyList";
import { useProcessingFormula } from "@/composables/useProcessingFormula";
import ResultBlockText from "@/components/UI/other/ResultBlock/ResultBlockText.vue";
import { updateTextOnVariables } from "@/servises/UpdateTextOnVariables";

const baseStore = useBaseStore()
const {
  checkInitEnabledSendForm,
  checkAllowShowResultBlock,
} = storeToRefs(baseStore);
const { isExistGlobalErrorsValidationIgnoreHiddenElement } = storeToRefs(useValidationListStore())

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

const { localDependencyList, constructLocalListElementDependencyInFormula } =
  useLocalDependencyList();

const { isVisibilityFromDependency} =
  useProcessingFormula(
    reactive({
      localDependencyList,
      constructLocalListElementDependencyInFormula,
      parentIsShow: true,
      formula: props.resultOptions?.formulaDependencyForResultBlock,
    })
  );

const isFormulaDisplayResultBlock = computed(() =>
  Boolean(props.resultOptions?.formulaDependencyForResultBlock?.length)
);

const showResultBlockForDependency = computed(() =>
  isFormulaDisplayResultBlock.value ? isVisibilityFromDependency.value : true
);

const allowShowResultInOptions = computed(() =>
  props.resultOptions
    ? !props.resultOptions?.hiddenResultBlock &&
      showResultBlockForDependency.value
    : false
);

/**
 * Добавить данные в форму если нет ошибок валидации
 * @returns {boolean}
 */
const isShowResultBlock = computed(
  () =>
    !isExistGlobalErrorsValidationIgnoreHiddenElement.value &&
    checkInitEnabledSendForm.value &&
    allowShowResultInOptions.value &&
    checkAllowShowResultBlock.value
);

watch(isShowResultBlock, (newValue) => {
  isNeedSpinner.value =
    Boolean(props.resultOptions?.timerForSpinner) && newValue;
});

const spinnerIsFinished = () => (isNeedSpinner.value = false);
const timeForSpinner = Number(props.resultOptions?.timerForSpinner);
const textForSpinner = computed(() => {
  return updateTextOnVariables(props.resultOptions?.textForSpinner, {prueValue: true})
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
    <result-block-title :data="resultOptions" />
    <result-block-data
      :data="dataForResult"
      :sum="finalSummaForOutput"
      :result-options="props?.resultOptions"
    />
    <result-block-text :result-options="props?.resultOptions"/>
  </div>
  <dev-block
    :label="label"
    :type-element="typeElement"
    :dependency-formula-display="resultOptions?.formulaDependencyForResultBlock"
    :is-visibility-from-dependency="isShowResultBlock"
    hidden-cost
    hidden-value
  />
</template>
