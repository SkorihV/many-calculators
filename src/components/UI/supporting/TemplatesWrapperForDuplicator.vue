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
    @changedValue="changeValue"
  />
  <ui-bisection
    v-else-if="template.template === 'UiBisection'"
    :template-data="template"
    :label="template?.label"
    :width-left-side="template?.widthLeftSide"
    :classes="template?.classes"
    :element-name="
      template?.elementName?.length
        ? template?.elementName
        : template?.json_id || 'UiBisection' + index
    "
    :parent-is-show="parentIsShow"
    :dependency-formula-display="template?.dependencyFormulaDisplay"
    :dependency-formula-display-left-side="
      template?.dependencyFormulaDisplayLeftSide
    "
    :dependency-formula-display-right-side="
      template?.dependencyFormulaDisplayRightSide
    "
    @changedValue="changeValue"
  />
</template>

<script>
import UiTab from "@/components/UI/structural/UiTab.vue";
import UiAccordion from "@/components/UI/structural/UiAccordion.vue";
import UiBisection from "@/components/UI/structural/UiBisection.vue";
import {propsTemplate} from "@/servises/UsePropsTemplatesSingle";

export default {
  name: "TemplatesWrapperForDuplicator",
  emits: ["changedValue"],
  components: {
    UiTab,
    UiAccordion,
    UiBisection,
  },
  props: {
    ...propsTemplate.getProps(["template", "index", "parentIsShow", "parentName"]),
  },
  methods: {
    changeValue(data) {
      this.$emit("changedValue", data);
    },
  },
};
</script>

<style scoped></style>
