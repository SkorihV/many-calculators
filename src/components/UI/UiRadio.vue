<template>
  <div
    class="calc__radio-wrapper"
    :class="[radioType, { column: isColumn, solid: isSolid, wrap: isWrap }]"
  >
    <div class="calc__radio-title" v-if="label">
      {{ label }} <slot name="prompt" />
    </div>
    <div class="calc__radio-wrapper-buttons">
      <div
        class="calc__radio-label"
        v-for="(radio, idx) in radioValues"
        :id="elementName + '_' + idx"
        :class="{ checked: idx === currentIndexRadioButton }"
        :key="idx"
        @click="changeRadio(radio, idx)"
      >
        <span class="calc__radio-indicator" v-if="radioType === 'base'"></span>
        <span class="calc__radio-text">{{ radio.radioName }}</span>
        <slot :name="idx"></slot>
        <ui-prompt :prompt-text="radio.prompt"/>
      </div>
    </div>
  </div>
</template>

<script>
import UiPrompt from "@/components/UI/UiPrompt";

export default {
  name: "UiRadio",
  emits: ["changedValue"],
  components: {UiPrompt},
  mounted() {
    let timer = setInterval(() => {
      if (this.currentIndexRadioButton === null && this.radioValues.length) {
        this.currentIndexRadioButton =
          parseInt(this.selectedItem) < this.radioValues.length
            ? parseInt(this.selectedItem)
            : this.radioValues.length - 1;
        this.changeRadio(
          this.radioValues[this.currentIndexRadioButton],
          this.currentIndexRadioButton
        );
        clearInterval(timer);
      }
    }, 100);
    setTimeout(() => {
      clearInterval(timer);
    }, 10000);
  },

  props: {
    radioValues: {
      type: Array,
      default: () => [],
    },
    elementName: {
      type: String,
      default: Math.random().toString(),
    },
    label: {
      type: String,
      default: null,
    },
    // стандартное отображение с кружками
    typeBase: {
      type: [Boolean, Number],
      default: true,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      }
    },
    // Радиокнопки отображаются без кружков
    typeButton: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      }
    },
    // способ отображения - указать текстом
    // default - base
    // 1) buttons
    typeDisplayClass: {
      type: String,
      default: null,
    },
    // номер предвыборной кнопки
    selectedItem: {
      type: [Number, String],
      default: 0,
    },
    // вертикальное положение кнопок
    isColumn: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      }
    },
    // в горизонтальном положении убрать пробелы между кнопками
    isSolid: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      }
    },
    // включить перенос для заголовка и кнопок
    isWrap: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      }
    },
  },
  data() {
    return {
      currentIndexRadioButton: null,
    };
  },
  methods: {
    changeRadio(radio, index) {
      this.currentIndexRadioButton = index;
      this.$emit("changedValue", {
        value: radio,
        index,
        name: this.elementName,
        type: "radio",
        label: this.label,
      });
    },
  },
  computed: {
    radioType() {
      if (this.typeDisplayClass) {
        return this.typeDisplayClass;
      }

      return this.typeButton ? "buttons" : this.typeBase ? "base" : "base";
    },
  },
};
</script>

<style scoped lang="scss"></style>
