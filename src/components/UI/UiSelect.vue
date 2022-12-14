<template>
  <div class="calc__wrapper-group-data">
    <div
      v-if="isVisibilityFromDependency"
      class="calc__select-wrapper"
      :class="[{ 'is-column': isColumn }, classes]"
      :style="[minWidthWrapper, maxWidthWrapper]"
    >
      <div class="calc__select-label" v-if="label">
        {{ label }}
        <div class="empty-block" v-if="notEmpty">*</div>
        <slot name="prompt"></slot>
      </div>
      <div class="calc__select-change-wrapper">
        <div
          v-if="currentOption"
          class="calc__select-change-item"
          @click="toggleOpenClose"
          :class="{ 'is-open': isOpen }"
        >
          <div
            v-if="currentOption?.image?.filename"
            class="calc__select-image-wrapper"
          >
            <img
              :alt="currentOption.selectName"
              class="calc__select-image-item"
              :src="imageDir + currentOption.image.filename"
            />
          </div>
          {{ currentOption.selectName }}
          <ui-prompt
            v-if="currentOption?.prompt?.length"
            :prompt-text="currentOption.prompt"
          ></ui-prompt>
        </div>
        <div
          class="calc__select-option-wrapper"
          v-if="isOpen"
        >
          <div
            class="calc__select-option-item"
            @click="changeSelect(option, idx)"
            v-for="(option, idx) in selectValuesAfterProcessingDependency"
            :key="idx"
          >
            <template
              v-if="currentOption?.value !== option?.value && option.isShow"
            >
              <div
                v-if="option?.image?.filename"
                class="calc__select-image-wrapper"
              >
                <img
                  :alt="option.selectName"
                  class="calc__select-image-item"
                  :src="imageDir + option.image.filename"
                />
              </div>
              <div class="calc__select-option-item-text">
                {{ option.selectName }}
              </div>
              <ui-prompt
                v-if="option?.prompt?.length"
                :prompt-text="option.prompt"
              ></ui-prompt>
            </template>
          </div>
        </div>
      </div>
      <ui-tooltip
        :is-show="isErrorEmpty"
        :tooltip-text="textErrorNotEmpty"
        :local-can-be-shown="isVisibilityFromDependency"
      />
    </div>
    <div v-if="devMode && showInsideElementStatus" v-html="devModeData"></div>
  </div>
</template>

<script>
import UiTooltip from "@/components/UI/UiTooltip";
import UiPrompt from "@/components/UI/UiPrompt";
import { MixinsForProcessingFormula } from "@/components/UI/MixinsForProcessingFormula";
import { MixinsGeneralItemData } from "@/components/UI/MixinsGeneralItemData";
import { mapActions, mapGetters } from "vuex";


export default {
  name: "UiSelect",
  emits: ["changedValue"],
  mixins: [MixinsForProcessingFormula, MixinsGeneralItemData],
  components: { UiTooltip, UiPrompt },
  mounted() {
    this.localSelectValues = this.selectValues;
    if (this.needMockValue) {
      this.localSelectValues.unshift(this.mockOption);
    }

    if (!this.notEmpty && !this.isNeedChoice) {
      let timer = setInterval(() => {
        if (this.currentIndexOption === null && this.localSelectValues.length) {
          this.currentIndexOption =
            this.checkedValueOnVoid(this.selectedItem) &&
            parseInt(this.selectedItem) < this.localSelectValues.length
              ? parseInt(this.selectedItem)
              : this.localSelectValues.length - 1;

          this.changeSelect(
            this.localSelectValues[this.currentIndexOption],
            this.currentIndexOption,
            "mounted"
          );
          clearInterval(timer);
        }
      }, 100);
      setTimeout(() => {
        clearInterval(timer);
      }, 10000);
    } else {
      this.changeSelect(this.localSelectValues[0], null, "mounted");
    }
    window.addEventListener("click", (e) => {
      if (!this.$el.contains(e.target)) {
        this.close();
      }
    });
  },
  props: {
    selectValues: {
      type: Array,
      default: () => [],
    },
    isColumn: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    },

    /**
     * ?????????? ???????????????????? ??????????????
     */
    selectedItem: {
      type: [Number, String],
      default: 0,
      validator(value) {
        return !isNaN(Number(value));
      },
    },

    /**
     * ???? ?????????????????? ???? ?????????????? - ?????????? ?????????????? ??????????.
     */
    isNeedChoice: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    },

    /**
     * ?????????? ???????????? ???????????? ?? ???????????????????????????? ??????????
     */
    formOutputMethod: {
      type: String,
      default: "no",
    },

    minWidth: {
      type: [Number, String],
      default: 200,
    },
    maxWidth: {
      type: [Number, String],
    },
  },
  data() {
    return {
      isOpen: true,
      currentOption: this.mockOption,
      currentIndexOption: null,
      textErrorNotEmpty: "???????????????????????? ????????.",
      mockOption: {
        selectName: "???? ??????????????!",
        value: "null",
      },
      localSelectValues: [],
    };
  },
  methods: {
    ...mapActions(["tryAddDependencyElement", "checkValidationDataAndToggle"]),
    checkedValueOnVoid(value) {
      return value?.length !== 0 && value !== undefined && value !== null;
    },
    open() {
      if (this.selectValuesAfterProcessingDependency.filter(option => option.isShow).length > 1) {
        this.isOpen = true;
      }
    },
    toggleOpenClose() {
      if (this.selectValuesAfterProcessingDependency.filter(option => option.isShow).length > 1) {
        this.isOpen = !this.isOpen;
      }
    },
    close() {
      this.isOpen = false;
    },
    changeSelect(item, inx, eventType = "click") {
      if (this.notEmpty && inx === 0) {
        this.currentIndexOption = null;
      } else {
        this.currentIndexOption = inx;
      }

      this.currentOption = item;

      this.changeValue(eventType);
      this.close();
    },
    changeValue(eventType = "click") {
      this.$emit("changedValue", {
        value: this.currentOption?.value,
        displayValue: this.currentOption?.selectName,
        index: this.currentIndexOption,
        name: this.localElementName,
        type: "select",
        cost: this.checkedValueOnVoid(this.localCost)
          ? parseFloat(this.localCost)
          : 0,
        label: this.label,
        formOutputMethod:
          this.formOutputMethod !== "no" ? this.formOutputMethod : null,
        excludeFromCalculations: this.excludeFromCalculations,
        isShow: this.isVisibilityFromDependency,
        eventType,
        formulaProcessingLogic: this.formulaProcessingLogic,
      });
      this.tryPassDependency();
      this.changeValid(eventType);
    },
    changeValid(eventType) {
      this.checkValidationDataAndToggle({
        error: this.isErrorEmpty,
        name: this.localElementName,
        type: "select",
        label: this.label,
        eventType,
        isShow: this.isVisibilityFromDependency,
        parentName: this.parentName,
      });
    },
    tryPassDependency() {
      this.tryAddDependencyElement({
        name: this.localElementName,
        value: this.currentOption?.value,
        isShow: this.isVisibilityFromDependency,
        displayValue: this.currentOption?.selectName,
        type: "select",
      });
    },
    resetSelectedValue() {
      this.currentIndexOption = 0;
      this.currentOption = this.selectValuesAfterProcessingDependency[0];
      this.changeValue("click");
    },
  },
  watch: {
    selectedItem(newValue) {
      this.currentIndexOption =
        this.checkedValueOnVoid(this.newValue) &&
        parseInt(this.newValue) < this.localSelectValues.length
          ? parseInt(this.newValue)
          : this.localSelectValues.length - 1;
      this.currentOption = this.localSelectValues[this.currentIndexOption];
      this.changeValue();
    },

    isOpen(newValue) {
      if (newValue && !Object.keys(this.localDependencyList)?.length) {
        this.localSelectValues?.forEach((select) => {
          if (select?.dependencyFormulaItem?.length) {
            let formula = this.getArrayElementsFromFormula(
              select.dependencyFormulaItem
            );
            this.constructLocalListElementDependencyInFormula(formula);
          }
        });
      }
    },

    // selectValuesAfterProcessingDependency: {
    //   handler(newValue, oldValue) {
    //     if (newValue?.length !== oldValue?.length) {
    //       this.resetSelectedValue();
    //     }
    //   },
    //   deep: true
    // }

    amountVisibleSelects() {
      let length = this.selectValuesAfterProcessingDependency.length;
      if (!this.currentOption) {
        return null;
      }
      for (let i = 0; i < length; i++) {
        if (
          this.selectValuesAfterProcessingDependency[i].value ===
            this.currentOption?.value &&
          this.currentOption.isShow
        ) {
          return;
        }
      }

      for (let i = 0; i < length; i++) {
        if (this.selectValuesAfterProcessingDependency[i].isShow) {
          this.changeSelect(
            this.selectValuesAfterProcessingDependency[i],
            i,
            "changeAmountSelectList"
          );
          return;
        }
      }
    },
  },
  computed: {
    ...mapGetters(["devMode", "showInsideElementStatus", "getImageDir"]),
    amountVisibleSelects() {
      return this.selectValuesAfterProcessingDependency.filter(
        (item) => item.isShow
      ).length;
    },
    needMockValue() {
      return this.notEmpty || this.isNeedChoice;
    },
    localElementName() {
      return this.checkedValueOnVoid(this.elementName)
        ? this.elementName
        : Math.random().toString();
    },
    imageDir() {
      return this.getImageDir;
    },
    minWidthWrapper() {
      return this.minWidth ? `min-width:${this.minWidth}px;` : "";
    },
    maxWidthWrapper() {
      return this.maxWidth ? `max-width:${this.maxWidth}px;` : "";
    },
    isErrorEmpty() {
      return this.notEmpty && this.currentIndexOption === null;
    },

    /**
     * ???????????????????? ???????? ???????????????????? ??????????????, ???????? ???????? ????????????????????????
     * ???????? ???? ???????? ???????? ???? ????????????????, ???? ???????????????????????? ??????????????????????
     * @returns {Number|String|*}
     */
    localCost() {
      if (!this.currentOption?.dependencyPrices?.length) {
        return this.currentOption?.cost ? this.currentOption?.cost : null;
      }

      let newCost = this.costAfterProcessingDependencyPrice(
        this.currentOption?.dependencyPrices
      );
      if (newCost !== null) {
        return newCost;
      }
      return this.currentOption?.cost ? this.currentOption?.cost : null;
    },

    mutationSelectValue() {
      return this.localSelectValues.map((selectItem, index) => {
        const localIndex = this.needMockValue ? index : index + 1;
        selectItem.value = selectItem.value?.toString()?.length
          ? selectItem.value
          : localIndex;
        return selectItem;
      });
    },

    /**
     * ???????????????? ???????????? ???????????????? ?????????? ?????????????????? ???????????? ???? ?????????????????????? ?????????? ????????????????
     * @returns {*[]}
     */
    selectValuesAfterProcessingDependency() {
      return this.mutationSelectValue.map((selectItem) => {
        if (!selectItem?.dependencyFormulaItem?.length) {
          selectItem.isShow = true;
          return selectItem;
        }

        let formula = this.getArrayElementsFromFormula(
          selectItem.dependencyFormulaItem
        );

        let allDependencyShow = formula.every((item) => {
          if (this.isElementDependency(item)) {
            return this.localDependencyList[item]?.isShow;
          }
          return true;
        });

        if (!allDependencyShow) {
          selectItem.isShow = true;
          return selectItem;
        }

        formula = formula.map((item) =>
          item.toLowerCase() === "self" ? selectItem.value : item
        );
        this.constructLocalListElementDependencyInFormula(formula);

        formula = this.processingVariablesOnFormula(formula);
        try {
          selectItem.isShow = eval(formula);
          return selectItem;
        } catch (e) {
          if (this.devMode) {
            console.error(e.message, formula);
          }
          selectItem.isShow = false;
          return selectItem;
        }
      });
    },
  },
};
</script>

<style scoped></style>
