<template>
  <div class="calc__wrapper-group-data" v-if="isVisibilityFromDependency">
    <div class="calc__checkbox-wrapper" :class="classes">
      <label :for="localElementName" class="calc__checkbox-label">
        <input
          ref="checkbox"
          class="calc__checkbox-item"
          type="checkbox"
          :checked="isChecked || localValue"
          :disabled="isChecked"
          @click="inputLocalValue($event.target.checked)"
          :name="label"
          :id="localElementName"
        />
        <div
          v-if="label"
          class="calc__checkbox-text"
          :class="{ button: checkboxType === 'button' }"
        >
          {{ label }}
          <div class="empty-block" v-if="notEmpty">*</div>
          <slot name="prompt"></slot>
        </div>
        <div class="calc__checkbox-element" :class="checkboxType"></div>
        <div v-if="labelSecond.length" class="calc__checkbox-text_second">
          {{ labelSecond }}
        </div>
      </label>
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
import UiTooltip from "@/components/UI/UiTooltip";
import { MixinsForProcessingFormula } from "@/components/UI/MixinsForProcessingFormula";
import { MixinsGeneralItemData } from "@/components/UI/MixinsGeneralItemData";
import { mapActions, mapGetters } from "vuex";

export default {
  name: "UiCheckbox",
  emits: ["changedValue"],
  mixins: [MixinsForProcessingFormula, MixinsGeneralItemData],
  components: { UiTooltip },
  props: {
    labelSecond: {
      type: String,
      default: "",
    },

    /**
     *     Начальное значение
     */
    checkboxValue: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    },
    cost: {
      type: [Number, String],
      default: null,
      validator(value) {
        return !isNaN(Number(value));
      },
    },

    /**
     * Список цен с зависимостями / условиями
     */
    dependencyPrices: {
      type: Array,
      default: () => [],
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
     *     Всегда включена. Отключить нельзя
     */
    isChecked: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    },

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

    /**
     * метод вывода данных в результирующую форму
     */
    formOutputMethod: {
      type: String,
      default: "no",
    },
  },
  mounted() {
    this.localValue = Boolean(this.checkboxValue);
    if (this.isChecked) {
      this.localValue = true;
    }
    this.changeValue("mounted");
  },
  data() {
    return {
      localValue: null,
      textErrorNotEmpty: "Обязательное поле.",
    };
  },
  methods: {
    ...mapActions(["tryAddDependencyElement", "checkValidationDataAndToggle"]),
    inputLocalValue(value) {
      this.localValue = value;
      this.changeValue("click");
    },
    checkedValueOnVoid(value) {
      return value?.length !== 0 && value !== undefined && value !== null;
    },
    changeValue(eventType = "click") {
      this.$emit("changedValue", {
        value: this.localValue,
        displayValue: this.localValue ? "Да" : "Нет",
        name: this.localElementName,
        type: "checkbox",
        label: this.label?.length ? this.label : this.labelSecond,
        cost:
          this.localValue && this.checkedValueOnVoid(this.localCost)
            ? this.localCost
            : 0,
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
        type: "checkbox",
        label: this.label,
        eventType,
        isShow: this.isVisibilityFromDependency,
        parentName: this.parentName,
      });
    },
    tryPassDependency() {
      this.tryAddDependencyElement({
        name: this.localElementName,
        value: this.localValue,
        isShow: this.isVisibilityFromDependency,
        displayValue: this.localValue ? "Да" : "Нет",
        type: "checkbox",
      });
    },
  },
  watch: {
    checkboxValue(newValue) {
      this.localValue = Boolean(newValue);
      this.changeValid("checkbox");
    },
  },
  computed: {
    ...mapGetters(["devMode", "showInsideElementStatus"]),
    localElementName() {
      return this.checkedValueOnVoid(this.elementName)
        ? this.elementName
        : Math.random().toString();
    },
    checkboxType() {
      return this.typeDisplayClass ? this.typeDisplayClass : "base";
    },
    isErrorEmpty() {
      return this.isNeedChoice && !this.localValue;
    },

    /**
     * Возвращает цену подходящую условию, если моле отображается
     * Если не одна цена не подходит, то возвращается стандартная
     * @returns {Number|String|*}
     */
    localCost() {
      if (!this.initProcessingDependencyPrice || !this.dependencyPrices) {
        return this.cost;
      }

      let newCost = this.costAfterProcessingDependencyPrice(
        this.dependencyPrices
      );
      if (newCost !== null) {
        return newCost;
      }
      return this.cost;
    },
  },
};
</script>

<style scoped lang="scss"></style>
