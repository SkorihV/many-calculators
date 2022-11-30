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
    :not-empty="template?.notEmpty"
    :is-currency="template?.isCurrency"
    :only-number="template?.onlyNumber"
    :classes="template?.classes"
    :only-integer="template?.onlyInteger"
    :custom-error-text="template?.customErrorText"
    :custom-error-pattern="template?.customErrorPattern"
    :element-name="
      template?.elementName?.length
        ? template?.elementName
        : template?.json_id || 'UiInput' + index
    "
    :formula-processing-logic="template?.formulaProcessingLogic"
    :dependency-formula-display="template?.dependencyFormulaDisplay"
    :dependency-prices="template?.dependencyPrices"
    :form-output-method="template?.formOutputMethod"
    :exclude-from-calculations="template?.excludeFromCalculations"
    :parent-is-show="parentIsShow"
    :parent-name="parentName"
    :template-name="template.template"
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
    :checkbox-value="template?.value"
    :is-checked="template?.isChecked"
    :label-second="template?.labelSecond"
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
    :dependency-prices="template?.dependencyPrices"
    :exclude-from-calculations="template?.excludeFromCalculations"
    :classes="template?.classes"
    :parent-is-show="parentIsShow"
    :parent-name="parentName"
    :template-name="template.template"
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
    :element-name="
      template?.elementName?.length
        ? template?.elementName
        : template?.json_id || 'UiRadio' + index
    "
    :formula-processing-logic="template?.formulaProcessingLogic"
    :dependency-formula-display="template?.dependencyFormulaDisplay"
    :form-output-method="template?.formOutputMethod"
    :exclude-from-calculations="template?.excludeFromCalculations"
    :classes="template?.classes"
    :parent-is-show="parentIsShow"
    :parent-name="parentName"
    :template-name="template.template"
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
    :exclude-from-calculations="template?.excludeFromCalculations"
    :classes="template?.classes"
    :parent-is-show="parentIsShow"
    :parent-name="parentName"
    :template-name="template.template"
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
    :exclude-from-calculations="template?.excludeFromCalculations"
    :classes="template?.classes"
    :parent-is-show="parentIsShow"
    :parent-name="parentName"
    :template-name="template.template"
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
    :element-name="template?.json_id || 'UiImage' + inx"
    :dependency-formula-display="template?.dependencyFormulaDisplay"
    :classes="template?.classes"
    :parent-is-show="parentIsShow"
  ></ui-image>
  <ui-system
    v-if="template.template === 'UiSystem'"
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
    @changedValue="changeValue"
  ></ui-system>
</template>

<script>
import UiRange from "@/components/UI/UiRange";
import UiInput from "@/components/UI/UiInput";
import UiSelect from "@/components/UI/UiSelect";
import UiRadio from "@/components/UI/UiRadio";
import UiCheckbox from "@/components/UI/UiCheckbox";
import UiPrompt from "@/components/UI/UiPrompt";
import UiImage from "@/components/UI/UiImage";
import UiSystem from "@/components/UI/UiSystem";

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
    template: {
      type: Object,
      default: null,
    },
    index: {
      type: [Number, String],
      default: null,
    },
    parentIsShow: {
      type: Boolean,
      default: true,
    },
    parentName: {
      type: String,
      default: null,
    },
  },
  methods: {
    changeValue(data) {
      this.$emit("changedValue", data);
    },
  },
};
</script>

<style scoped></style>
