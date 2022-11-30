<template>
  <div class="calc__wrapper-group-data" v-if="isVisibilityFromDependency">
    <div
      class="calc__radio-wrapper"
      :class="[
        radioType,
        { column: isColumn, solid: isSolid, wrap: isWrap },
        classes,
      ]"
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
            :class="{ checked: idx === currentIndexRadioButton }"
            v-if="radio.isShow"
            @click="selectedCurrentRadio(idx)"
          >
            <span
              class="calc__radio-indicator"
              v-if="radioType === 'base'"
            ></span>
            <span class="calc__radio-text">{{ radio.radioName }}</span>
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
  <div v-if="devMode && showInsideElementStatus" v-html="devModeData"></div>
</template>

<script>
import UiPrompt from "@/components/UI/UiPrompt";
import UiTooltip from "@/components/UI/UiTooltip";
import { MixinsForProcessingFormula } from "@/components/UI/MixinsForProcessingFormula";
import { MixinsGeneralItemData } from "@/components/UI/MixinsGeneralItemData";
import { mapActions, mapGetters } from "vuex";

export default {
  name: "UiRadio",
  emits: ["changedValue"],
  mixins: [MixinsForProcessingFormula, MixinsGeneralItemData],
  components: { UiPrompt, UiTooltip },
  mounted() {
    this.localElementName = this.checkedValueOnVoid(this.elementName)
      ? this.elementName
      : Math.random().toString();
    this.updateRadioListInOut();
    if (!this.isErrorEmpty && !this.isNeedChoice) {
      let timer = setInterval(() => {
        if (this.radioValues.length) {
          this.currentIndexRadioButton =
            this.checkedValueOnVoid(this.selectedItem) &&
            parseInt(this.selectedItem) < this.radioValues.length
              ? parseInt(this.selectedItem)
              : this.radioValues.length - 1;
          this.changeValue("mounted");
          clearInterval(timer);
        }
      }, 100);
      setTimeout(() => {
        clearInterval(timer);
      }, 10000);
    } else {
      this.changeValid("mounted");
    }
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
     *   вертикальное положение кнопок
     */
    isColumn: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    },

    /**
     * По умолчанию не выбрано - нужно сделать выбор.
     */
    isNeedChoice: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    },

    /**
     *  способ отображения - указать текстом
     *  default - base
     *  1) buttons
     */
    typeDisplayClass: {
      type: String,
      default: "base",
    },

    /**
     * метод вывода данных в результирующую форму
     */
    formOutputMethod: {
      type: String,
      default: "no",
    },
    /**
     * в горизонтальном положении убрать пробелы между кнопками
     */
    isSolid: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    },

    /**
     * включить перенос для заголовка и кнопок
     */
    isWrap: {
      type: [Boolean, Number],
      default: true,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    },
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
    ...mapActions(["tryAddDependencyElement", "checkValidationDataAndToggle"]),
    checkedValueOnVoid(value) {
      return value?.length !== 0 && value !== undefined && value !== null;
    },
    selectedCurrentRadio(index) {
      this.currentIndexRadioButton = parseInt(index);
      this.changeValue();
    },
    changeValue(eventType = "click") {
      const radio = this.changedRadio;
      this.$emit("changedValue", {
        value: radio?.value ? radio?.value : null,
        displayValue: radio?.radioName ? radio?.radioName : null,
        index: this.currentIndexRadioButton,
        name: this.localElementName,
        type: "radio",
        cost: this.checkedValueOnVoid(this.localCost)
          ? parseFloat(this.localCost)
          : 0,
        label: this.label,
        formOutputMethod:
          this.formOutputMethod !== "no" ? this.formOutputMethod : null,
        excludeFromCalculations: this.excludeFromCalculations,
        isShow: this.isVisibilityFromDependency,
        eventType,
        unit: this.unit,
        formulaProcessingLogic: this.formulaProcessingLogic,
      });
      this.tryPassDependency();
      this.changeValid(eventType);
    },
    changeValid(eventType) {
      this.checkValidationDataAndToggle({
        error: this.isErrorEmpty,
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
        value: this.changedRadio?.value ? this.changedRadio?.value : null,
        isShow: this.isVisibilityFromDependency,
        displayValue: this.changedRadio?.radioName,
        type: "radio",
      });
    },
    getNewListValuesBeforeCheckedDependency() {
      return this.mutationRadioValue.map((radio) => {
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
              // console.error(e.message);
              radio.isShow = false;
            }
          }, 10);
        }
        radio.isShow = true;
        return radio;
      });
    },
    updateRadioListInOut() {
      this.localRadioListInOut = [];
      if (this.timerName) {
        clearTimeout(this.timerName);
      }
      this.timerName = setTimeout(() => {
        this.localRadioListInOut = this.radioValuesAfterProcessingDependency;
      }, 100);
    },
  },
  watch: {
    selectedItem(newValue) {
      this.currentIndexRadioButton =
        this.checkedValueOnVoid(newValue) &&
        parseInt(newValue) < this.radioValues.length
          ? parseInt(this.selectedItem)
          : this.radioValues.length - 1;
      this.changeValue("selected");
    },
    radioValuesAfterProcessingDependency: {
      handler(newValue, oldValue) {
        if (newValue?.length !== oldValue?.length) {
          this.currentIndexRadioButton = null;
          this.changeValue("selected");
        }
        this.updateRadioListInOut();
      },
      deep: true,
    },
  },
  computed: {
    ...mapGetters(["showInsideElementStatus", "devMode"]),
    changedRadio() {
      return this.currentIndexRadioButton !== null
        ? this.radioValues[this.currentIndexRadioButton]
        : null;
    },
    radioType() {
      return this.typeDisplayClass?.length ? this.typeDisplayClass : "base";
    },
    isErrorEmpty() {
      return this.notEmpty && this.currentIndexRadioButton === null;
    },

    /**
     * Возвращает цену подходящую условию, если моле отображается
     * Если не одна цена не подходит, то возвращается стандартная
     * @returns {Number|String|*}
     */
    localCost() {
      if (!this.changedRadio?.dependencyPrices?.length) {
        return this.changedRadio?.cost ? this.changedRadio?.cost : null;
      }

      let newCost = this.costAfterProcessingDependencyPrice(
        this.changedRadio?.dependencyPrices
      );
      if (newCost !== null) {
        return newCost;
      }
      return this.changedRadio?.cost ? this.changedRadio?.cost : null;
    },

    mutationRadioValue() {
      return this.radioValues.map((radioItem, index) => {
        radioItem.value = radioItem.value?.toString()?.length
          ? radioItem.value
          : index + 1;
        return radioItem;
      });
    },

    radioValuesAfterProcessingDependency() {
      return this.getNewListValuesBeforeCheckedDependency();
    },
  },
};
</script>

<style scoped lang="scss"></style>
