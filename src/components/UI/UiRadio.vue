<template>
  <div
    class="calc__radio-wrapper"
    :class="[radioType, { 'column': isColumn, 'solid' : isSolid, 'wrap': isWrap }]"
  >
    <div class="calc__radio-title" v-if="title">{{title}} <slot name="prompt"/></div>
    <div class="calc__radio-wrapper-buttons">
      <div
        class="calc__radio-label"
        v-for="(radio, idx) in radioValues"
        :id="radioName + '_' + idx"
        :class="{'checked' : idx === currentCheckedId}"
        @click="changeRadio(radio, idx)"
      >
        <span class="calc__radio-indicator" v-if="radioType === 'base' "></span>
        <span class="calc__radio-text">{{ radio.label }}</span>
        <ui-prompt v-if="radio?.prompt" :prompt-text="radio.prompt"></ui-prompt>
      </div>
    </div>
  </div>
</template>

<script>
import UiPrompt from "@/components/UI/UiPrompt";

export default {
  name: "UiRadio",
  components: {UiPrompt},
  emits: ["changedValue"],
  mounted() {
    this.currentCheckedId = this.radioChecked;

  },

  props: {
    label: {
      type: String,
      default: "",
    },
    radioValues: {
      type: Array,
      default: [],
    },
    radioName: {
      type: String,
      default: Math.random().toString(),
    },
    title: {
      type: String,
    },
    // визуальное отображение кнопок
    // base - у кнопок есть кружки как у стандартных
    // buttons - без кружков. Индикатор нажатия отображается цветом
    radioType: {
      type: String,
      default: "base",
    },
    // номер предвыборной кнопки
    radioChecked: {
      type: Number,
      default: 0,
    },
    // вертикальное положение кнопок
    isColumn: {
      type: Boolean,
    },
    // в горизонтальном положении убрать пробелы между кнопками
    isSolid: {
      type: Boolean
    },
    // включить перенос для заголовка и кнопок
    isWrap: {
      type: Boolean
    }
  },
  data() {
    return {
      currentCheckedId: null,
      isMounted: false,
    };
  },
  watch: {
    radioValues() {
      if (!this.isMounted && this.radioValues.length) {
        this.changeRadio(this.radioValues[this.radioChecked], this.radioChecked);
        this.isMounted = true;
      }
    }
  },
  methods: {
    changeRadio(radio, index) {
      this.currentCheckedId = index;
      this.$emit("changedValue", { value : radio, index, name: this.radioName, type: "radio" });
    },
  },
};
</script>

<style scoped lang="scss">
//normal orange - FF5D2B
//normal dark- 464657
//hover orange - FF7044
//hover dark- 5A5A70
//font - 00000
//серый - CCCCCC
// border - E6E6E6 -
// background - F2F2F2

$color-dark-normal: #464657;
$color-orange-normal: #ff5d2b;

$color-dark-hover: #5a5a70;
$color-orange-hover: #ff7044;

$color-danger: #ff4444;

$color-black: #000000;
$color-white: #ffffff;

$color-gray-light: #f2f2f2;
$color-gray-middle: #e6e6e6;
$color-gray-dark: #cccccc;

$border-radius: 4px;

@mixin style-border {
  border: 1px solid $color-gray-middle;
  border-radius: $border-radius;
}

@mixin style-border-hover {
  border: 1px solid $color-gray-dark;
}

@mixin style-button {
  color: $color-white;
  cursor: pointer;
  background-color: $color-dark-normal;
  @include style-flex-center;
  @include style-border;
}

@mixin style-button-hover {
  background-color: $color-dark-hover;
  box-shadow: 0 0 3px 1px $color-gray-dark;
}

@mixin style-flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

@mixin style-flex-start {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

@mixin style-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.calc {
  &__radio {
    &-wrapper {
      @include style-flex-start;
      align-items: stretch;
      gap: 5px;
      &.base {
        .calc__radio {
          &-indicator {
            position: relative;
            display: flex;
            width: 16px;
            height: 16px;
            @include style-border;
            border-radius: 50%;
            margin-right: 4px;
            flex-shrink: 0;
          }
        }
      }

      &.buttons {
        .calc__radio-label {
          &.checked {
            background-color: $color-orange-normal;
            color: $color-white;
          }
        }
      }

      &.column {
        flex-direction: column;
        align-items: start;
        .calc__radio-wrapper-buttons {
          flex-direction: column;
        }
        .calc__radio-label {
          flex: 1 1 auto;
          margin: 1px 0;
        }
      }
      &.solid {
        .calc__radio-wrapper-buttons {
          gap: 0;
        }
        .calc__radio-label {
          flex: 1 1 auto;
          border-right: 1px solid $color-gray-middle;
          border-radius: 0;
        }
      }
      &.wrap {
        flex-wrap: wrap;
      }

      &-buttons {
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        flex: 1 1 auto;
      }
    }
    &-title {
      @include style-flex-start;
      font-weight: 600;
      flex: 0 1 auto;
    }

    &-label {
      @include style-button;
      @include style-flex-start;
      border-bottom: 1px solid $color-orange-normal;
      padding: 5px 10px;
      position: relative;
      &:hover {
        @include style-button-hover;
      }
      &.checked {
        .calc__radio-indicator {
          &::after {
            content: "";
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            border-radius: 50%;
            width: 10px;
            height: 10px;
            background-color: $color-orange-normal;
          }
        }
      }
      &::after {
        content: '';
        display: block;
        left: 0;
        width: 100%;
        position: absolute;
        background-color: $color-white;
        height: 1px;
        bottom: 1px;
      }
    }
    &-text {
      display: flex;
      color: $color-white;
    }
  }
}
</style>
