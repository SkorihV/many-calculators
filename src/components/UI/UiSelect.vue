<template>
  <div
    class="calc__select-wrapper"
    :class="[{ 'is-column': isColumn }, classes]"
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
            :src="imageDir + currentOption.image.filename"
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
          <template v-if="currentIndexOption !== idx">
          <div
            v-if="option?.image?.filename"
            class="calc__select-image-wrapper"
          >
            <img
              :alt="option.selectName"
              class="calc__select-image-item"
              :src="imageDir + option.image.filename"
            />
          </div>
            <div class="calc__select-option-item-text">{{ option.selectName }}</div>
          <ui-prompt
            v-if="option?.prompt?.length"
            :prompt-text="option.prompt"
          ></ui-prompt>
          </template>
        </div>
      </div>
    </div>
    <ui-tooltip :is-show="isErrorEmpty" :tooltip-text="textErrorNotEmpty" />
  </div>
</template>

<script>
import UiTooltip from "@/components/UI/UiTooltip";
import UiPrompt from "@/components/UI/UiPrompt";

export default {
  name: "UiSelect",
  components: { UiTooltip, UiPrompt },
  emits: ["changedValue", "changeValid"],
  mounted() {
    if (!this.isErrorEmpty && !this.isNeedChoice) {
      let timer = setInterval(() => {
        if (this.currentIndexOption === null && this.selectValues.length) {
          this.currentIndexOption =
            this.checkedValueOnVoid(this.selectedItem) && parseInt(this.selectedItem) < this.selectValues.length
              ? parseInt(this.selectedItem)
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
      default: null,
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
    // необходимо для принудительного вывода в результат формы, даже если цена не указана
    notOnlyForCalculations: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    },
    classes: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      isOpen: false,
      currentOption: {},
      currentIndexOption: null,
      textErrorNotEmpty: "Обязательное поле.",
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
        error: this.isErrorEmpty,
        name: this.localElementName,
        type: "select",
        label: this.label,
      });
    },
  },
  watch: {
    currentOption() {
      this.$emit("changedValue", {
        value: this.currentOption,
        index: this.currentIndexOption,
        name: this.localElementName,
        type: "select",
        cost: this.currentCost,
        label: this.label,
        alwaysOutput: Boolean(this.notOnlyForCalculations),
      });
      this.changeValid();
    },
    options() {
      this.currentOption = this.selectValues[this.currentIndexOption];
    },
    selectedItem(newValue) {
      this.currentIndexOption =
        this.checkedValueOnVoid(this.newValue) && parseInt(this.newValue) < this.selectValues.length
          ? parseInt(this.newValue)
          : this.selectValues.length - 1;
      this.currentOption = this.selectValues[this.currentIndexOption];
    },
  },
  computed: {
    localElementName() {
      return this.checkedValueOnVoid(this.elementName) ? this.elementName : Math.random().toString();
    },
    imageDir() {
      return window?.imageDir ? window.imageDir : "";
    },
    currentCost() {
      return this.checkedValueOnVoid(this.currentOption?.cost)
        ? this.currentOption.cost
        : null;
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
