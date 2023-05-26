<script setup>
import IconElementWrapper from "@/components/UI/supporting/c_icon-element-wrapper.vue";
import devBlock from "@/components/UI/devMode/c_devBlock.vue";
import {computed, ref, watch} from "vue";
import {getBaseStoreGetters, getBaseStoreAction} from "@/composables/useBaseStore";
import {processingVariablesOnFormula} from "@/servises/ProcessingFormula";
import {useUtilityServices} from "@/composables/useUtilityServices"

const {
  methodBeginningCalculationIsButton,
  isExistGlobalErrorsValidationIgnoreHiddenElement,
  checkAllowShowResultBlock,
  globalDependenciesList,
  devMode
} = getBaseStoreGetters()

const {setAllowShowResultBlock, setInitEnabledSendForm, showAllTooltipsOn} = getBaseStoreAction(['setAllowShowResultBlock', 'setInitEnabledSendForm', 'showAllTooltipsOn'])
const {getArrayElementsFromFormula} = useUtilityServices()

const emits = defineEmits(['checkEnabledResultButton'])
const props = defineProps({
    resultOptions: {
      type: Object,
      default: () => {},
    }
})

const isHoverButton = ref(false)


function calculateResult() {
  showAllTooltipsOn();
  setInitEnabledSendForm(true);
  setAllowShowResultBlock(true);
  emits("checkEnabledResultButton");
}

watch(isExistGlobalErrorsValidationIgnoreHiddenElement, (newValue) => {
  if (newValue && showResultBtn.value) {
    setInitEnabledSendForm(false);
    setAllowShowResultBlock(false);
  }
})


const showResultBtn = computed(() => methodBeginningCalculationIsButton.value)

const formulaOnDataVariables = computed(() => {
  return processingVariablesOnFormula(
      variablesInFormula.value,
      localDependencyList.value
  );
})
/**
 *  рассчитываем формулу через eval
 * @returns {boolean|any}
 */
const isDisplayButtonOnFormulaDependency = computed(() => {
  try {
    return eval(formulaOnDataVariables.value);
  } catch (e) {
    if (devMode.value) {
      console.warn(
          "Рассчитываемая формула кнопки: ",
          formulaOnDataVariables.value
      );
    }
    return null;
  }
})
const showButtonOnDependency = computed(() =>  !isFormulaDisplayButton.value
    ? true
    : isDisplayButtonOnFormulaDependency.value
)

const showBtn = computed(() => showResultBtn.value && showButtonOnDependency.value && !checkAllowShowResultBlock.value)


const isFormulaDisplayButton = computed(() => Boolean(props.resultOptions?.formulaDisplayButton?.length))


const variablesInFormula = computed(() => isFormulaDisplayButton.value
    ? getArrayElementsFromFormula(
        props.resultOptions?.formulaDisplayButton
    )
    : [])

const localDependencyList = computed(() =>{
    let listObject = {};
    variablesInFormula.value.forEach((name) => {
      if (globalDependenciesList.value[name]) {
        listObject[name] = this.globalDependenciesList[name];
      }
    });
    return listObject;
})
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
    :dependency-formula-display="resultOptions?.formulaDisplayButton"
    :parsing-formula-variables="formulaOnDataVariables"
    hidden-value
    hidden-cost
  />
</template>
