<template>
  <div class="calc__checkbox-wrapper">
    <label for="idName" class="calc__checkbox-label">
      <input
        class="calc__checkbox-item"
        type="checkbox"
        :checked="checkboxValue.value"
        @input="changeValue($event)"
        :name="label"
        id="idName"
      />
      <div v-if="label" class="calc__checkbox-text">
        {{ label }}
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
  emits: ["update:checkboxValue"],
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
    },
    checkboxValue: {
      type: Object,
    },
    switchToggle: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    changeValue(e) {
      this.$emit("update:checkboxValue", {
        name: this.idName,
        value: e.target.checked,
      });
    },
  },
  computed: {
    checkboxType() {
      return this.switchToggle ? "switcher" : "base";
    },
  },
};
</script>

<style scoped lang="scss">
//normal orange - FF7044
//normal dark- 464657
//hover orange - FF5D2B
//hover dark- 5A5A70
//font - 00000
//серый - CCCCCC
// border - E6E6E6 -
// background - F2F2F2

$color-dark-normal: #464657;
$color-orange-normal: #ff7044;

$color-dark-hover: #5a5a70;
$color-orange-hover: #ff5d2b;

$color-danger: #ff4444;

$color-font-dark: #000000;
$color-font-white: #ffffff;

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
  color: $color-font-white;
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

@mixin style-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.calc {
  &__checkbox {
    &-wrapper {
      @include style-flex-center;
      width: 100%;
    }
    &-label {
      @include style-flex-center;
      justify-content: space-between;
      flex: 1 0 auto;
      position: relative;
    }
    &-text {
      @include style-flex-center;
      justify-content: flex-start;
      text-transform: uppercase;
      position: relative;
      &_second {
        text-transform: uppercase;
      }
    }

    &-element {
      position: relative;
      margin: 0 5px;
      &.base {
        width: 30px;
      }
      &.switcher {
        width: 78px;
      }
      &.switcher:after,
      &:before {
        cursor: pointer;
        content: "";
        display: inline-block;
        height: 22px;
        position: absolute;
        top: 50%;
        background-color: $color-gray-light;
        transform: translateY(-50%);
        @include style-border;
        border-width: 2px;
        border-color: $color-orange-normal;
        @include style-flex-center;
        font-size: 13px;
      }
      &.base:before {
        width: 22px;
      }
      &.switcher:before {
        width: 36px;
        content: "";
        border-bottom-left-radius: 0;
        border-top-left-radius: 0;
        border-color: $color-dark-normal;
        z-index: 1;
        right: 0;
      }
      &.switcher:after {
        content: "";
        width: 36px;
        //right: calc(0px + 40px);
        border-right: none;
        background-color: $color-dark-normal;
        box-shadow: 0 0 0 2px $color-gray-light inset;
        color: white;
        border-bottom-right-radius: 0;
        border-top-right-radius: 0;
        border-color: $color-dark-normal;
        z-index: 1;
        left: 0;
      }

      &:hover {
        &.base:before {
          border-color: $color-dark-normal;
        }
      }
    }

    &-item {
      position: absolute;
      z-index: -1;
      opacity: 0;
      display: block;
      width: 0;
      height: 0;
      &:checked {
        ~ .calc__checkbox-element {
          &.base:before {
            background-color: $color-dark-normal;
            box-shadow: 0 0 0 2px $color-gray-light inset;
            color: white;
          }
          &.switcher:after {
            color: $color-dark-normal;
            background-color: $color-gray-light;
            border-color: $color-orange-normal;
          }
          &.switcher:before {
            background-color: $color-orange-normal;
            border-color: $color-orange-normal;
            box-shadow: 0 0 0 2px $color-gray-light inset;
            color: white;
          }
          &:hover {
            &.base:before {
              background-color: $color-orange-normal;
            }
          }
        }
      }
    }
  }
}
</style>
