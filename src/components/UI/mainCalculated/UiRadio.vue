<template>
  <div
    class="calc__wrapper-group-data"
    v-if="isVisibilityFromDependency"
    :id="elementName"
    ref="parent"
  >
    <div
      class="calc__radio-wrapper"
      :class="[
        {
          'column': isColumn || isMakeElementColumn,
          'onlyImage': onlyImage,
          'base': isBase,
        },
        classes,
      ]"
    >
      <icon-element-wrapper
        :icon-settings="iconSettingsRadioLabel"
        :alt="isExistLabel ? label : ''"
        :isExistLabel="isExistLabel"
      >
        <div class="calc__radio-label-text" v-if="isExistLabel">
          {{ label }}
          <div class="empty-block" v-if="notEmpty">*</div>
          <slot name="prompt" />
        </div>
      </icon-element-wrapper>
      <div class="calc__radio-wrapper-buttons">
        <template v-for="radio in radioListOnOut" :key="radio.index">
          <div
            class="calc__radio-label-button"
            :id="localElementName + '_' + radio.index"
            :class="{
              'checked': currentIndexRadioButton === radio.index,
              'error': isErrorClass,
              'onlyImage': onlyImage,
              'isShowPrompt': Boolean(radio?.prompt?.length),
              'stretch': isStretch,
            }"
            @click="selectedCurrentRadio(radio.index)"
            @mouseover="hoverElementIndex = radio.index"
            @mouseleave="hoverElementIndex = null"
          >
            <icon-element-wrapper
              :alt="radio?.radioName"
              :icon-settings="radio?.iconSettingsRadioItem"
              :global-max-width="globalMaxWidth"
              :global-max-height="globalMaxHeight"
              :is-parent-hover="hoverElementIndex === radio.index"
              :is-parent-selected="currentIndexRadioButton === radio.index"
              :is-column="isColumnType"
              :is-exist-label="Boolean(radio.radioName?.toString()?.length)"
            >
              <div class="calc__radio-text-wrapper" v-if="!onlyImage">
                <span class="calc__radio-indicator" v-if="isBase"></span>
                <div class="calc__radio-text">
                  <div class="calc__radio-name">
                    {{ radio.radioName }}
                  </div>
                  <div class="calc__radio-subname">
                    {{ radio?.subradioName }}
                  </div>
                </div>
              </div>
            </icon-element-wrapper>
            <ui-prompt :prompt-text="radio.prompt" />
          </div>
        </template>
      </div>
      <ui-tooltip
        :is-show="isErrorEmpty"
        :tooltip-text="textErrorNotEmpty"
        :local-can-be-shown="isVisibilityFromDependency && canBeShownTooltip"
      />
    </div>
  </div>
  <dev-block
    :label="label"
    :element-name="localElementName"
    :value="selectedValueInRadio"
    :local-cost="localCost"
    :is-visibility-from-dependency="isVisibilityFromDependency"
    :dependency-formula-display="dependencyFormulaDisplay"
    :parsing-formula-variables="formulaAfterProcessingVariables"
  />
</template>

<script>
import UiPrompt from "@/components/UI/other/UiPrompt.vue";
import UiTooltip from "@/components/UI/other/UiTooltip.vue";
import devBlock from "@/components/UI/devMode/devBlock.vue";
import { MixinsForProcessingFormula } from "@/mixins/MixinsForProcessingFormula";
import { MixinsGeneralItemData } from "@/mixins/MixinsGeneralItemData";
import { MixinCurrentWidthElement } from "@/mixins/MixinCurrentWidthElement";
import { MixinDisplaySpinner } from "@/mixins/MixinDisplaySpinner";
import IconElementWrapper from "@/components/UI/supporting/icon-element-wrapper.vue";
import { processingVariablesOnFormula } from "@/servises/ProcessingFormula";

import { useBaseStore } from "@/store/piniaStore";
import { mapState } from "pinia";
import { propsTemplate } from "@/servises/UsePropsTemplatesSingle";

export default {
  name: "UiRadio",
  emits: ["changedValue"],
  mixins: [
    MixinsForProcessingFormula,
    MixinsGeneralItemData,
    MixinCurrentWidthElement,
    MixinDisplaySpinner,
  ],
  components: { UiPrompt, UiTooltip, IconElementWrapper, devBlock },
  props: {
    radioValues: {
      type: Array,
      default: () => [],
    },
    /**
     * номер предвыборной кнопки
     */
    selectedItem: {
      type: [Number, String],
      default: 1,
      validator(value) {
        return !isNaN(Number(value));
      },
    },
    /**
     *  способ отображения - указать текстом
     *  default - base
     *  1) buttons
     *  2) onlyImage
     *  3) column
     */
    typeDisplayClass: {
      type: String,
      default: "base",
    },
    iconSettingsRadioLabel: {
      type: Object,
      default: () => {},
    },
    notReset: {
      type: [Boolean, Number],
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
      default: false
    },
    ...propsTemplate.getProps([
      "isColumn",
      "isNeedChoice",
      "formOutputMethod",
      "resultOutputMethod",
      "dependencyFormulaDisplay",
      "parentIsShow",
      "label",
      "notEmpty",
      "excludeFromCalculations",
      "elementName",
      "parentName",
      "formulaProcessingLogic",
      "classes",
      "templateName",
      "positionElement",
      "zeroValueDisplayIgnore",
      "isStretch",
      "globalMaxWidth",
      "globalMaxHeight",
    ]),
  },
  mounted() {
    this.localElementName = this.checkedValueOnVoid(this.elementName)
      ? this.elementName
      : Math.random().toString();

    this.originRadioList = JSON.parse(JSON.stringify(this.radioValues)).map(
      (item, index) => {
        item.index = index + 1;
        return item;
      }
    );

    if (!this.isNeedChoice) {
      this.currentIndexRadioButton = parseInt(this.selectedItem);
    }

    setTimeout(() => {
      this.changeValue("mounted");
    }, 100);
  },
  unmounted() {
    this.tryDeleteAllDataOnStoreForElementName(this.localElementName)
  },
  data() {
    return {
      currentIndexRadioButton: null,
      textErrorNotEmpty: "Обязательное поле.",
      localElementName: null,
      timerName: null,
      bufferRadioListOnOut: [],
      originRadioList: [],
      canBeShownTooltip: false,
      hoverElementIndex: null,
    };
  },
  methods: {
    getRadioItemForIndex(index) {
      if (this.isShowRadioItemOnIndex(index)) {
        return this.radioListOnOut?.filter(
          (item) => item.isShow && item.index === index
        )[0];
      }
      return null;
    },
    isShowRadioItemOnIndex(index) {
      return !!this.radioListOnOut?.filter(
        (item) => item.isShow && item.index === index
      )?.length;
    },
    checkedValueOnVoid(value) {
      return value?.length !== 0 && value !== undefined && value !== null;
    },
    selectedCurrentRadio(index) {
      if (!this.notReset && this.currentIndexRadioButton === index) {
        this.currentIndexRadioButton = null;
      } else {
        this.currentIndexRadioButton = index;
      }

      this.changeValue();
    },
    changeValue(eventType = "click") {
      this.$emit("changedValue", {
        value: this.selectedValueInRadio,
        displayValue: this.valueForDisplayRadioElement,
        name: this.localElementName,
        type: "radio",
        cost: this.localCost,
        label: this.label,
        formOutputMethod:
          this.formOutputMethod !== "no" ? this.formOutputMethod : null,
        resultOutputMethod:
          this.resultOutputMethod !== "no" ? this.resultOutputMethod : null,
        excludeFromCalculations: this.excludeFromCalculations,
        isShow: this.isVisibilityFromDependency,
        eventType,
        unit: "",
        formulaProcessingLogic: this.formulaProcessingLogic,
        mode: this.mode,
        position: this.positionElement,
        zeroValueDisplayIgnore: this.zeroValueDisplayIgnore,
      });
      this.tryPassDependency();
      this.changeValid(eventType);
    },
    changeValid(eventType) {
      this.checkValidationDataAndToggle({
        error: this.isVisibilityFromDependency
          ? this.isErrorEmpty
          : this.isVisibilityFromDependency,
        name: this.localElementName,
        type: "radio",
        label: this.label,
        eventType,
        isShow: this.isVisibilityFromDependency,
        parentName: this.parentName,
      });
      if (eventType !== "mounted") {
        this.canBeShownTooltip = true;
      }
    },
    tryPassDependency() {
      this.tryAddDependencyElement({
        name: this.localElementName,
        value: this.selectedValueInRadio,
        isShow: this.isVisibilityFromDependency,
        displayValue: this.valueForDisplayRadioElement,
        type: "radio",
      });
    },
  },
  watch: {
    currentSelectedRadioButton: {
      handler(newValue, oldValue) {
        if (newValue?.index !== oldValue?.index) {
          setTimeout(() => {
            this.changeValue("currentSelectedRadioButton");
          }, 10);
        }
      },
      deep: true,
    },
    isVisibilityFromDependency: {
      handler(newValue) {
        if (newValue) {
          if (!this.isNeedChoice) {
            this.currentIndexRadioButton = parseInt(this.selectedItem);
          }
        } else {
          this.currentIndexRadioButton = null;
        }
        this.changeValue("dependency");
      },
      deep: true,
    },
    isAmountVisibleItemsRadioListChanged: {
      handler(newValue) {
        if (this.isVisibilityFromDependency && newValue) {
          if (
            this.currentIndexRadioButton !== null &&
            !this.isShowRadioItemOnIndex(this.currentIndexRadioButton)
          ) {
            if (!this.isNeedChoice) {
              this.currentIndexRadioButton = parseInt(this.selectedItem);
            } else {
              this.currentIndexRadioButton = null;
            }
          }
        }
      },
      deep: true,
    },
  },
  computed: {
    ...mapState(useBaseStore, [
      "tryAddDependencyElement",
      "checkValidationDataAndToggle",
      "devMode",
      "isCanShowAllTooltips",
      "tryToggleElementIsMounted",
    ]),
    isExistLabel() {
      return Boolean(this.label?.toString()?.length);
    },
    isRadioItemSelected() {
      return this.currentSelectedRadioButton !== null;
    },
    isBase() {
      return this.typeDisplayClass === "base";
    },
    onlyImage() {
      return this.typeDisplayClass === "onlyImage";
    },
    isColumnType() {
      return this.typeDisplayClass === "column";
    },
    isErrorClass() {
      return (
        this.isCanShowAllTooltips &&
        this.isErrorEmpty &&
        this.isVisibilityFromDependency
      );
    },
    isErrorEmpty() {
      return this.notEmpty && !this.isRadioItemSelected;
    },
    localCost() {
      return this.isRadioItemSelected
        ? this.currentSelectedRadioButton?.cost
        : null;
    },
    selectedValueInRadio() {
      if (!this.isRadioItemSelected) {
        return null;
      }
      const isExistExtraValue = Boolean(this.currentSelectedRadioButton?.extraValueForDependency?.toString()?.length);
      return isExistExtraValue
        ? this.currentSelectedRadioButton?.extraValueForDependency
        : this.currentIndexRadioButton;
    },
    valueForDisplayRadioElement() {
      return this.isRadioItemSelected
        ? this.currentSelectedRadioButton?.radioName
        : null;
    },

    currentSelectedRadioButton() {
      return this.currentIndexRadioButton === null
        ? null
        : this.getRadioItemForIndex(this.currentIndexRadioButton);
    },
    radioListAfterCheckDependency() {
      return this.originRadioList?.map((radio) => {
        if (radio?.dependencyFormulaItem?.length) {
          let formula = this.getArrayElementsFromFormula(
            radio.dependencyFormulaItem
          );
          this.constructLocalListElementDependencyInFormula(formula);
          formula = processingVariablesOnFormula(
            formula,
            this.localDependencyList
          );
          try {
            radio.isShow = eval(formula);
          } catch (e) {
            if (this.devMode) {
              console.error(e.message, formula);
            }
            radio.isShow = false;
          }
        } else {
          radio.isShow = true;
        }
        return radio;
      });
    },
    amountVisibleItemsCurrentRadioList() {
      return this.bufferRadioListOnOut?.filter((item) => item?.isShow);
    },
    amountVisibleItemsRadioListAfterCheckDependency() {
      return this.radioListAfterCheckDependency?.filter((item) => item.isShow);
    },
    isAmountVisibleItemsRadioListChanged() {
      return (
        this.amountVisibleItemsCurrentRadioList !==
        this.amountVisibleItemsRadioListAfterCheckDependency
      );
    },
    radioListAfterCheckVisibility() {
      if (this.isAmountVisibleItemsRadioListChanged) {
        this.bufferRadioListOnOut = this.radioListAfterCheckDependency;
      }
      return this.bufferRadioListOnOut.filter((item) => item.isShow);
    },
    radioListAfterCheckedCostElements() {
      return this.radioListAfterCheckVisibility?.map((item, index) => {
        if (item?.dependencyPrices?.length) {
          let { cost: newCost } = this.costAfterProcessingDependencyPrice(
            item?.dependencyPrices,
            "dependencyFormulaCost"
          );
          if (newCost !== null) {
            item.cost = newCost;
          } else {
            item.cost = this.radioValues[index].cost;
          }
        }
        item.cost = item?.cost ? item?.cost : null;
        return item;
      });
    },
    radioListOnOut() {
      return this.radioListAfterCheckedCostElements;
    },
  },
};
</script>
