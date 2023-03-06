<template>
  <button
    class="calc__show-result-btn"
    @click="calculateResult"
    v-if="showResultBtn || showResultBtnAfterValidation"
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
</template>

<script>
import IconElementWrapper from "@/components/UI/supporting/icon-element-wrapper.vue";
import { mapState } from "pinia";
import { useBaseStore } from "@/store/piniaStore";
export default {
  name: "ResultButtonForComputed",
  components: {IconElementWrapper},
  props: {
    resultOptions: {
      type: Object,
      default: () => {}
    }
  },
  emits: ["checkEnabledResultButton"],
  data() {
    return {
      isHoverButton: false
    }
  },
  methods: {
    calculateResult() {
      this.showAllTooltipsOn();
      this.setInitEnabledSendForm(true);
      this.setAllowShowResultBlock(true);
      this.$emit('checkEnabledResultButton');
    },
  },
  watch: {
    isExistGlobalErrorsValidationTakeIntoHiddenElement(newValue) {
      if (!newValue && this.isMethodBeginningCalculation) {
        this.setAllowShowResultBlock(false);
      }
    }
  },
  computed: {
    ...mapState(useBaseStore, [
      "getMethodBeginningCalculation",
      "showAllTooltipsOn",
      "setInitEnabledSendForm",
      "isExistGlobalErrorsValidationTakeIntoHiddenElement",
      "setAllowShowResultBlock"
    ]),
    iconSettings() {
      return this.options
    },
    showResultBtn() {
      return this.getMethodBeginningCalculation === "useButton";
    },
    isMethodBeginningCalculation() {
      return this.getMethodBeginningCalculation === "useButtonAfterCalculation";
    },
    showResultBtnAfterValidation() {
      return this.isMethodBeginningCalculation && !this.isExistGlobalErrorsValidationTakeIntoHiddenElement;
    }
  },
};
</script>

<style scoped>

</style>
