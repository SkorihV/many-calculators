<template>
  <div
    class="calc__wrapper-group-data"
    ref="parent"
    v-if="isVisibilityFromDependency"
    :id="elementName"
  >
    <div
      class="calc__select-wrapper"
      :class="[
        { column: isColumn || isMakeElementColumn, open: isOpen },
        classes,
      ]"
    >
      <icon-element-wrapper
        :icon-settings="iconSettingsSelectLabel"
        :alt="isExistLabel ? label : ''"
        :isExistLabel="isExistLabel"
      >
        <div class="calc__select-label-text" v-if="isExistLabel">
          {{ label }}
          <div class="empty-block" v-if="notEmpty">*</div>
          <slot name="prompt"></slot>
        </div>
      </icon-element-wrapper>
      <div class="calc__select-wrapper-right-side">
        <div
          class="calc__select-change-wrapper"
          ref="changeElement"
          :style="[maxWidthForChangeElement]"
          :class="{ error: isErrorClass, stretch: isStretch }"
        >
          <div
            v-if="currentOption"
            class="calc__select-change-item"
            @click="toggleOpenClose"
            @mouseover="hoverElementIndex = 'main'"
            @mouseleave="hoverElementIndex = null"
          >
            <icon-element-wrapper
              :alt="currentOption?.selectName"
              :icon-settings="currentOption?.iconSettingsSelectItem"
              :global-max-width="globalMaxWidth"
              :global-max-height="globalMaxHeight"
              :is-parent-hover="hoverElementIndex === 'main'"
            >
              {{ currentOption.selectName }}
            </icon-element-wrapper>
            <ui-prompt
              v-if="isExistCurrentPrompt"
              :prompt-text="currentOption.prompt"
            />
            <div class="calc__select-arrow" v-if="isShowArrow"></div>
          </div>
          <div
            class="calc__select-option-wrapper"
            :class="{ stretch: isStretch }"
            :style="[maxWidthForOptionList]"
            ref="optionList"
            v-show="isOpen"
          >
            <input
              class="calc__select-option-search"
              type="text"
              v-if="isSearch"
              v-model="searchField"
            />
            <div class="calc__select-option-list">
              <template
                v-for="(option, idx) in selectValuesAfterProcessingDependency"
                :key="idx"
              >
                <div
                  class="calc__select-option-item"
                  @click="changeSelect(option, idx)"
                  v-if="currentOption?.value !== option?.value && option.isShow"
                  @mouseover="hoverElementIndex = idx"
                  @mouseleave="hoverElementIndex = null"
                >
                  <icon-element-wrapper
                    :alt="option?.selectName"
                    :icon-settings="option?.iconSettingsSelectItem"
                    :global-max-width="globalMaxWidth"
                    :global-max-height="globalMaxHeight"
                    :is-parent-hover="hoverElementIndex === idx"
                  >
                    <div class="calc__select-option-item-text">
                      {{ option.selectName }}
                    </div>
                  </icon-element-wrapper>
                  <ui-prompt
                    v-if="option?.prompt?.length"
                    :prompt-text="option.prompt"
                  />
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
      <ui-tooltip
        :is-show="isErrorEmpty"
        :tooltip-text="textErrorNotEmpty"
        :local-can-be-shown="isVisibilityFromDependency && canBeShownTooltip"
      />
    </div>
    <dev-block
      :label="label"
      :element-name="localElementName"
      :value="currentOptionValue"
      :local-cost="localCost"
      :is-visibility-from-dependency="isVisibilityFromDependency"
      :dependency-formula-display="dependencyFormulaDisplay"
      :parsing-formula-variables="formulaAfterProcessingVariables"
    />
  </div>
</template>

<script>
import UiTooltip from "@/components/UI/other/c_UiTooltip.vue";
import UiPrompt from "@/components/UI/other/c_UiPrompt.vue";
import devBlock from "@/components/UI/devMode/devBlock.vue";
import { MixinsForProcessingFormula } from "@/mixins/MixinsForProcessingFormula";
import { MixinsGeneralItemData } from "@/mixins/MixinsGeneralItemData";
import { MixinCurrentWidthElement } from "@/mixins/MixinCurrentWidthElement";
import { MixinDisplaySpinner } from "@/mixins/MixinDisplaySpinner";
import { processingVariablesOnFormula } from "@/servises/ProcessingFormula";

import { useBaseStore } from "@/store/piniaStore";
import { mapState } from "pinia";
import { propsTemplate } from "@/servises/UsePropsTemplatesSingle";
import IconElementWrapper from "@/components/UI/supporting/c_icon-element-wrapper.vue";

export default {
  name: "UiSelect",
  emits: ["changedValue"],
  mixins: [
    MixinsForProcessingFormula,
    MixinsGeneralItemData,
    MixinCurrentWidthElement,
    MixinDisplaySpinner,
  ],
  components: { IconElementWrapper, UiTooltip, UiPrompt, devBlock },
  props: {
    selectValues: {
      type: Array,
      default: () => [],
    },
    /**
     * номер выбранного селекта
     */
    selectedItem: {
      type: [Number, String],
      default: 1,
      validator(value) {
        return !isNaN(Number(value));
      },
    },
    isSearch: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    },
    iconSettingsSelectLabel: {
      type: Object,
      default: () => {},
    },
    ...propsTemplate.getProps([
      "isColumn",
      "isStretch",
      "isNeedChoice",
      "formOutputMethod",
      "resultOutputMethod",
      "label",
      "notEmpty",
      "excludeFromCalculations",
      "elementName",
      "parentName",
      "formulaProcessingLogic",
      "classes",
      "templateName",
      "parentIsShow",
      "dependencyFormulaDisplay",
      "positionElement",
      "zeroValueDisplayIgnore",
      "globalMaxWidth",
      "globalMaxHeight",
    ]),
  },
  mounted() {
    this.localSelectValues = this.selectValues;
    if (this.needMockValue) {
      this.localSelectValues.unshift(this.mockOption);
      this.initSelectMockData();
    } else {
      this.initSelectData();
    }

    window.addEventListener("click", this.clickClose);

    setTimeout(() => {
      this.tryToggleElementIsMounted(this.localElementName, true);
      this.updatedWidthSelect();
    }, 200);
  },
  unmounted() {
    window.removeEventListener("click", this.clickClose);
    this.tryDeleteAllDataOnStoreForElementName(this.localElementName);
  },
  data() {
    return {
      searchField: "",
      isOpen: true,
      currentOption: this.mockOption,
      currentIndexOption: null,
      textErrorNotEmpty: "Обязательное поле.",
      mockOption: {
        selectName: "Не выбрано!",
        value: null,
        isShow: true,
      },
      localSelectValues: [],
      canBeShownTooltip: false,
      hoverElementIndex: null,
      maxWidthSelectList: null,
      localSelectedItem: 1,
    };
  },
  methods: {
    checkedValueOnVoid(value) {
      return value?.length !== 0 && value !== undefined && value !== null;
    },
    initSelectMockData(eventType = "mounted") {
      if (this.needMockValue) {
        this.changeSelect(this.localSelectValues[0], null, eventType);
      }
    },
    initSelectData(eventType = "mounted") {
      if (this.localSelectValues.length) {
        this.localSelectedItem = !!parseInt(this.selectedItem)
          ? parseInt(this.selectedItem) - 1
          : 0;

        this.currentIndexOption =
          this.checkedValueOnVoid(this.localSelectedItem) &&
          this.localSelectedItem < this.localSelectValues.length
            ? this.localSelectedItem
            : 0;

        this.changeSelect(
          this.localSelectValues[this.currentIndexOption],
          this.currentIndexOption,
          eventType
        );
      }
    },
    open() {
      if (
        this.selectValuesAfterProcessingDependency.filter(
          (option) => option.isShow
        ).length > 1
      ) {
        this.isOpen = true;
      }
    },
    toggleOpenClose() {
      if (
        this.selectValuesAfterProcessingDependency.filter(
          (option) => option.isShow
        ).length > 1
      ) {
        this.isOpen = !this.isOpen;
      }
    },
    close() {
      this.isOpen = false;
    },
    changeSelect(item, inx, eventType = "click") {
      if (this.needMockValue && inx === 0) {
        this.currentIndexOption = null;
      } else {
        this.currentIndexOption = inx;
      }

      this.currentOption = item;

      setTimeout(() => {
        this.changeValue(eventType);
      }, 100);
      this.close();
    },
    changeValue(eventType = "click") {
      this.$emit("changedValue", {
        value: this.currentOptionValue,
        displayValue: this.currentOptionDisplayValue,
        index: this.currentIndexOption,
        name: this.localElementName,
        type: "select",
        cost: this.localCost,
        label: this.label,
        formOutputMethod:
          this.formOutputMethod !== "no" ? this.formOutputMethod : null,
        resultOutputMethod:
          this.resultOutputMethod !== "no" ? this.resultOutputMethod : null,
        excludeFromCalculations: this.excludeFromCalculations,
        isShow: this.isVisibilityFromDependency,
        eventType,
        formulaProcessingLogic: this.formulaProcessingLogic,
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
        type: "select",
        label: this.label,
        eventType,
        isShow: this.isVisibilityFromDependency,
        parentName: this.parentName,
      });
      if (eventType === "click") {
        this.canBeShownTooltip = true;
      }
    },
    tryPassDependency() {
      this.tryAddDependencyElement({
        name: this.localElementName,
        value: this.currentOptionValue,
        isShow: this.isVisibilityFromDependency,
        displayValue: this.currentOptionDisplayValue,
        type: "select",
      });
    },
    resetSelectedValue() {
      this.$nextTick(() => {
        let length = this.selectValuesAfterProcessingDependency.length;
        for (let i = 0; i < length; i++) {
          let currentOptionItem = this.selectValuesAfterProcessingDependency[i];
          if (currentOptionItem.isShow) {
            this.changeSelect(currentOptionItem, i, "changeAmountSelectList");
            return;
          }
        }
      });
    },
    resetWidthSelect() {
      this.maxWidthSelectList = null;
    },
    updatedWidthSelect() {
      if (
        this.$refs.optionList?.offsetWidth === 0 ||
        this.$refs.changeElement?.offsetWidth === 0 ||
        this.maxWidthSelectList !== null
      ) {
        return false;
      }
      setTimeout(() => {
        if (
          this.$refs.optionList?.offsetWidth >
          this.$refs.changeElement?.offsetWidth
        ) {
          this.maxWidthSelectList = this.$refs.optionList?.offsetWidth;
        } else {
          this.maxWidthSelectList = this.$refs.changeElement?.offsetWidth;
        }
      }, 100);
    },
    clickClose(e) {
      if (!this.$el.contains(e.target)) {
        this.close();
      }
    },
  },
  watch: {
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
      if (newValue) {
        this.$nextTick(() => {
          this.updatedWidthSelect();
        });
      }
    },
    isVisibilityFromDependency: {
      handler(newValue, oldValue) {
        if (newValue && !oldValue) {
          this.resetWidthSelect();
          if (this.needMockValue) {
            this.initSelectMockData("dependency");
          } else {
            this.initSelectData("dependency");
          }
        } else {
          this.changeValue("dependency");
        }
      },
    },
  },
  computed: {
    ...mapState(useBaseStore, [
      "tryAddDependencyElement",
      "checkValidationDataAndToggle",
      "devMode",
      "getImageDir",
      "isCanShowAllTooltips",
      "tryToggleElementIsMounted",
      "tryDeleteAllDataOnStoreForElementName",
    ]),
    isExistLabel() {
      return Boolean(this.label?.toString().length);
    },
    isExistCurrentPrompt() {
      return Boolean(this.currentOption?.prompt?.length);
    },
    currentAmountSelectList() {
      return Object.values(this.selectValuesAfterProcessingDependency)?.filter(
        (item) => item?.isShow
      )?.length;
    },
    isShowArrow() {
      return Boolean(this.currentAmountSelectList > 1);
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
    isErrorEmpty() {
      return this.notEmpty && this.isCurrentIndexOptionsNotExist;
    },
    isErrorClass() {
      return (
        this.isErrorEmpty &&
        this.isCanShowAllTooltips &&
        this.isVisibilityFromDependency
      );
    },

    isCurrentIndexOptionsNotExist() {
      return this.currentIndexOption === null;
    },
    /**
     * Возвращает цену подходящую условию, если моле отображается
     * Если не одна цена не подходит, то возвращается стандартная
     * @returns {Number|String|*}
     */
    localCost() {
      if (
        this.isCurrentIndexOptionsNotExist ||
        !this.isVisibilityFromDependency
      ) {
        return null;
      }

      if (!this.currentOption?.dependencyPrices?.length) {
        return this.currentOption?.cost ? this.currentOption?.cost : null;
      }

      let { cost: newCost } = this.costAfterProcessingDependencyPrice(
        this.currentOption?.dependencyPrices,
        "dependencyFormulaCost"
      );

      if (newCost !== null) {
        return newCost;
      }
      return this.currentOption?.cost ? this.currentOption?.cost : null;
    },
    currentOptionDisplayValue() {
      if (
        (this.needMockValue && this.isCurrentIndexOptionsNotExist) ||
        !this.isVisibilityFromDependency
      ) {
        return null;
      }

      return this.currentOption?.selectName;
    },
    currentOptionValue() {
      if (
        (this.needMockValue && this.isCurrentIndexOptionsNotExist) ||
        !this.isVisibilityFromDependency
      ) {
        return null;
      }
      const isExistExtraValue = Boolean(
        this.currentOption?.extraValueForDependency?.toString()?.length
      );
      return isExistExtraValue
        ? this.currentOption?.extraValueForDependency
        : !isNaN(parseInt(this.currentOption?.value))
        ? this.currentOption?.value
        : null;
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
     * Получить список селектов после обработки формул на отображение самих селектов
     * @returns {*[]}
     */
    selectValuesAfterProcessingDependency() {
      return this.mutationSelectValue
        .map((selectItem) => {
          const extraValueIsExist = Boolean(
            selectItem?.extraValueForDependency?.toString()?.length
          );

          if (!selectItem?.dependencyFormulaItem?.length) {
            selectItem.isShow = true;
            return selectItem;
          }

          let formula = this.getArrayElementsFromFormula(
            selectItem.dependencyFormulaItem
          );
          this.constructLocalListElementDependencyInFormula(formula);

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

          formula = formula.map((item) => {
            if (item.toLowerCase() === "_self_" && extraValueIsExist) {
              return '"' + selectItem?.extraValueForDependency + '"';
            } else if (item.toLowerCase() === "_self_" && !extraValueIsExist) {
              return selectItem.value;
            }
            return item;
          });

          formula = processingVariablesOnFormula(
            formula,
            this.localDependencyList
          );

          let newDataIsShow;
          try {
            newDataIsShow = eval(formula);
          } catch (e) {
            if (this.devMode) {
              console.error(e.message, formula);
            }
            newDataIsShow = false;
          }
          selectItem.isShow = newDataIsShow;
          const valueInDependency = Boolean(
            selectItem?.extraValueForDependency?.toString()?.length
          )
            ? selectItem?.extraValueForDependency
            : selectItem.value;
          if (!newDataIsShow && valueInDependency === this.currentOptionValue) {
            this.resetSelectedValue();
          }
          return selectItem;
        })
        .filter((selectItem) => {
          if (this.isSearch && this.searchField?.length) {
            return (
              selectItem.selectName
                .toLowerCase()
                .indexOf(this.searchField.toLowerCase()) !== -1
            );
          }
          return selectItem;
        });
    },
    maxWidthForChangeElement() {
      return this.maxWidthSelectList
        ? "max-width:" + this.maxWidthSelectList + "px; width: 100%;"
        : null;
    },
    maxWidthForOptionList() {
      return this.maxWidthSelectList
        ? "max-width:" + this.maxWidthSelectList + "px; width: 100%;"
        : null;
    },
  },
};
</script>
