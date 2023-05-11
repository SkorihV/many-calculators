<template>
  <div
    class="calc__wrapper-group-data"
    :class="{'indent': isVisualSeparate}"
    v-show="showSection"
    :id="elementName"
    ref="parent"
  >
    <div
      class="calc__block-section-wrapper"
      :class="[classes, { 'isVisualSeparate': isVisualSeparate }]"
    >
      <background-image-element
        v-if="backgroundImageSettings"
        :image-settings-data="backgroundImageSettings"
      />
      <div class="calc__block-section-label-wrapper" v-if="isExistLabel">
        <icon-element-wrapper
          :icon-settings="iconSettingsSectionLabel"
          :alt="isExistLabel ? label : ''"
          :is-exist-label="isExistLabel"
        >
          <div class="calc__block-section-label-text">
            <div class="calc__block-section-label_main" v-if="isExistLabel">
              {{ label }}
            </div>
            <div class="calc__block-section-label_sub" v-if="isExistLabelSub">
              {{ labelSub }}
            </div>
          </div>
        </icon-element-wrapper>
      </div>
      <div
        class="calc__block-section-content-wrapper"
        :style="{ maxWidth: maxWidth }"
        :class="{ 'horizontal': isHorizontal }"
      >
        <template v-for="(item, inx) in templatesData" :key="inx">
          <templates-wrapper-column
            v-if="item?.template === 'UiColumns'"
            :parent-is-show="showSection"
            :template="item"
            :index="elementName + '_' + 'block-section' + '_' + inx"
            :parent-name="elementName"
            @changedValue="changeValue"
          />
          <templates-wrapper
            v-else
            :parent-is-show="showSection"
            :template="item"
            :index="elementName + '_' + 'block-section' + '_' + inx"
            :parent-name="elementName"
            @changedValue="changeValue"
          />
        </template>
      </div>
    </div>
  </div>
  <dev-block
    :label="label"
    :element-name="elementName"
    :is-visibility-from-dependency="showSection"
    :dependency-formula-display="dependencyFormulaDisplay"
    :parsing-formula-variables="formulaAfterProcessingVariables"
    hidden-cost
    hidden-value
  />
</template>

<script>
import TemplatesWrapper from "@/components/UI/supporting/TemplatesWrapper.vue";
import TemplatesWrapperColumn from "@/components/UI/supporting/TemplatesWrapperColumn.vue";
import devBlock from "@/components/UI/devMode/devBlock.vue";
import BackgroundImageElement from "@/components/UI/supporting/background-image-element.vue";
import IconElementWrapper from "@/components/UI/supporting/c_icon-element-wrapper.vue";
import { MixinsForProcessingFormula } from "@/mixins/MixinsForProcessingFormula";
import { MixinCurrentWidthElement } from "@/mixins/MixinCurrentWidthElement";

import { propsTemplate } from "@/servises/UsePropsTemplatesSingle";
import { useBaseStore } from "@/store/piniaStore";
import { mapState } from "pinia";
import UiColumns from "@/components/UI/structural/UiColumns.vue";

export default {
  name: "UiBlockSection",
  components: {
    UiColumns,
    BackgroundImageElement,
    TemplatesWrapper,
    devBlock,
    IconElementWrapper,
    TemplatesWrapperColumn,
  },
  mixins: [MixinsForProcessingFormula, MixinCurrentWidthElement],
  emits: ["changedValue"],
  props: {
    templatesData: {
      type: Array,
      default: () => [],
    },
    visualSeparate: {
      type: [Number, Boolean],
      default: false,
    },
    iconSettingsSectionLabel: {
      type: Object,
      default: () => {},
    },
    ...propsTemplate.getProps([
      "label",
      "labelSub",
      "elementName",
      "classes",
      "parentIsShow",
      "dependencyFormulaDisplay",
      "backgroundImageSettings",
      "maxWidthSide",
      "elementPosition",
    ]),
  },
  methods: {
    changeValue(data) {
      this.$emit("changedValue", data);
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
    ...mapState(useBaseStore, ["devMode"]),
    isExistLabel() {
      return Boolean(this.label?.toString()?.length);
    },
    isExistTemplatesData() {
      return Boolean(this.templatesData.length);
    },
    isExistLabelSub() {
      return Boolean(this.labelSub?.length);
    },
    isVisualSeparate() {
      return Boolean(this.visualSeparate);
    },
    showSection() {
      return Boolean(
        this.isExistTemplatesData &&
          this.parentIsShow &&
          this.isVisibilityFromDependency
      );
    },
    maxWidth() {
      return this.currentWidthElement > 600 ? this.maxWidthSide + "%" : "100%";
    },
    isHorizontal() {
      return this.elementPosition === "horizontal";
    },
  },
};
</script>
