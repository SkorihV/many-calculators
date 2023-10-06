<script>
const typeElement = "ResultButton";
</script>

<script setup>
import { computed, reactive, ref, watch } from "vue";
import {useBaseStore} from "@/store/baseStore";
import {useValidationListStore} from "@/store/validationListStore";
import {storeToRefs} from "pinia";
import IconElementWrapper from "@/components/UI/supporting/icon-element-wrapper.vue";
import devBlock from "@/components/UI/devMode/devBlock/devBlock.vue";
import { useLocalDependencyList } from "@/composables/useLocalDependencyList";
import { useProcessingFormula } from "@/composables/useProcessingFormula";
import { updateTextOnVariables } from "@/servises/UpdateTextOnVariables";


const baseStore = useBaseStore()
const {
  methodBeginningCalculationIsButton,
  checkAllowShowResultBlock,
  devMode,
} = storeToRefs(baseStore);

const {isExistGlobalErrorsValidationIgnoreHiddenElement} = storeToRefs(useValidationListStore())

const emits = defineEmits(["checkEnabledResultButton"]);
const props = defineProps({
  resultOptions: {
    type: Object,
    default: () => {},
  },
});

const isHoverButton = ref(false);

const { localDependencyList, constructLocalListElementDependencyInFormula } =
  useLocalDependencyList();

const { isVisibilityFromDependency, formulaAfterProcessingVariables } =
  useProcessingFormula(
    reactive({
      localDependencyList: localDependencyList,
      constructLocalListElementDependencyInFormula,
      formula: props.resultOptions?.formulaDisplayButton,
      parentIsShow: true,
    })
  );

const titleButton = computed(() => {
  return updateTextOnVariables(props.resultOptions?.titleButton, {prueValue: true}) ?? "Рассчитать"
})

function calculateResult() {
  baseStore.showAllTooltipsOn();
  baseStore.setInitEnabledSendForm(true);
  baseStore.setAllowShowResultBlock(true);
  emits("checkEnabledResultButton");
}

watch(isExistGlobalErrorsValidationIgnoreHiddenElement, (newValue) => {
  if (newValue && showResultBtn.value) {
    baseStore.setInitEnabledSendForm(false);
    baseStore.setAllowShowResultBlock(false);
  }
});

const showResultBtn = computed(() => methodBeginningCalculationIsButton.value);

const isFormulaDisplayButton = computed(() =>
  Boolean(props.resultOptions?.formulaDisplayButton?.length)
);

const showButtonOnDependency = computed(() =>
  !isFormulaDisplayButton.value ? true : isVisibilityFromDependency.value
);

const showBtn = computed(
  () =>
    showResultBtn.value &&
    showButtonOnDependency.value &&
    !checkAllowShowResultBlock.value
);
</script>

<template>
  <button
    class="calc__show-result-btn"
    @click="calculateResult"
    v-if="showBtn"
    @mouseover="isHoverButton = true"
    @mouseleave="isHoverButton = false"
  >
    <icon-element-wrapper
      :alt="titleButton"
      :icon-settings="resultOptions?.iconSettings"
      :is-parent-hover="isHoverButton"
    >
      {{ titleButton }}
    </icon-element-wrapper>
  </button>
  <dev-block
    v-if="showResultBtn"
    :label="titleButton"
    :type-element="typeElement"
    :is-visibility-from-dependency="showBtn"
    :dependency-formula-display="resultOptions?.formulaDisplayButton"
    hidden-value
    hidden-cost
  />
</template>
