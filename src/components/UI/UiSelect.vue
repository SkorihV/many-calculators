<template>
  <div
    class="calc__select-wrapper"
    :class="{ 'is-column': isColumn }"
    :style="[minWidthWrapper, maxWidthWrapper]"
  >
    <div class="calc__select-label" v-if="label">
      {{ label }}<slot name="prompt"></slot>
    </div>
    <div class="calc__select-change-wrapper">
      <div
        class="calc__select-change-item"
        @click="toggleOpenClose"
        :class="{ 'is-open': isOpen }"
      >
        <div
          v-if="currentOption?.image?.filename"
          class="calc__select-image-wrapper"
        >
          <img
            alt="currentOption.title"
            class="calc__select-image-item"
            :src="currentOption.image.filename"
          />
        </div>
        {{ currentOption.title }}
      </div>

      <div class="calc__select-option-wrapper" v-if="isOpen">
        <div
          class="calc__select-option-item"
          @click="selected(option, idx)"
          v-for="(option, idx) in options"
          :key="option.value"
        >
          <div
            v-if="option?.image?.filename"
            class="calc__select-image-wrapper"
          >
            <img
              alt="option.title"
              class="calc__select-image-item"
              :src="option.image.filename"
            />
          </div>
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
    minWidth: {
      type: [Number, String],
      default: 200,
    },
    maxWidth: {
      type: [Number, String],
    },
  },
  data() {
    return {
      isOpen: false,
      currentOption: {},
      currentIndexOption: 0,
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
    selected(item, idx) {
      this.currentOption = item;
      this.currentIndexOption = idx;
      this.close();
    },
  },
  watch: {
    currentOption() {
      this.$emit("selectedValue", this.currentOption);
    },
    options() {
      this.currentOption = this.options[this.currentIndexOption];
    },
  },
  computed: {
    minWidthWrapper() {
      return this.minWidth ? `min-width:${this.minWidth}px;` : "";
    },
    maxWidthWrapper() {
      return this.maxWidth ? `max-width:${this.maxWidth}px;` : "";
    },
  },
};
</script>

<style scoped></style>
