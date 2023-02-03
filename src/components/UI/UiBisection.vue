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
      <div class="calc__background-image-wrapper" v-if="isBackgroundImage" :style="[...styleBackground]"></div>
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

import { useBaseStore } from "@/store/piniaStore";
import { mapState } from "pinia";
import UsePropsTemplates from "@/components/UI/UsePropsTemplates";

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
      "dependencyFormulaDisplay"
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
    isBackgroundImage() {
      return !!this?.templateData?.backgroundImageSettings?.image?.filename;
    },
    styleBackgroundImageUrl() {
      return 'background-image : url("' + this.getImageDir + this.templateData?.backgroundImageSettings?.image?.filename + '");';
    },
    styleBackgroundRepeat() {
      return 'background-repeat:' + this.templateData?.backgroundImageSettings?.backgroundRepeat + ';';
    },
    styleBackgroundPosition() {
      return 'background-position:' + this.templateData?.backgroundImageSettings?.backgroundPosition?.replace('-', ' ') + ';';
    },
    styleBackgroundBehaviorImage() {
      let size = this.templateData?.backgroundImageSettings?.fixedSize ?
        (this.templateData?.backgroundImageSettings?.maxWidth || 250) + '' + this.templateData?.backgroundImageSettings?.unitSize + ' ' + (this.templateData?.backgroundImageSettings?.maxHeight || 250) + '' + this.templateData?.backgroundImageSettings?.unitSize
        :
        this.templateData?.backgroundImageSettings?.behaviorImage;
      return 'background-size:' + size + ';';
    },
    styleBackground() {
      if (this.isBackgroundImage) {
        return [
          this.styleBackgroundImageUrl,
          this.styleBackgroundRepeat,
          this.styleBackgroundPosition,
          this.styleBackgroundBehaviorImage
        ]
      }
      return [];
    }
  },

};
</script>
