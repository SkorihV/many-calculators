<template>
  <div class="calc__checkbox-wrapper">
    <label :for="localElementName" class="calc__checkbox-label">
      <input
        ref="checkbox"
        class="calc__checkbox-item"
        type="checkbox"
        :checked="isChecked || localValue"
        :disabled="isChecked"
        @input="changeValue($event.target.checked)"
        :name="label"
        :id="localElementName"
      />
      <div
        v-if="label"
        class="calc__checkbox-text"
        :class="{ button: checkboxType === 'button' }"
      >
        {{ label }}<slot name="prompt"></slot>
      </div>
      <div class="calc__checkbox-element" :class="checkboxType"></div>
      <div v-if="labelSecond" class="calc__checkbox-text_second">
        {{ labelSecond }}
      </div>
    </label>
    <ui-tooltip :is-show="isErrorEmpty" :tooltip-text="textErrorNotEmpty" />
  </div>
</template>

<script>
import UiTooltip from "@/components/UI/UiTooltip";

export default {
  name: "UiCheckbox",
  emits: ["changedValue", "changeValid"],
  components: { UiTooltip },
  props: {
    label: {
      type: String,
      default: "",
    },
    labelSecond: {
      type: String,
      default: "",
    },
    elementName: {
      type: String,
      default: Math.random().toString(),
    },
    //Начальное значение
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
    // отображать в виде горизонтального переключателя
    typeSwitcher: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    },
    // отображать в виде вертикального переключателя
    typeSwitcherVertical: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    },
    // отображать в виде кнопки
    typeButton: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    },
    // альтернативный способ смены вида чекбокас - текстом
    // default - base
    // switcher - горизонтальный переключатель
    // switcher-vertical - вертикальный переключатель
    // button - кнопка
    typeDisplayClass: {
      type: String,
      default: null,
    },
    // Всегда включена. Отключить нельзя
    isChecked: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    },
    isNeedChoice: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    },
  },
  mounted() {
    this.localValue = Boolean(this.checkboxValue);
    this.localCost = this.cost?.length !== 0 ? Number(this.cost) : null;
    this.changeValue(this.localValue);
    this.localElementName =  this.checkedValueOnVoid(this.elementName) ? this.elementName : Math.random().toString()
  },
  data() {
    return {
      localValue: null,
      textErrorNotEmpty: "Обязательное поле.",
      localCost: null,
      localElementName: null
    };
  },
  methods: {
    checkedValueOnVoid(value) {
      return value?.length !== 0 && value !== undefined && value !== null;
    },
    changeValue(checked) {
      this.localValue = checked;
      this.$emit("changedValue", {
        value: checked,
        name: this.elementName,
        type: "checkbox",
        label: this.label,
        cost: this.localCost,
      });
      this.changeValid();
    },
    changeValid() {
      this.$emit("changeValid", {
        error: this.isErrorEmpty,
        name: this.elementName,
        type: "checkbox",
        label: this.label
      });
    },
  },
  computed: {
    checkboxType() {
      if (this.typeDisplayClass) {
        return this.typeDisplayClass;
      }

      return this.typeSwitcher
        ? "switcher"
        : this.typeSwitcherVertical
        ? "switcher-vertical"
        : this.typeButton
        ? "button"
        : "base";
    },
    isErrorEmpty() {
      return this.isNeedChoice && !this.localValue;
    },
  },
};
</script>

<style scoped lang="scss"></style>
