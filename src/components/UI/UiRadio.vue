<template>
  <div
    class="calc__wrapper-group-data"
    v-if="isVisibilityFromDependency"
    ref="parent"
  >
    <div
      class="calc__radio-wrapper"
      :class="[radioType, { column: isColumn, onlyImage: onlyImage }, classes]"
    >
      <div class="calc__radio-title" v-if="label">
        {{ label }}
        <div class="empty-block" v-if="notEmpty">*</div>
        <slot name="prompt" />
      </div>
      <div class="calc__radio-wrapper-buttons">
        <template v-for="(radio, idx) in localRadioListInOut" :key="idx">
          <div
            class="calc__radio-label"
            :id="localElementName + '_' + idx"
            :class="{ checked: currentIndexRadioButton === idx }"
            v-if="radio.isShow"
            @click="selectedCurrentRadio(idx)"
          >
            <div class="calc__radio-text" v-if="!onlyImage">
              <span
                class="calc__radio-indicator"
                v-if="radioType === 'base'"
              ></span>
              {{ radio.radioName }}
              {{ radio?.subradioName }}
            </div>
            <div
              class="calc__radio-wrapper-image"
              v-if="radio?.image?.filename"
              :style="[width, height]"
            >
              <img
                :src="radio?.image?.filename"
                :style="[width, height]"
                :alt="radio.radioName"
              />
            </div>
            <ui-prompt :prompt-text="radio.prompt" />
          </div>
        </template>
      </div>
      <ui-tooltip
        :is-show="isErrorEmpty"
        :tooltip-text="textErrorNotEmpty"
        :local-can-be-shown="isVisibilityFromDependency"
      />
    </div>
  </div>
  <div v-if="devModeData" v-html="devModeData"></div>
</template>

<script>
import UiPrompt from "@/components/UI/UiPrompt";
import UiTooltip from "@/components/UI/UiTooltip";
import { MixinsForProcessingFormula } from "@/components/UI/MixinsForProcessingFormula";
import { MixinsGeneralItemData } from "@/components/UI/MixinsGeneralItemData";

import { useBaseStore } from "@/store/piniaStore";
import { mapState } from "pinia";
import UsePropsTemplates from "@/components/UI/UsePropsTemplates";

export default {
  name: "UiRadio",
  emits: ["changedValue"],
  mixins: [MixinsForProcessingFormula, MixinsGeneralItemData],
  components: { UiPrompt, UiTooltip },
  mounted() {
    this.localElementName = this.checkedValueOnVoid(this.elementName)
      ? this.elementName
      : Math.random().toString();

    this.localRadioListInOut = this.updatedRadioListInImageDir(
      JSON.parse(JSON.stringify(this.radioValues))
    );
    this.updatedRadioListBeforeCheckedDependency();
    this.updatedRadioListBeforeCheckedCostElements();

    if (!this.isErrorEmpty && !this.isNeedChoice) {
      this.currentIndexRadioButton = parseInt(this.selectedItem);
    }

    setTimeout(() => {
      this.changeValue("mounted");
    }, 100);
  },
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
      default: 0,
      validator(value) {
        return !isNaN(Number(value));
      },
    },
    /**
     *  способ отображения - указать текстом
     *  default - base
     *  1) buttons
     *  2) onlyImage
     */
    typeDisplayClass: {
      type: String,
      default: "base",
    },
    ...UsePropsTemplates([
      "isColumn",
      "isNeedChoice",
      "formOutputMethod",
      "maxWidth",
      "maxHeight",
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
    ]),
  },
  data() {
    return {
      currentIndexRadioButton: null,
      textErrorNotEmpty: "Обязательное поле.",
      localElementName: null,
      timerName: null,
      localRadioListInOut: [],
    };
  },
  methods: {
    checkedValueOnVoid(value) {
      return value?.length !== 0 && value !== undefined && value !== null;
    },
    selectedCurrentRadio(index) {
      this.currentIndexRadioButton = index;
      this.changeValue();
    },
    changeValue(eventType = "click") {
      this.$emit("changedValue", {
        value: this.changeValuesInRadio,
        displayValue: this.changeDisplayValuesInRadio,
        name: this.localElementName,
        type: "radio",
        cost: this.localCosts,
        label: this.label,
        formOutputMethod:
          this.formOutputMethod !== "no" ? this.formOutputMethod : null,
        excludeFromCalculations: this.excludeFromCalculations,
        isShow: this.isVisibilityFromDependency,
        eventType,
        unit: "",
        formulaProcessingLogic: this.formulaProcessingLogic,
        mode: this.mode,
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
    },
    tryPassDependency() {
      this.tryAddDependencyElement({
        name: this.localElementName,
        value: this.changeValuesInRadio,
        isShow: this.isVisibilityFromDependency,
        displayValue: this.changeDisplayValuesInRadio,
        type: "radio",
      });
    },

    /**
     * добавить к картинкам актуальный url
     * @param radioList
     * @returns {*}
     */
    updatedRadioListInImageDir(radioList) {
      return radioList.map((radioItem, index) => {
        if (radioItem?.image?.filename) {
          radioItem.image.filename = this.imageDir + radioItem.image.filename;
        }
        radioItem.value = radioItem.value?.toString()?.length
          ? radioItem.value
          : index + 1;
        return radioItem;
      });
    },

    updatedRadioListBeforeCheckedDependency() {
      this.localRadioListInOut = this.localRadioListInOut?.map((radio) => {
        if (radio?.dependencyFormulaItem?.length) {
          let formula = this.getArrayElementsFromFormula(
            radio.dependencyFormulaItem
          );
          this.constructLocalListElementDependencyInFormula(formula);
          setTimeout(() => {
            formula = this.processingVariablesOnFormula(formula);

            try {
              radio.isShow = eval(formula);
            } catch (e) {
              if (this.devMode) {
                console.error(e.message, formula);
              }
              radio.isShow = false;
            }
          }, 10);
        }
        radio.isShow = true;
        return radio;
      });
    },

    updatedRadioListBeforeCheckedCostElements() {
      this.localRadioListInOut = this.localRadioListInOut?.map(
        (item, index) => {
          if (item?.dependencyPrices?.length) {
            let newCost = this.costAfterProcessingDependencyPrice(
              item?.dependencyPrices
            );
            if (newCost !== null) {
              item.cost = newCost;
            } else {
              item.cost = this.radioValues[index].cost;
            }
          }
          item.cost = item?.cost ? item?.cost : null;
          return item;
        }
      );
    },
  },
  watch: {
    localDependencyList: {
      handler() {
        this.updatedRadioListBeforeCheckedDependency();
        this.updatedRadioListBeforeCheckedCostElements();
      },
      deep: true,
    },

    currentSelectedRadioButton: {
      handler() {
        setTimeout(() => {
          this.changeValue("currentSelectedRadioButton");
        }, 10);
      },
      deep: true,
    },
  },
  computed: {
    ...mapState(useBaseStore, [
      "tryAddDependencyElement",
      "checkValidationDataAndToggle",
      "devMode",
      "getImageDir",
    ]),

    isChangedRadio() {
      return this.currentSelectedRadioButton !== null;
    },

    radioType() {
      return this.typeDisplayClass?.length ? this.typeDisplayClass : "base";
    },
    onlyImage() {
      return this.typeDisplayClass === "onlyImage";
    },
    isErrorEmpty() {
      return this.notEmpty && !this.isChangedRadio;
    },
    localCosts() {
      if (this.currentSelectedRadioButton === null) {
        return null;
      }
      return this.currentSelectedRadioButton?.cost;
    },
    changeValuesInRadio() {
      if (this.currentSelectedRadioButton === null) {
        return null;
      }
      return this.currentSelectedRadioButton?.value;
    },
    changeDisplayValuesInRadio() {
      if (this.currentSelectedRadioButton === null) {
        return null;
      }
      return this.currentSelectedRadioButton?.radioName;
    },

    currentSelectedRadioButton() {
      if (
        this.currentIndexRadioButton === null ||
        !this.localRadioListInOut[this.currentIndexRadioButton]?.isShow
      ) {
        return null;
      }
      return this.localRadioListInOut[this.currentIndexRadioButton];
    },

    imageDir() {
      return this.getImageDir;
    },
    width() {
      return "max-width:" + this.maxWidth + "px";
    },
    height() {
      return "max-height:" + this.maxHeight + "px";
    },
  },
};
</script>
