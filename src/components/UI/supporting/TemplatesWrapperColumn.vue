<script setup>
import UiColumns from "@/components/UI/structural/column/UiColumns.vue";
import { propsTemplate } from "@/servises/UsePropsTemplatesSingle";

const emits = defineEmits(["changedValue"]);
const props = defineProps({
  changeStateParent: {
    type: Boolean,
    default: false,
  },
  ...propsTemplate.getProps([
    "template",
    "index",
    "parentIsShow",
    "parentName",
    "options"
  ]),
});
const changeValue = (data) => {
  emits("changedValue", data);
};
</script>

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
      :options="options"
      @changedValue="changeValue"
    ></ui-columns>
  </div>
</template>
