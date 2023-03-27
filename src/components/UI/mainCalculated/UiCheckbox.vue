<template>
  <div
    class="calc__wrapper-group-data"
    v-if="isVisibilityFromDependency"
    :id="elementName"
    ref="parent"
  >
    <div
      class="calc__checkbox-wrapper"
      :class="[classes, { 'column': isColumn || isMakeElementColumn }]"
    >
      <icon-element-wrapper
        :icon-settings="iconSettings"
        :alt="isExistLabel ? label : ''"
        :isExistLabel="isExistLabel"
      >
        <div class="calc__checkbox-label-text" v-if="isExistLabel">
          {{ label }}
          <div class="empty-block" v-if="isNeedChoice">*</div>
        </div>
      </icon-element-wrapper>
      <div
        @click="inputLocalValue"
        class="calc__checkbox-control-wrapper">
        <div
          class="calc__checkbox-control-button"
          v-if="isButton"
          :class="{
            checked: isLocalChecked,
            error: isErrorClass,
          }"
        >
          {{ currentLocalTextButton }}
          <slot name="prompt"></slot>
        </div>
        <div
          class="calc__checkbox-control-base"
          v-if="isBase || isSwitcher || isSwitcherVertical"
          :class="{
            switcher: isSwitcher || isSwitcherVertical,
            checked: isLocalChecked,
            error: isErrorClass,
          }"
        >
          <div class="calc__checkbox-control-text">
            <template v-if="isSwitcher || isSwitcherVertical">
              {{ buttonText }}
            </template>
            <template v-if="isBase">
              {{ currentLocalTextButton }}
            </template>
            <div class="empty-block" v-if="!label?.length && isNeedChoice">*</div>
            <slot name="prompt"></slot>
          </div>
          <div
            class="calc__checkbox-control-element"
            :class="{
              base: isBase,
              switcher: isSwitcher || isSwitcherVertical,
              'switcher-vertical': isSwitcherVertical,
              checked: isLocalChecked,
              error: isErrorClass,
            }"
          ></div>
          <div
            class="calc__checkbox-control-text_checked"
            v-if="
              (isSwitcher || isSwitcherVertical) && buttonTextChecked?.length
            "
          >
            {{ buttonTextChecked }}
          </div>
        </div>
        <ui-tooltip
          :is-show="isErrorEmpty"
          :tooltip-text="textErrorNotEmpty"
          :local-can-be-shown="isVisibilityFromDependency && canBeShownTooltip"
        />
      </div>
    </div>
  </div>
  <dev-block
    :label="label"
    :element-name="localElementName"
    :value="isLocalChecked"
    :local-cost="localCost"
    :is-visibility-from-dependency="isVisibilityFromDependency"
    :dependency-formula-display="dependencyFormulaDisplay"
    :parsing-formula-variables="formulaAfterProcessingVariables"
  />
</template>

<script>
import UiTooltip from "@/components/UI/other/UiTooltip.vue";
import devBlock from "@/components/UI/devMode/devBlock.vue";
import { MixinsForProcessingFormula } from "@/mixins/MixinsForProcessingFormula";
import { MixinsGeneralItemData } from "@/mixins/MixinsGeneralItemData";
import { MixinCurrentWidthElement } from "@/mixins/MixinCurrentWidthElement";
import IconElementWrapper from "@/components/UI/supporting/icon-element-wrapper.vue";

import { useBaseStore } from "@/store/piniaStore";
import { mapState } from "pinia";

import {propsTemplate} from "@/servises/UsePropsTemplatesSingle";

export default {
  name: "UiCheckbox",
  emits: ["changedValue"],
  mixins: [MixinsForProcessingFormula, MixinsGeneralItemData, MixinCurrentWidthElement],
  components: { UiTooltip, devBlock, IconElementWrapper },
  props: {
    /**
     *  альтернативный способ смены вида чекбокас - текстом
     *  default - base
     *  switcher - горизонтальный переключатель
     *  switcher-vertical - вертикальный переключатель
     *  button - кнопка
     */
    typeDisplayClass: {
      type: String,
      default: "base",
    },
    buttonText: {
      type: String,
      require: true,
    },
    buttonTextChecked: {
      type: String,
      require: true,
    },
    scrollIntoName: {
      type: String,
      default: null,
    },
    ...propsTemplate.getProps([
      "formOutputMethod",
      "resultOutputMethod",
      "isNeedChoice",
      "dependencyPrices",
      "cost",
      "dependencyFormulaDisplay",
      "parentIsShow",
      "label",
      "excludeFromCalculations",
      "elementName",
      "parentName",
      "formulaProcessingLogic",
      "classes",
      "templateName",
      "positionElement",
      "isColumn",
      "zeroValueDisplayIgnore",
      "baseValue",
      "iconSettings",
    ]),
  },
  created() {
    this.tryToggleElementIsMounted(this.elementName, false);
  },
  mounted() {
    this.checkboxValue = this.baseValue === 'active';
    this.isChecked = this.baseValue === 'selected';

    if (!this.isNeedChoice) {
      this.isLocalChecked = Boolean(this.checkboxValue || this.isChecked);
    }
    if (this.isLocalChecked) {
      this.currentLocalTextButton = this.buttonTextChecked?.length
        ? this.buttonTextChecked
        : this.buttonText;
    } else {
      this.currentLocalTextButton = this.buttonText;
    }
    this.changeValue("mounted");

    setTimeout(() => {
      this.tryToggleElementIsMounted(this.elementName, true);
    }, 200);
  },
  data() {
    return {
      currentLocalTextButton: "",
      isLocalChecked: null,
      textErrorNotEmpty: "Обязательное поле.",
      canBeShownTooltip: false,
      isChecked: false,  // активирована
      checkboxValue: false, // начальное значение
    };
  },
  methods: {
    inputLocalValue() {
      if (!this.isChecked) {
        this.isLocalChecked = !this.isLocalChecked;
      }
      this.currentLocalTextButton =
        this.isLocalChecked && this.buttonTextChecked?.length
          ? this.buttonTextChecked
          : this.buttonText;
      this.changeValue("click");
    },
    checkedValueOnVoid(value) {
      return value?.length !== 0 && value !== undefined && value !== null;
    },
    changeValue(eventType = "click") {
      this.$emit("changedValue", {
        value: this.isVisibilityFromDependency ? this.isLocalChecked : null,
        displayValue: this.isLocalChecked ? "Да" : "Нет",
        name: this.localElementName,
        type: "checkbox",
        label: this.label || this.buttonText,
        cost: this.localCost,
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
      if (this.isLocalChecked && this.scrollIntoName) {
        this.goToElementScroll();
      }
    },
    changeValid(eventType) {
      this.checkValidationDataAndToggle({
        error: this.isVisibilityFromDependency
          ? this.isErrorEmpty
          : this.isVisibilityFromDependency,
        name: this.localElementName,
        type: "checkbox",
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
        value: this.isVisibilityFromDependency ? this.isLocalChecked : null,
        isShow: this.isVisibilityFromDependency,
        displayValue: this.currentLocalTextButton,
        type: "checkbox",
      });
    },
    goToElementScroll() {
      this.$nextTick(() => {
        const elementToScroll = document.querySelector(
          "#" + this.scrollIntoName
        );
        if (Boolean(elementToScroll)) {
          elementToScroll.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "start",
          });
        }
      });
    },
  },
  watch: {
    isVisibilityFromDependency(value) {
      if (value) {
        this.isLocalChecked = !this.isNeedChoice ? Boolean(this.checkboxValue || this.isChecked) : null;
      } else {
        this.isLocalChecked = null;
      }
      this.changeValue("dependency");
    },
  },
  computed: {
    ...mapState(useBaseStore, [
      "tryAddDependencyElement",
      "checkValidationDataAndToggle",
      "isCanShowAllTooltips",
      "tryToggleElementIsMounted",
    ]),
    /**
     *
     * @returns {*|string}
     */
    localElementName() {
      return this.checkedValueOnVoid(this.elementName)
        ? this.elementName
        : Math.random().toString();
    },
    isExistLabel() {
      return Boolean(this.label?.length);
    },
    /**
     *
     * @returns {boolean}
     */
    isButton() {
      return this.checkboxType === "button";
    },

    isSwitcher() {
      return this.checkboxType === "switcher";
    },
    isBase() {
      return this.checkboxType === "base";
    },
    isSwitcherVertical() {
      return this.checkboxType === "switcher-vertical";
    },
    /**
     *
     * @returns {string|string}
     */
    checkboxType() {
      return this.typeDisplayClass ? this.typeDisplayClass : "base";
    },
    /**
     *
     * @returns {boolean}
     */
    isErrorEmpty() {
      return Boolean(this.isNeedChoice && !this.isLocalChecked);
    },
    isErrorClass() {
      return Boolean(
        this.isErrorEmpty &&
        this.isVisibilityFromDependency &&
        this.isCanShowAllTooltips
      );
    },
    /**
     * Возвращает цену подходящую условию, если моле отображается
     * Если не одна цена не подходит, то возвращается стандартная
     * @returns {Number|String|*}
     */
    localCost() {
      if (!this.isVisibilityFromDependency) {
        return null;
      }
      if (!this.initProcessingDependencyPrice || !this.dependencyPrices) {
        return this.isLocalChecked && this.checkedValueOnVoid(this.cost)
          ? parseFloat(this.cost)
          : !this.isLocalChecked && this.checkedValueOnVoid(this.cost)
          ? 0
          : null;
      }

      let newCost = this.costAfterProcessingDependencyPrice(
        this.dependencyPrices
      );

      if (newCost !== null) {
        return newCost;
      }
      return this.isLocalChecked && this.checkedValueOnVoid(this.cost)
        ? parseFloat(this.cost)
        : !this.isLocalChecked && this.checkedValueOnVoid(this.cost)
        ? 0
        : null;
    },
  },
};
</script>
