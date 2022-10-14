<template>
  <ui-input
    v-if="template.template === 'UiInput'"
    :min="template?.min"
    :max="template?.max"
    :cost="template?.cost"
    :unit="template?.unit"
    :step="template?.step"
    :label="template?.label"
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
    :dependency-name="template?.dependencyName"
    :dependency-formula-display="template?.dependencyFormulaDisplay"
    :dependency-prices="template?.dependencyPrices"
    :form-output-method="template?.formOutputMethod"
    @changedValue="changeValue"
    @changeValid="changeValid"
  >
    <template v-slot:prompt>
      <ui-prompt :prompt-text="template.prompt" />
    </template>
  </ui-input>

  <ui-checkbox
    v-if="template.template === 'UiCheckbox'"
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
    :dependency-name="template?.dependencyName"
    :dependency-formula-display="template?.dependencyFormulaDisplay"
    :form-output-method="template?.formOutputMethod"
    :dependency-prices="template?.dependencyPrices"
    :classes="template?.classes"
    @changedValue="changeValue"
    @changeValid="changeValid"
  >
    <template v-slot:prompt>
      <ui-prompt :prompt-text="template.prompt" />
    </template>
  </ui-checkbox>

  <UiRadio
    v-if="template.template === 'UiRadio'"
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
    :dependency-name="template?.dependencyName"
    :dependency-formula-display="template?.dependencyFormulaDisplay"
    :form-output-method="template?.formOutputMethod"
    :classes="template?.classes"
    @changedValue="changeValue"
    @changeValid="changeValid"
  >
    <template v-slot:prompt>
      <ui-prompt :prompt-text="template.prompt" />
    </template>
  </UiRadio>

  <ui-range
    v-if="template.template === 'UiRange'"
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
    :dependency-name="template?.dependencyName"
    :dependency-formula-display="template?.dependencyFormulaDisplay"
    :dependency-prices="template?.dependencyPrices"
    :not-empty="template?.notEmpty"
    :form-output-method="template?.formOutputMethod"
    :classes="template?.classes"
    @changedValue="changeValue"
    @changeValid="changeValid"
  >
    <template v-slot:prompt>
      <ui-prompt :prompt-text="template.prompt" />
    </template>
  </ui-range>

  <ui-select
    v-if="template.template === 'UiSelect'"
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
    :dependency-name="template?.dependencyName"
    :dependency-formula-display="template?.dependencyFormulaDisplay"
    :form-output-method="template?.formOutputMethod"
    :classes="template?.classes"
    @changedValue="changeValue"
    @changeValid="changeValid"
  >
    <template v-slot:prompt>
      <ui-prompt :prompt-text="template.prompt" />
    </template>
  </ui-select>
</template>

<script>
import UiRange from "@/components/UI/UiRange";
import UiInput from "@/components/UI/UiInput";
import UiSelect from "@/components/UI/UiSelect";
import UiRadio from "@/components/UI/UiRadio";
import UiCheckbox from "@/components/UI/UiCheckbox";
import UiPrompt from "@/components/UI/UiPrompt";

export default {
  name: "TemplatesWrapper",
  emits: ["changedValue", "changeValid"],
  components: { UiRange, UiInput, UiSelect, UiRadio, UiCheckbox, UiPrompt },
  props: {
    template: {
      type: Object,
      default: null,
    },
    index: {
      type: [Number, String],
      default: null,
    },
  },
  methods: {
    changeValue(data) {
      this.$emit("changedValue", data);
    },
    changeValid(data) {
      this.$emit("changeValid", data);
    },
  },
};
</script>

<style scoped></style>
