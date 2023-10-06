<script setup>
import UiRange from "@/components/UI/mainCalculated/UiRange/UiRange.vue";
import UiInput from "@/components/UI/mainCalculated/UiInput/UiInput.vue";
import UiSelect from "@/components/UI/mainCalculated/UiSelect/UiSelect.vue";
import UiRadio from "@/components/UI/mainCalculated/UiRadio/UiRadio.vue";
import UiCheckbox from "@/components/UI/mainCalculated/UiCheckbox/UiCheckbox.vue";
import UiImage from "@/components/UI/mainCalculated/UiImage/UiImage.vue";
import UiSystem from "@/components/UI/mainCalculated/UiSystem/UiSystem.vue";
import UiPrompt from "@/components/UI/other/UiPrompt.vue";
import { propsTemplate } from "@/servises/UsePropsTemplatesSingle";

const emits = defineEmits(["changedValue"]);
const props = defineProps({
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
  <div
    class="calc__template-main-wrapper"
    :class="{ isRange: template.template === 'UiRange' }"
  >
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
      :icon-settings-input-label="template?.iconSettingsInputLabel"
      @changedValue="changeValue"
    >
      <template v-slot:prompt>
        <ui-prompt :prompt-text="template.prompt" :options="options"/>
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
      :icon-settings-checkbox-label="template?.iconSettingsCheckboxLabel"
      :cost-for-void="template?.costForVoid"
      @changedValue="changeValue"
    >
      <template v-slot:prompt>
        <ui-prompt :prompt-text="template.prompt" :options="options"/>
      </template>
    </ui-checkbox>

    <ui-radio
      v-else-if="template.template === 'UiRadio'"
      :label="template?.label"
      :is-column="template?.isColumn"
      :radio-values="template?.values"
      :not-empty="template?.notEmpty"
      :not-reset="template?.notReset"
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
      :icon-settings-radio-label="template?.iconSettingsRadioLabel"
      :global-max-width="template?.globalMaxWidth"
      :global-max-height="template?.globalMaxHeight"
      :options="options"
      @changedValue="changeValue"
    >
      <template v-slot:prompt>
        <ui-prompt :prompt-text="template.prompt" :options="options"/>
      </template>
    </ui-radio>

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
      :icon-settings-range-label="template?.iconSettingsRangeLabel"
      @changedValue="changeValue"
    >
      <template v-slot:prompt>
        <ui-prompt :prompt-text="template.prompt" :options="options"/>
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
      :icon-settings-select-label="template?.iconSettingsSelectLabel"
      :is-search="template?.isSearch"
      :global-max-width="template?.globalMaxWidth"
      :global-max-height="template?.globalMaxHeight"
      :options="options"
      @changedValue="changeValue"
    >
      <template v-slot:prompt>
        <ui-prompt :prompt-text="template.prompt" :options="options"/>
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
      :show-element="template?.showElement"
      :cost="template?.cost"
      :label="template?.label"
      :dependency-prices="template?.dependencyPrices"
      :dependency-html-text="template?.dependencyHtmlText"
      :parent-is-show="parentIsShow"
      :element-name="
        template?.elementName?.length
          ? template?.elementName
          : template?.json_id || 'UiSystem' + index
      "
      :formula-processing-logic="template?.formulaProcessingLogic"
      :form-output-method="template?.formOutputMethod"
      :result-output-method="template?.resultOutputMethod"
      :dependency-formula-display="template?.dependencyFormulaDisplay"
      :parent-name="parentName"
      :template-name="template.template"
      :position-element="template?.position"
      :zero-value-display-ignore="template?.zeroValueDisplayIgnore"
      :exclude-from-calculations="template?.excludeFromCalculations"
      :icon-settings-system-label="template?.iconSettingsSystemLabel"
      :unit="template?.unit"
      :html-text="template?.htmlText"
      :round-off-type="template?.roundOffType"
      :sign-after-dot="template?.signAfterDot"
      :return-text-value="template?.returnTextValue"
      :classes="template?.classes"
      @changedValue="changeValue"
    >
      <template v-slot:prompt>
        <ui-prompt :prompt-text="template.prompt" :options="options"/>
      </template>
    </ui-system>
  </div>
</template>
