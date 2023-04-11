<template>
  <ui-accordion
    v-if="template.template === 'UiAccordion'"
    :accordion-data="template"
    :label="template?.label"
    :classes="template?.classes"
    :element-name="
      template?.elementName?.length
        ? template?.elementName
        : template?.json_id || 'UiAccordion' + index
    "
    :parent-is-show="parentIsShow"
    :dependency-formula-display="template?.dependencyFormulaDisplay"
    :icon-settings="template?.iconSettings"
    @changedValue="changeValue"
  />
  <ui-tab
    v-else-if="template.template === 'UiTab'"
    :tab-data="template"
    :label="template?.label"
    :classes="template?.classes"
    :element-name="
      template?.elementName?.length
        ? template?.elementName
        : template?.json_id || 'UiTab' + index
    "
    :parent-is-show="parentIsShow"
    :dependency-formula-display="template?.dependencyFormulaDisplay"
    :icon-settings="template?.iconSettings"
    @changedValue="changeValue"
  />
  <ui-block-section
    v-else-if="template.template === 'UiBlockSection'"
    :templates-data="template?.templates"
    :label="template?.label"
    :labelSub="template?.labelSub"
    :classes="template?.classes"
    :element-name="
      template?.elementName?.length
        ? template?.elementName
        : template?.json_id || 'UiBlockSection' + index
    "
    :parent-is-show="parentIsShow"
    :visual-separate="template?.visuallySeparateElement"
    :dependency-formula-display="template?.dependencyFormulaDisplay"
    :icon-settings="template?.iconSettings"
    :background-image-settings="template?.backgroundImageSettings"
    :element-position="template?.elementPosition"
    :max-width-side="template?.maxWidthSide"
    @changedValue="changeValue"
  />
</template>

<script>
import UiTab from "@/components/UI/structural/UiTab.vue";
import UiAccordion from "@/components/UI/structural/UiAccordion.vue";
import UiBlockSection from "@/components/UI/structural/UiBlockSection.vue";
import { propsTemplate } from "@/servises/UsePropsTemplatesSingle";

export default {
  name: "TemplatesWrapperStructural",
  emits: ["changedValue"],
  components: {
    UiTab,
    UiAccordion,
    UiBlockSection,
  },
  props: {
    ...propsTemplate.getProps(["template", "index", "parentIsShow"]),
  },
  methods: {
    changeValue(data) {
      this.$emit("changedValue", data);
    },
  },
};
</script>

<style scoped></style>
