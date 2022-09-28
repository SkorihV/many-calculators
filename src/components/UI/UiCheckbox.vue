<template>
  <div class="calc__checkbox-wrapper">
    <label :for="checkboxName" class="calc__checkbox-label">
      <input
        class="calc__checkbox-item"
        type="checkbox"
        :checked="checkboxValue"
        @input="changeValue($event)"
        :name="label"
        :id="checkboxName"
      />
      <div v-if="label" class="calc__checkbox-text">
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
    checkboxName: {
      type: String,
      default: Math.random().toString(),
    },
    checkboxValue: {
      type: Boolean,
    },
    switchToggle: {
      type: Boolean,
      default: false,
    },
    switchToggleVertical: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    changeValue(e) {
      this.$emit("changedValue", {
        value: e.target.checked,
        name: this.checkboxName,
        type: "checkbox"
      });
    },
  },
  computed: {
    checkboxType() {
      return this.switchToggle
        ? "switcher"
        : this.switchToggleVertical
        ? "switcher-vertical"
        : "base";
    },
  },
};
</script>

<style scoped lang="scss"></style>
