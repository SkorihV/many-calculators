<script setup>
import UiTab from "@/components/UI/structural/UiTab.vue";
import UiAccordion from "@/components/UI/structural/c_UiAccordion.vue";
import UiBlockSection from "@/components/UI/structural/UiBlockSection.vue";
import { propsTemplate } from "@/servises/UsePropsTemplatesSingle";

const emits = defineEmits(["changedValue"]);
const props = defineProps({
  ...propsTemplate.getProps(["template", "index", "parentIsShow"]),
});

const changeValue = (data) => {
  emits("changedValue", data);
};
</script>

<template>
  <div class="calc__template-main-wrapper_structural">
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
      :icon-settings-accordion-label="template?.iconSettingsAccordionLabel"
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
      :icon-settings-tabs-label="template?.iconSettingsTabsLabel"
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
      :icon-settings-section-label="template?.iconSettingsSectionLabel"
      :background-image-settings="template?.backgroundImageSettings"
      :element-position="template?.elementPosition"
      :max-width-side="template?.maxWidthSide"
      @changedValue="changeValue"
    />
  </div>
</template>
