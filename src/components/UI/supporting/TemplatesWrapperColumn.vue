<template>
  <div class="calc__template-main-wrapper_structural">
    <ui-columns
      v-if="template?.template === 'UiColumns'"
      :column-list="template?.columns"
      :label="template?.label"
      :classes="template?.classes"
      :dependency-formula-display="template?.dependencyFormulaDisplay"
      :parent-is-show="parentIsShow"
      :icon-settings-columns-label="template?.iconSettingsColumnsLabel"
      :changed-state-parent="changeStateParent"
      :element-name="
        template?.elementName?.length
          ? template?.elementName
          : template?.json_id || 'UiColumns' + index
      "
      :adaptation-method="template?.adaptationMethod"
      :parent-name="parentName"
      @changedValue="changeValue"
    ></ui-columns>
  </div>
</template>

<script>
import UiColumns from "@/components/UI/structural/c_UiColumns.vue";
import { propsTemplate } from "@/servises/UsePropsTemplatesSingle";

export default {
  name: "TemplatesWrapper",
  components: {
    UiColumns,
  },
  emits: ["changedValue"],
  props: {
    changeStateParent: {
      type: Boolean,
      default: false,
    },
    ...propsTemplate.getProps([
      "template",
      "index",
      "parentIsShow",
      "parentName",
    ]),
  },
  methods: {
    changeValue(data) {
      this.$emit("changedValue", data);
    },
  },
};
</script>

<style scoped></style>
