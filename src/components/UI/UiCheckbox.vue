<template>
  <div
    class="calc__checkbox-wrapper"
    :class="classes"
    v-if="isVisibilityFromDependency"
  >
    <label :for="localElementName" class="calc__checkbox-label">
      <input
        ref="checkbox"
        class="calc__checkbox-item"
        type="checkbox"
        :checked="isChecked || localValue"
        :disabled="isChecked"
        @input="localValue = $event.target.checked"
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
      <div v-if="labelSecond.length" class="calc__checkbox-text_second">
        {{ labelSecond }}
      </div>
    </label>
    <ui-tooltip :is-show="isErrorEmpty" :tooltip-text="textErrorNotEmpty" />
  </div>
</template>

<script>
import UiTooltip from "@/components/UI/UiTooltip";
import { MixinsForWorkersTemplates } from "@/components/UI/MixinsForWorkersTemplates";

export default {
  name: "UiCheckbox",
  emits: ["changedValue", "changeValid"],
  mixins: [MixinsForWorkersTemplates],
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
    checkedValueOnVoid(value) {
      return value?.length !== 0 && value !== undefined && value !== null;
    },
    changeValue(eventType = "click") {
      this.$emit("changedValue", {
        value: this.localValue,
        name: this.localElementName,
        type: "checkbox",
        label: this.label,
        cost: this.localValue ? this.cost : null,
        formOutputMethod:
          this.formOutputMethod !== "no" ? this.formOutputMethod : null,
        eventType,
      });
      this.changeValid();
    },
    changeValid() {
      this.$emit("changeValid", {
        error: this.isErrorEmpty,
        name: this.localElementName,
        type: "checkbox",
        label: this.label,
      });
    },
  },
  watch: {
    checkboxValue(newValue) {
      this.localValue = Boolean(newValue);
      this.changeValid();
    },
  },
  computed: {
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
  },
};
</script>

<style scoped lang="scss"></style>
