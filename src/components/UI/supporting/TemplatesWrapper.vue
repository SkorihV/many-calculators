<template>
  <ui-input
    v-if="template.template === 'UiInput'"
    :min="template?.min"
    :max="template?.max"
    :cost="template?.cost"
    :unit="template?.unit"
    :step="template?.step"
    :discrete-step="template?.discreteStep"
    :label="template?.label"
    :input-placeholder="template?.placeholder"
    :controls="template?.controls"
    :input-value="template?.value"
    :is-column="template?.isColumn"
    :is-stretch="template?.isStretch"
    :not-empty="template?.notEmpty"
    :is-currency="template?.isCurrency"
    :data-type="template?.dataType"
    :classes="template?.classes"
    :element-name="
      template?.elementName?.length
        ? template?.elementName
        : template?.json_id || 'UiInput' + index
    "
    :formula-processing-logic="template?.formulaProcessingLogic"
    :dependency-formula-display="template?.dependencyFormulaDisplay"
    :dependency-prices="template?.dependencyPrices"
    :form-output-method="template?.formOutputMethod"
    :result-output-method="template?.resultOutputMethod"
    :exclude-from-calculations="template?.excludeFromCalculations"
    :parent-is-show="parentIsShow"
    :parent-name="parentName"
    :template-name="template.template"
    :position-element="template?.position"
    :zero-value-display-ignore="template?.zeroValueDisplayIgnore"
    :icon-settings="template?.iconSettings"
    @changedValue="changeValue"
  >
    <template v-slot:prompt>
      <ui-prompt :prompt-text="template.prompt" />
    </template>
  </ui-input>

  <ui-checkbox
    v-else-if="template.template === 'UiCheckbox'"
    :cost="template?.cost"
    :label="template?.label"
    :is-column="template?.isColumn"
    :button-text-checked="template?.buttonTextChecked"
    :button-text="template?.buttonText"
    :is-need-choice="template?.isNeedChoice"
    :type-display-class="template?.typeDisplayClass"
    :element-name="
      template?.elementName?.length
        ? template?.elementName
        : template?.json_id || 'UiCheckbox' + index
    "
    :formula-processing-logic="template?.formulaProcessingLogic"
    :dependency-formula-display="template?.dependencyFormulaDisplay"
    :form-output-method="template?.formOutputMethod"
    :result-output-method="template?.resultOutputMethod"
    :dependency-prices="template?.dependencyPrices"
    :exclude-from-calculations="template?.excludeFromCalculations"
    :scroll-into-name="template?.scrollIntoName"
    :classes="template?.classes"
    :parent-is-show="parentIsShow"
    :base-value="template?.baseValue"
    :parent-name="parentName"
    :template-name="template.template"
    :position-element="template?.position"
    :zero-value-display-ignore="template?.zeroValueDisplayIgnore"
    :icon-settings="template?.iconSettings"
    @changedValue="changeValue"
  >
    <template v-slot:prompt>
      <ui-prompt :prompt-text="template.prompt" />
    </template>
  </ui-checkbox>

  <UiRadio
    v-else-if="template.template === 'UiRadio'"
    :label="template?.label"
    :is-column="template?.isColumn"
    :radio-values="template?.values"
    :not-empty="template?.notEmpty"
    :selected-item="template?.selectedItem"
    :is-need-choice="template?.isNeedChoice"
    :type-display-class="template?.typeDisplayClass"
    :is-stretch="template?.isStretch"
    :element-name="
      template?.elementName?.length
        ? template?.elementName
        : template?.json_id || 'UiRadio' + index
    "
    :formula-processing-logic="template?.formulaProcessingLogic"
    :dependency-formula-display="template?.dependencyFormulaDisplay"
    :form-output-method="template?.formOutputMethod"
    :result-output-method="template?.resultOutputMethod"
    :exclude-from-calculations="template?.excludeFromCalculations"
    :classes="template?.classes"
    :parent-is-show="parentIsShow"
    :parent-name="parentName"
    :template-name="template.template"
    :position-element="template?.position"
    :zero-value-display-ignore="template?.zeroValueDisplayIgnore"
    :icon-settings="template?.iconSettings"
    @changedValue="changeValue"
  >
    <template v-slot:prompt>
      <ui-prompt :prompt-text="template.prompt" />
    </template>
  </UiRadio>

  <ui-range
    v-else-if="template.template === 'UiRange'"
    :min="template?.min"
    :max="template?.max"
    :unit="template?.unit"
    :step="template?.step"
    :cost="template?.cost"
    :label="template?.label"
    :range-value="template?.value"
    :show-steps="template?.showSteps"
    :step-prompt="template?.stepPrompt"
    :is-need-choice="template?.isNeedChoice"
    :is-column="template?.isColumn"
    :show-static-value="template?.showStaticValue"
    :show-dynamic-value="template?.showDynamicValue"
    :element-name="
      template?.elementName?.length
        ? template?.elementName
        : template?.json_id || 'UiRange' + index
    "
    :formula-processing-logic="template?.formulaProcessingLogic"
    :dependency-formula-display="template?.dependencyFormulaDisplay"
    :dependency-prices="template?.dependencyPrices"
    :not-empty="template?.notEmpty"
    :form-output-method="template?.formOutputMethod"
    :result-output-method="template?.resultOutputMethod"
    :exclude-from-calculations="template?.excludeFromCalculations"
    :classes="template?.classes"
    :parent-is-show="parentIsShow"
    :parent-name="parentName"
    :template-name="template.template"
    :position-element="template?.position"
    :zero-value-display-ignore="template?.zeroValueDisplayIgnore"
    :icon-settings="template?.iconSettings"
    @changedValue="changeValue"
  >
    <template v-slot:prompt>
      <ui-prompt :prompt-text="template.prompt" />
    </template>
  </ui-range>

  <ui-select
    v-else-if="template.template === 'UiSelect'"
    :label="template?.label"
    :not-empty="template?.notEmpty"
    :is-column="template?.isColumn"
    :is-stretch="template?.isStretch"
    :select-values="template?.values"
    :is-need-choice="template?.isNeedChoice"
    :selected-item="template?.selectedItem"
    :element-name="
      template?.elementName?.length
        ? template?.elementName
        : template?.json_id || 'UiSelect' + index
    "
    :formula-processing-logic="template?.formulaProcessingLogic"
    :dependency-formula-display="template?.dependencyFormulaDisplay"
    :form-output-method="template?.formOutputMethod"
    :result-output-method="template?.resultOutputMethod"
    :exclude-from-calculations="template?.excludeFromCalculations"
    :classes="template?.classes"
    :parent-is-show="parentIsShow"
    :parent-name="parentName"
    :template-name="template.template"
    :position-element="template?.position"
    :zero-value-display-ignore="template?.zeroValueDisplayIgnore"
    :icon-settings="template?.iconSettings"
    @changedValue="changeValue"
  >
    <template v-slot:prompt>
      <ui-prompt :prompt-text="template.prompt" />
    </template>
  </ui-select>

  <ui-image
    v-else-if="template.template === 'UiImage'"
    :label="template?.label"
    :default-image="template?.defaultImage"
    :dependency-images="template?.dependencyImages"
    :max-width="template?.maxWidth"
    :max-height="template?.maxHeight"
    :prompt="template?.prompt"
    :element-name="template?.json_id || 'UiImage' + index"
    :dependency-formula-display="template?.dependencyFormulaDisplay"
    :classes="template?.classes"
    :parent-is-show="parentIsShow"
  ></ui-image>

  <ui-system
    v-else-if="template.template === 'UiSystem'"
    :cost="template?.cost"
    :dependency-prices="template?.dependencyPrices"
    :parent-is-show="parentIsShow"
    :element-name="
      template?.elementName?.length
        ? template?.elementName
        : template?.json_id || 'UiSystem' + index
    "
    :formula-processing-logic="template?.formulaProcessingLogic"
    :parent-name="parentName"
    :template-name="template.template"
    :dependency-formula-display="template?.dependencyFormulaDisplay"
    :position-element="template?.position"
    @changedValue="changeValue"
  ></ui-system>
</template>

<script>
import UiRange from "@/components/UI/mainCalculated/UiRange.vue";
import UiInput from "@/components/UI/mainCalculated/UiInput.vue";
import UiSelect from "@/components/UI/mainCalculated/UiSelect.vue";
import UiRadio from "@/components/UI/mainCalculated/UiRadio.vue";
import UiCheckbox from "@/components/UI/mainCalculated/UiCheckbox.vue";
import UiImage from "@/components/UI/mainCalculated/UiImage.vue";
import UiSystem from "@/components/UI/mainCalculated/UiSystem.vue";
import UiPrompt from "@/components/UI/other/UiPrompt.vue";
import { propsTemplate } from "@/servises/UsePropsTemplatesSingle";

export default {
  name: "TemplatesWrapper",
  emits: ["changedValue"],
  components: {
    UiRange,
    UiInput,
    UiSelect,
    UiRadio,
    UiCheckbox,
    UiPrompt,
    UiImage,
    UiSystem,
  },
  props: {
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
