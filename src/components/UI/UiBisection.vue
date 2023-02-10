<template>
  <div
    class="calc__bisection-wrapper"
    :class="[classes, {'isVisualSeparate' : isVisualSeparate}]"
    v-show="
      (templateData?.rightSide.length || templateData?.leftSide.length) &&
      isVisibilityFromDependency
    "
  >
    <background-image-element
      v-if="templateData?.backgroundImageSettings"
      :image-settings-data="templateData?.backgroundImageSettings"
    />
    <div class="calc__bisection-label-wrapper" v-if="isShowLabel">
      <div class="calc__bisection-label_main" v-if="templateData?.label?.length">
        {{ templateData?.label }}
      </div>
      <div class="calc__bisection-label_sub" v-if="templateData?.labelSub?.length">
        {{ templateData?.labelSub }}
      </div>
    </div>
    <div class="calc__bisection-label-desktop">
      <div class="calc__bisection-left-label desktop" :style="styleWidthLeftSide">
        {{ templateData?.labelLeft }}
      </div>
      <div class="calc__bisection-right-label desktop">
        {{ templateData?.labelRight }}
      </div>
    </div>
    <div class="calc__bisection-content-wrapper">

      <div
        v-show="isShowLeftSide"
        class="calc__bisection-left-side-wrapper"
        :style="styleWidthLeftSide"
      >
        <div class="calc__bisection-left-label mobile">
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
        <div class="calc__bisection-right-label mobile">
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

import UsePropsTemplates from "@/components/UI/UsePropsTemplates";
import { useBaseStore } from "@/store/piniaStore";
import { mapState } from "pinia";
import BackgroundImageElement from "@/components/UI/background-image-element.vue";

export default {
  name: "UiBisection",
  components: { BackgroundImageElement, TemplatesWrapper },
  emits: ["changedValue"],
  mixins: [MixinsForProcessingFormula],
  props: {
    templateData: {
      type: Object,
      default: () => {},
    },
    widthLeftSide: {
      type: [Number, String],
      default: 50,
    },
    dependencyFormulaDisplayLeftSide: {
      type: String,
      default: null,
    },
    dependencyFormulaDisplayRightSide: {
      type: String,
      default: null,
    },
    ...UsePropsTemplates([
      "label",
      "elementName",
      "classes",
      "parentIsShow",
      "dependencyFormulaDisplay",
    ]),
  },
  mounted() {
    window.addEventListener("resize", () => {
      this.inMobile = window.innerWidth <= 768;
    });
  },
  data() {
    return {
      inMobile: false,
      absoluteMaxWidth: 70,
      absoluteMinWidth: 30,
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
    ...mapState(useBaseStore, ["devMode", "getImageDir"]),
    /**
     *
     * @returns {any|boolean}
     */
    isShowLeftSide() {
      if (!this.dependencyFormulaDisplayLeftSide?.length) {
        return true;
      }
      return this.processingFormula(this.dependencyFormulaDisplayLeftSide);
    },
    /**
     *
     * @returns {any|boolean}
     */
    isShowRightSide() {
      if (!this.dependencyFormulaDisplayRightSide?.length) {
        return true;
      }
      return this.processingFormula(this.dependencyFormulaDisplayRightSide);
    },
    /**
     *
     * @returns {string}
     */
    styleWidthLeftSide() {
      if (this.widthLeftSide > this.absoluteMaxWidth) {
        this.widthLeftSide = this.absoluteMaxWidth;
      }
      if (this.widthLeftSide < this.absoluteMinWidth) {
        this.widthLeftSide = this.absoluteMinWidth;
      }
      if (this.inMobile) {
        return "max-width:" + 100 + "%";
      }
      return "max-width:" + this.widthLeftSide + "%";
    },
    /**
     *
     * @returns {string}
     */
    styleWidthRightSide() {
      if (this.widthLeftSide > this.absoluteMaxWidth) {
        this.widthLeftSide = this.absoluteMaxWidth;
      }
      if (this.widthLeftSide < this.absoluteMinWidth) {
        this.widthLeftSide = this.absoluteMinWidth;
      }
      if (this.inMobile) {
        return "max-width:" + 100 + "%";
      }
      return "max-width:" + (100 - this.widthLeftSide) + "%";
    },
    isShowLabel() {
      return this.templateData?.label?.length || this.templateData?.label?.lengthSub;
    },
    isVisualSeparate() {
      return !!this.templateData?.visuallySeparateElement;
    }
  },
};
</script>
