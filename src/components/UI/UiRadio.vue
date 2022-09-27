<template>
  <div
    class="calc__radio-wrapper"
    :class="[radioType, { 'is-column': isColumn }]"
  >
    <label
      :for="radioName + idx"
      class="calc__radio-label"
      v-for="(radio, idx) in radioValue"
    >
      <input
        class="calc__radio-input"
        type="radio"
        :name="radioName"
        :id="radioName + idx"
        :value="radio.label"
        @change="changeRadio(radio, idx)"
        :checked="idx === checkedRadio"
      />
      <span class="calc__radio-indicator"></span>
      <span class="calc__radio-text">{{ radio.label }}</span>
    </label>
  </div>
</template>

<script>
export default {
  name: "UiRadio",
  emits: ["changeRadio"],
  props: {
    label: {
      type: String,
      default: "",
    },
    radioValue: {
      type: Array,
      default: [],
    },
    radioName: {
      type: String,
      default: Math.random().toString(),
    },
    radioType: {
      type: String,
      default: "button",
    },
    // номер предвыборной кнопки
    checkedRadio: {
      type: Number,
      default: 0,
    },
    isColumn: {
      type: Boolean,
    },
  },
  data() {
    return {
      currentValue: null,
    };
  },
  methods: {
    changeRadio(radio, index) {
      this.$emit("changeRadio", { radio, index, radioName: this.radioName });
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
      gap: 5px;
      flex-wrap: wrap;
      &.base {
        .calc__radio {
          &-indicator {
            position: relative;
            width: 16px;
            height: 16px;
            @include style-border;
            border-radius: 50%;
            margin-right: 4px;
          }
        }
      }

      &.buttons {
        .calc__radio-input {
        }
      }

      &.is-column {
        flex-direction: column;
        align-items: start;
      }
    }
    &-indicator {
      display: none;
    }
    &-input {
      display: none;
      &:checked ~ .calc__radio-indicator {
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
    &-label {
      @include style-button;
      padding: 5px 10px;
      &:hover {
        @include style-button-hover;
      }
    }
    &-text {
    }
  }
}
</style>
