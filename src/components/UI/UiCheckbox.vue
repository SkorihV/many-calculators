<template>
  <div class="calc__checkbox-wrapper">
    <label :for="idName" class="calc__checkbox-label">
      <input
        class="calc__checkbox-item"
        type="checkbox"
        :checked="checkboxData.value"
        @input="changeValue($event)"
        :name="label"
        :id="idName"
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
  emits: ["checkboxCheckbox"],
  props: {
    label: {
      type: String,
      require: true,
    },
    labelSecond: {
      type: String,
      default: "",
    },
    idName: {
      type: String,
      default: Math.random().toString(),
    },
    checkboxData: {
      type: Object,
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
      this.$emit("checkboxCheckbox", {
        name: this.idName,
        value: e.target.checked,
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
