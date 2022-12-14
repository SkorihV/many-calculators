<template>
  <div
    class="calc__bisection-wrapper"
    :class="[classes]"
    v-show="
      (templateData?.rightSide.length || templateData?.leftSide.length) &&
      isVisibilityFromDependency
    "
  >
    <div class="calc__bisection-label" v-if="templateData?.label?.length">
      {{ templateData?.label }}
    </div>
    <div class="calc__bisection-content-wrapper">
      <div
        v-show="isShowLeftSide"
        class="calc__bisection-left-side-wrapper"
        :style="styleWidthLeftSide"
      >
        <div
          class="calc__bisection-left-label"
          v-if="templateData?.labelLeft.length"
        >
          {{ templateData?.labelLeft }}
        </div>
        <templates-wrapper
          v-for="(template, inx) in templateData?.leftSide"
          :parent-is-show="isVisibilityFromDependency && isShowLeftSide"
          :key="inx"
          :template="template"
          :index="elementName + '_' + 'left' + '_' + inx"
          @changedValue="changeValue"
        />
      </div>
      <div
        v-show="isShowRightSide"
        class="calc__bisection-right-side-wrapper"
        :style="styleWidthRightSide"
      >
        <div
          class="calc__bisection-right-label"
          v-if="templateData?.labelRight.length"
        >
          {{ templateData?.labelRight }}
        </div>
        <templates-wrapper
          v-for="(template, inx) in templateData?.rightSide"
          :parent-is-show="isVisibilityFromDependency && isShowRightSide"
          :key="inx"
          :template="template"
          :index="elementName + '_' + 'right' + '_' + inx"
          @changedValue="changeValue"
        />
      </div>
    </div>
  </div>
</template>

<script>
import TemplatesWrapper from "@/components/UI/TemplatesWrapper";
import { MixinsForProcessingFormula } from "@/components/UI/MixinsForProcessingFormula";

import {mapGetters} from "vuex";

export default {
  name: "UiBisection",
  components: { TemplatesWrapper },
  emits: ["changedValue"],
  mixins: [MixinsForProcessingFormula],
  props: {
    templateData: {
      type: Object,
      default: () => {},
    },
    /**
     * ??????????????????
     */
    label: {
      type: String,
      default: "",
    },
    widthLeftSide: {
      type: [Number, String],
      default: 50,
    },
    elementName: {
      type: String,
      default: Math.random().toString(),
    },
    dependencyFormulaDisplayLeftSide: {
      type: String,
      default: null,
    },
    dependencyFormulaDisplayRightSide: {
      type: String,
      default: null,
    },
    classes: {
      type: String,
      default: null,
    },
  },
  mounted() {
    window.addEventListener("resize", () => {
      this.inMobile = window.innerWidth <= 768;
    });
  },
  data() {
    return {
      inMobile: false,
    };
  },
  methods: {
    changeValue(data) {
      this.$emit("changedValue", data);
    },

    processingFormula(formula) {
      let result = this.getArrayElementsFromFormula(formula);
      this.constructLocalListElementDependencyInFormula(result);
      result = this.processingVariablesOnFormula(result);
      try {
        return eval(result);
      } catch (e) {
        if (this.devMode) {
          console.error(e.message, result);
        }
        return false;
      }
    },
  },
  computed: {
    ...mapGetters(["devMode"]),
    isShowLeftSide() {
      if (!this.dependencyFormulaDisplayLeftSide?.length) {
        return true;
      }
      return this.processingFormula(this.dependencyFormulaDisplayLeftSide);
    },
    isShowRightSide() {
      if (!this.dependencyFormulaDisplayRightSide?.length) {
        return true;
      }
      return this.processingFormula(this.dependencyFormulaDisplayRightSide);
    },

    styleWidthLeftSide() {
      if (this.widthLeftSide > 70) {
        this.widthLeftSide = 70;
      }
      if (this.widthLeftSide < 30) {
        this.widthLeftSide = 30;
      }
      if (this.inMobile) {
        return "max-width:" + 100 + "%";
      }
      return "max-width:" + this.widthLeftSide + "%";
    },
    styleWidthRightSide() {
      if (this.widthLeftSide > 70) {
        this.widthLeftSide = 70;
      }
      if (this.widthLeftSide < 30) {
        this.widthLeftSide = 30;
      }
      if (this.inMobile) {
        return "max-width:" + 100 + "%";
      }
      return "max-width:" + (100 - this.widthLeftSide) + "%";
    },
  },
};
</script>

<style scoped lang="scss"></style>
