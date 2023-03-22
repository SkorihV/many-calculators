<template>
  <div
    class="calc__wrapper-group-data"
    v-show="
      (templateData?.rightSide.length || templateData?.leftSide.length) &&
      isVisibilityFromDependency
    "
    :id="elementName"
    ref="parent"
  >
    <div
      class="calc__bisection-wrapper"
      :class="[classes, { isVisualSeparate: isVisualSeparate }]"
    >
      <background-image-element
        v-if="templateData?.backgroundImageSettings"
        :image-settings-data="templateData?.backgroundImageSettings"
      />
      <div class="calc__bisection-label-wrapper" v-if="isShowLabel">
        <icon-element-wrapper
        :icon-settings="iconSettings"
        >
          <div class="calc__bisection-label-text">
            <div
              class="calc__bisection-label_main"
              v-if="templateData?.label?.length"
            >
              {{ templateData?.label }}
            </div>
            <div
              class="calc__bisection-label_sub"
              v-if="templateData?.labelSub?.length"
            >
              {{ templateData?.labelSub }}
            </div>
          </div>
        </icon-element-wrapper>
      </div>
      <div class="calc__bisection-label-desktop">
        <div
          class="calc__bisection-left-label desktop"
          :style="styleWidthLeftSide"
        >
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
            :parent-name="elementName"
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
            :parent-name="elementName"
            @changedValue="changeValue"
          />
        </div>
      </div>
    </div>
  </div>
  <dev-block
    :label="label"
    :element-name="elementName"
    :is-visibility-from-dependency="isVisibilityFromDependency"
    :dependency-formula-display="dependencyFormulaDisplay"
    :parsing-formula-variables="formulaAfterProcessingVariables"
    hidden-cost
    hidden-value
    :left-dependency-formula-display="dependencyFormulaDisplayLeftSide"
    :left-parsing-formula-variables="leftDependencyVariablesFormula"
    :right-dependency-formula-display="dependencyFormulaDisplayRightSide"
    :right-parsing-formula-variables="rightDependencyVariablesFormula"
  ></dev-block>
</template>

<script>
import TemplatesWrapper from "@/components/UI/supporting/TemplatesWrapper.vue";
import devBlock from "@/components/UI/devMode/devBlock.vue";
import { MixinsForProcessingFormula } from "@/mixins/MixinsForProcessingFormula";
import IconElementWrapper from "@/components/UI/supporting/icon-element-wrapper.vue";

import {propsTemplate} from "@/servises/UsePropsTemplatesSingle";
import { useBaseStore } from "@/store/piniaStore";
import { mapState } from "pinia";
import BackgroundImageElement from "@/components/UI/supporting/background-image-element.vue";

export default {
  name: "UiBisection",
  components: { BackgroundImageElement, TemplatesWrapper, devBlock, IconElementWrapper },
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
    ...propsTemplate.getProps([
      "label",
      "elementName",
      "classes",
      "parentIsShow",
      "dependencyFormulaDisplay",
      "iconSettings",
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

    getArrayElementsFormula(formula) {
      const result = this.getArrayElementsFromFormula(formula);
      this.constructLocalListElementDependencyInFormula(result);
      return result;
    },
    getVariablesDataInFormula(formula) {
      return this.processingVariablesOnFormula(formula);
    },
    processingFormula(formula) {
      try {
        return eval(formula);
      } catch (e) {
        if (this.devMode) {
          console.error(e.message, formula);
        }
        return false;
      }
    },
  },
  computed: {
    ...mapState(useBaseStore, ["devMode", "getImageDir"]),
    leftDependencyVariablesFormula() {
      const formula = this.getArrayElementsFormula(
        this.dependencyFormulaDisplayLeftSide
      );
      return this.getVariablesDataInFormula(formula);
    },
    rightDependencyVariablesFormula() {
      const formula = this.getArrayElementsFormula(
        this.dependencyFormulaDisplayRightSide
      );
      return this.getVariablesDataInFormula(formula);
    },
    /**
     * @returns {any|boolean}
     */
    isShowLeftSide() {
      if (!this.dependencyFormulaDisplayLeftSide?.length) {
        return true;
      }
      return this.processingFormula(this.leftDependencyVariablesFormula);
    },
    /**
     *
     * @returns {any|boolean}
     */
    isShowRightSide() {
      if (!this.dependencyFormulaDisplayRightSide?.length) {
        return true;
      }
      return this.processingFormula(this.rightDependencyVariablesFormula);
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
      return (
        this.templateData?.label?.length || this.templateData?.label?.lengthSub
      );
    },
    isVisualSeparate() {
      return !!this.templateData?.visuallySeparateElement;
    },
  },
};
</script>
