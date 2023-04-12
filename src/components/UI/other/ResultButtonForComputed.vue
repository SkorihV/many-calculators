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

<script>
import IconElementWrapper from "@/components/UI/supporting/icon-element-wrapper.vue";
import { mapState } from "pinia";
import { useBaseStore } from "@/store/piniaStore";
import { MixinsUtilityServices } from "@/mixins/MixinsUtilityServices";
import devBlock from "@/components/UI/devMode/devBlock.vue";
import { processingVariablesOnFormula } from "@/servises/ProcessingFormula";

export default {
  name: "ResultButtonForComputed",
  components: { IconElementWrapper, devBlock },
  mixins: [MixinsUtilityServices],
  props: {
    resultOptions: {
      type: Object,
      default: () => {},
    },
  },
  emits: ["checkEnabledResultButton"],
  data() {
    return {
      isHoverButton: false,
    };
  },
  methods: {
    calculateResult() {
      this.showAllTooltipsOn();
      this.setInitEnabledSendForm(true);
      this.setAllowShowResultBlock(true);
      this.$emit("checkEnabledResultButton");
    },
  },
  watch: {
    isExistGlobalErrorsValidationIgnoreHiddenElement(newValue) {
      if (newValue && this.showResultBtn) {
        this.setInitEnabledSendForm(false);
        this.setAllowShowResultBlock(false);
      }
    },
  },
  computed: {
    ...mapState(useBaseStore, [
      "methodBeginningCalculationIsButton",
      "showAllTooltipsOn",
      "setInitEnabledSendForm",
      "isExistGlobalErrorsValidationIgnoreHiddenElement",
      "setAllowShowResultBlock",
      "checkAllowShowResultBlock",
      "globalDependenciesList",
      "devMode",
    ]),
    iconSettings() {
      return this.options;
    },
    showResultBtn() {
      return this.methodBeginningCalculationIsButton;
    },
    showBtn() {
      return (
        this.showResultBtn &&
        this.showButtonOnDependency &&
        !this.checkAllowShowResultBlock
      );
    },
    isFormulaDisplayButton() {
      return Boolean(this.resultOptions?.formulaDisplayButton?.length);
    },
    variablesInFormula() {
      return this.isFormulaDisplayButton
        ? this.getArrayElementsFromFormula(
            this.resultOptions?.formulaDisplayButton
          )
        : [];
    },
    localDependencyList() {
      let listObject = {};
      this.variablesInFormula.forEach((name) => {
        if (this.globalDependenciesList[name]) {
          listObject[name] = this.globalDependenciesList[name];
        }
      });
      return listObject;
    },
    formulaOnDataVariables() {
      return processingVariablesOnFormula(
        this.variablesInFormula,
        this.localDependencyList
      );
    },
    /**
     *  рассчитываем формулу через eval
     * @returns {boolean|any}
     */
    isDisplayButtonOnFormulaDependency() {
      try {
        return eval(this.formulaOnDataVariables);
      } catch (e) {
        if (this.devMode) {
          console.warn(
            "Рассчитываемая формула кнопки: ",
            this.formulaOnDataVariables
          );
        }
        return null;
      }
    },
    showButtonOnDependency() {
      return !this.isFormulaDisplayButton
        ? true
        : this.isDisplayButtonOnFormulaDependency;
    },
  },
};
</script>

<style scoped></style>
