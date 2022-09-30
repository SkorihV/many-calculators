<template>
  <div class="calc__checkbox-wrapper">
    <label :for="elementName" class="calc__checkbox-label">
      <input
        ref="checkbox"
        class="calc__checkbox-item"
        type="checkbox"
        :checked="isChecked || checkboxValue"
        :disabled="isChecked"
        @input="changeValue($event.target.checked)"
        :name="label"
        :id="elementName"
      />
      <div
        v-if="label"
        class="calc__checkbox-text"
        :class="{ button: typeButton }"
      >
        {{ label }}<slot name="prompt"></slot>
      </div>
      <div class="calc__checkbox-element" :class="checkboxType"></div>
      <div v-if="labelSecond" class="calc__checkbox-text_second">
        {{ labelSecond }}
      </div>
    </label>
  </div>
</template>

<script>
export default {
  name: "UiCheckbox",
  emits: ["changedValue"],
  props: {
    label: {
      type: String,
      require: true,
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
      }
    },
    cost: {
      type: Number,
      default: null,
    },
    // отображать в виде горизонтального переключателя
    typeSwitcher: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      }
    },

    // отображать в виде вертикального переключателя
    typeSwitcherVertical: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      }
    },
    // отображать в виде кнопки
    typeButton: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      }
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
    // всегда включена. Отключить нельзя
    isChecked: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    },
  },
  mounted() {
      this.$emit("changedValue", {
        value: true,
        name: this.elementName,
        type: "checkbox",
        cost: this.cost,
      });
  },
  methods: {
    changeValue(checked) {
      if (!this.isChecked) {
        this.$emit("changedValue", {
          value: checked,
          name: this.elementName,
          type: "checkbox",
          label: this.label,
          cost: this.cost,
        });
      }
    },
  },
  computed: {
    checkboxType() {
      return this.typeSwitcher
        ? "switcher"
        : this.typeSwitcherVertical
        ? "switcher-vertical"
        : this.typeButton
        ? "button"
        : "base";
    },
  },
};
</script>

<style scoped lang="scss"></style>
