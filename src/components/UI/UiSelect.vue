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
        v-if="currentOption"
        class="calc__select-change-item"
        @click="toggleOpenClose"
        :class="{ 'is-open': isOpen }"
      >
        <div
          v-if="currentOption?.image?.filename"
          class="calc__select-image-wrapper"
        >
          <img
            :alt="currentOption.selectName"
            class="calc__select-image-item"
            :src="currentOption.image.filename"
          />
        </div>
        {{ currentOption.selectName }}
      </div>
      <div class="calc__select-option-wrapper" v-if="isOpen">
        <div
          class="calc__select-option-item"
          @click="changeSelect(option, idx)"
          v-for="(option, idx) in selectValues"
          :key="idx"
        >
          <div
            v-if="option?.image?.filename"
            class="calc__select-image-wrapper"
          >
            <img
              :alt="option.selectName"
              class="calc__select-image-item"
              :src="option.image.filename"
            />
          </div>
          {{ option.selectName }}
        </div>
      </div>
    </div>
    <ui-tooltip :is-show="isErrorEmpty" :tooltip-text="textErrorNotEmpty" />
  </div>
</template>

<script>
import UiTooltip from "@/components/UI/UiTooltip";

export default {
  name: "UiSelect",
  components: { UiTooltip },
  emits: ["changedValue", "changeValid"],
  mounted() {
    this.localSelectedItem = this.checkedValueOnVoid(this.selectedItem) ? this.selectedItem : 0;
    if (!this.isErrorEmpty) {
      let timer = setInterval(() => {
        if (this.currentIndexOption === null && this.selectValues.length) {
          this.currentIndexOption =
            parseInt(this.localSelectedItem) < this.selectValues.length
              ? parseInt(this.localSelectedItem)
              : this.selectValues.length - 1;
          this.changeSelect(
            this.selectValues[this.currentIndexOption],
            this.currentIndexOption
          );
          clearInterval(timer);
        }
      }, 100);
      setTimeout(() => {
        clearInterval(timer);
      }, 10000);
    } else {
      this.changeValid();
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
    selectValues: {
      type: Array,
      default: () => [],
    },
    elementName: {
      type: String,
      default: Math.random().toString(),
    },
    isColumn: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    },
    // По умолчанию не выбрано - нужно сделать выбор.
    isNeedChoice: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    },
    // Выбор обязателен - будет выдавать ошибку
    notEmpty: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    },
    minWidth: {
      type: [Number, String],
      default: 200,
    },
    maxWidth: {
      type: [Number, String],
    },
    // номер выбранного селекта
    selectedItem: {
      type: [Number, String],
      default: 0,
      validator(value) {
        return !isNaN(Number(value));
      },
    },
  },
  data() {
    return {
      isOpen: false,
      currentOption: {},
      currentIndexOption: null,
      textErrorNotEmpty: "Обязательное поле.",
      localSelectedItem: 0,
    };
  },
  methods: {
    checkedValueOnVoid(value) {
      return value?.length !== 0 && value !== undefined && value !== null;
    },
    open() {
      this.isOpen = true;
    },
    toggleOpenClose() {
      this.isOpen = !this.isOpen;
    },
    close() {
      this.isOpen = false;
    },
    changeSelect(item, idx) {
      this.currentIndexOption = idx;
      this.currentOption = item;
      this.close();
    },
    changeValid() {
      this.$emit("changeValid", {
        isInvalid: this.isErrorEmpty,
        name: this.elementName,
        type: "select",
        label: this.label
      });
    },
  },
  watch: {
    currentOption() {
      this.$emit("changedValue", {
        value: this.currentOption,
        index: this.currentIndexOption,
        name: this.elementName,
        type: "select",
        cost: this.currentCost
      });
      this.changeValid();
    },
    options() {
      this.currentOption = this.selectValues[this.currentIndexOption];
    },
  },
  computed: {
    currentCost() {
      return  this.checkedValueOnVoid(this.currentOption?.cost) ? this.currentOption.cost : null;
    },
    minWidthWrapper() {
      return this.minWidth ? `min-width:${this.minWidth}px;` : "";
    },
    maxWidthWrapper() {
      return this.maxWidth ? `max-width:${this.maxWidth}px;` : "";
    },
    isErrorEmpty() {
      return this.notEmpty && this.currentIndexOption === null;
    },
  },
};
</script>

<style scoped></style>
