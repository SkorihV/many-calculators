<template>
  <div class="calc__select-wrapper" :class="{ 'is-column': isColumn }">
    <div class="calc__select-label" v-if="label">{{ label }}</div>
    <div class="calc__select-change-wrapper">
      <div
        class="calc__select-change-item"
        @click="toggleOpenClose"
        :class="{ 'is-open': isOpen }"
      >
        {{ currentOption.title }}
      </div>

      <div class="calc__select-option-wrapper" v-if="isOpen">
        <div
          class="calc__select-option-item"
          @click="selected(option)"
          v-for="option in options"
          :key="option.value"
        >
          {{ option.title }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "UiSelect",
  emits: ["selectedValue"],
  mounted() {
    if (this.options.length) {
      this.currentOption = this.options[0];
    }

    document.addEventListener("click", (e) => {
      if (!this.$el.contains(e.target)) {
        this.close();
      }
    });
  },
  props: {
    label: {
      type: String,
    },
    options: {
      type: Array,
      default: () => [],
    },
    isColumn: {
      type: Boolean,
    },
  },
  data() {
    return {
      isOpen: false,
      currentOption: {},
    };
  },
  methods: {
    open() {
      this.isOpen = true;
    },
    toggleOpenClose() {
      this.isOpen = !this.isOpen;
    },
    close() {
      this.isOpen = false;
    },
    selected(item) {
      this.currentOption = item;
      this.close();
    },
  },
  watch: {
    currentOption() {
      this.$emit("selectedValue", this.currentOption);
    },
  },
};
</script>

<style scoped></style>
