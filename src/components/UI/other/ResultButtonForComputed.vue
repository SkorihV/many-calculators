<script>
const typeElement = "ResultButton";
</script>

<script setup>
import { computed, reactive, ref, watch } from "vue";
import {useBaseStore} from "@/store/piniaStore";
import {storeToRefs} from "pinia";
import IconElementWrapper from "@/components/UI/supporting/icon-element-wrapper.vue";
import devBlock from "@/components/UI/devMode/devBlock/devBlock.vue";
import { useLocalDependencyList } from "@/composables/useLocalDependencyList";
import { useProcessingFormula } from "@/composables/useProcessingFormula";


const baseStore = useBaseStore()
const baseStoreRefs = storeToRefs(baseStore)
const {  
  methodBeginningCalculationIsButton,
  isExistGlobalErrorsValidationIgnoreHiddenElement,
  checkAllowShowResultBlock,
  devMode,
} = baseStoreRefs;

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
      :alt="resultOptions?.titleButton ?? 'Рассчитать'"
      :icon-settings="resultOptions?.iconSettings"
      :is-parent-hover="isHoverButton"
    >
      {{ resultOptions?.titleButton ?? "Рассчитать" }}
    </icon-element-wrapper>
  </button>
  <dev-block
    v-if="showResultBtn"
    :label="resultOptions?.titleButton ?? 'Рассчитать'"
    :type-element="typeElement"
    :is-visibility-from-dependency="showBtn"
    :dependency-formula-display="resultOptions?.formulaDisplayButton"
    hidden-value
    hidden-cost
  />
</template>
