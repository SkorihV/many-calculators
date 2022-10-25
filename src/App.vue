<template>
  <div class="main-wrapper">
    <div class="main-menu">
      <router-link
        v-for="router in routes"
        :to="router.path"
        class="main-menu__item"
        active-class="main-menu__item_active"
        >{{ router.name }}
      </router-link>
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: "#App",
  mounted() {},
  data() {
    return {};
  },
  computed: {
    routes() {
      return this.$router.getRoutes();
    },
  },
};
</script>

<style lang="scss">
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

* {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: 0;
}

.main-wrapper {
  max-width: 980px;
  margin: 0 auto;
  background-color: $color-gray-light;
  padding: 3px;
}

.main-menu {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin: 5px;
  &__item {
    padding: 10px;
    text-decoration: none;
    display: flex;
    align-items: center;
    justify-content: center;
    @include style-border;
    @include style-button;
    color: $color-dark-normal;
    background-color: $color-gray-middle;
    font-weight: 500;
    &:hover {
      @include style-border-hover;
      @include style-button-hover;
      color: $color-white;
    }
    &_active {
      @include style-border-hover;
      @include style-button-hover;
      color: $color-white;
    }
  }
}

.calc {
  * {
    margin: 0;
    font-size: 15px;
    text-align: center;
    color: $color-dark-normal;
    font-family: Arial, Helvetica, sans-serif;
    box-sizing: border-box;
  }

  &__wrapper {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    &-group-data {
      margin-bottom: 5px;
      padding-left: 20px;
      border-left: 3px solid $color-orange-normal;
      width: 100%;
      &:hover {
        background-color: $color-gray-middle;
      }
    }
  }
  &__error-block {
    width: 100%;
    @include style-flex-center;
    padding: 20px;
    background-color: $color-danger;
    color: $color-white;
  }
  &__show-result-btn {
    @include style-button;
    padding: 20px;
    align-self: center;
    &:hover {
      @include style-button-hover;
      background-color: $color-orange-normal;
    }
  }
  //--------Стили input text-----
  &__input {
    &-wrapper {
      @include style-flex-center;
      flex-direction: column;
      position: relative;
      &.is-stretch {
        flex: 1 1 100%;
      }
      &-data {
        display: flex;
        align-items: center;
        position: relative;
        gap: 2px;
      }
    }

    &-label {
      @include style-flex-start;
      width: 100%;
      justify-content: space-between;
      align-items: flex-start;
      &.is-column {
        flex-direction: column;
      }
      @media all and (max-width: 480px) {
        flex-direction: column;
        align-items: start;
        justify-content: center;
      }
      &-text {
        display: flex;
        justify-content: flex-start;
        position: relative;
        margin-right: 10px;
        padding: 5px 0;
        text-align: start;
      }
    }

    &-item {
      font-size: 15px;
      line-height: 16px;
      padding: 5px;
      max-width: 120px;
      @include style-border;
      border-bottom: 2px solid $color-orange-normal;
      &:hover,
      &:focus-visible {
        @include style-border-hover;
        border-bottom: 2px solid $color-dark-normal;
        outline: none;
      }
    }

    &-buttons {
      &-plus,
      &-minus {
        width: 24px;
        height: 24px;
        @include style-button;
        font-weight: 600;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        &:hover {
          background-color: $color-orange-normal;
        }
      }
    }
    &-unit {
      margin-left: 5px;
    }
  }
  //--------Стили input range-----

  &__range {
    &-wrapper {
      background-color: $color-gray-middle;
      display: flex;
      flex-direction: column;
      width: 100%;
      position: relative;
    }
    &-label {
      @include style-flex-start;
      padding: 5px;
      font-weight: 600;
    }
    &-item {
      -webkit-appearance: none;
      width: 100%;
      height: 15px;
      max-height: 30px;
      border-radius: 5px;
      background: #d3d3d3;
      outline: none;

      -webkit-transition: 0.2s;
      transition: opacity 0.2s;
      &::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 25px;
        height: 25px;
        background: $color-dark-normal;
        cursor: pointer;
        @include style-border;
        &:hover {
          background-color: $color-dark-hover;
          @include style-border-hover;
        }
      }
      &::-moz-range-thumb {
        width: 25px;
        height: 25px;
        border-radius: 50%;
        background: $color-dark-normal;
        cursor: pointer;
        @include style-border;
        &:hover {
          @include style-border-hover;
        }
      }
    }

    &-steps {
      &-wrapper {
        @include style-flex-center;
        justify-content: space-around;
        margin: 5px 0;
        max-height: 30px;
      }
      &-item {
        flex: 1 1 auto;
        position: relative;
        cursor: pointer;
        max-height: 30px;
        &:after {
          content: "";
          display: block;
          padding-bottom: 100%;
        }
        &-content {
          @include style-flex-center;
          position: absolute;
          width: 100%;
          height: 100%;
          font-size: 10px;
          border-radius: $border-radius;
          &_selected {
            background-color: $color-orange-normal;
            color: $color-gray-light;
          }
        }
      }
    }

    &-current {
      &-wrapper {
        @include style-flex-start;
        margin-left: auto;
        gap: 5px;
      }

      &-static {
        background-color: $color-dark-normal;
        color: $color-white;
        padding: 4px 6px;
        border-radius: $border-radius;
        min-width: 25px;
        min-height: 27px;
      }

      &-dynamic {
        font-size: 15px;
        line-height: 16px;
        padding: 5px;
        max-width: 40px;
        right: 0;
        @include style-border;
        border-bottom: 2px solid $color-orange-normal;
        &:hover,
        &:focus-visible {
          @include style-border-hover;
          border-bottom: 2px solid $color-dark-normal;
          outline: none;
        }
      }
    }
  }

  //---------Стили select-----

  &__select {
    &-wrapper {
      @include style-flex-center;
      gap: 5px;
      position: relative;
      width: 100%;
      &.is-column {
        flex-direction: column;
        align-items: flex-start;
      }
      @media all and (max-width: 480px) {
        flex-direction: column;
      }
    }

    &-label {
      @include style-flex-start;
      flex: 1 1 100%;
    }

    &-change {
      &-wrapper {
        cursor: pointer;
        @include style-border;
        font-size: 15px;
        line-height: 16px;
        background-color: white;
        position: relative;
        flex: 1 1 100%;
        width: 100%;
        border-bottom: 2px solid $color-orange-normal;
        &:hover {
          @include style-border-hover;
          border-bottom: 2px solid $color-dark-normal;
          .calc__select-change-item {
            &:before {
              border: solid $color-dark-normal;
              border-width: 0 3px 3px 0;
            }
          }
        }
      }

      &-item {
        position: relative;
        padding: 5px 25px 5px 10px;
        @include style-flex-center;
        justify-content: flex-start;
        min-height: 36px;
        text-align: start;
        flex: 1 1 auto;
        gap: 5px;
        &:before {
          content: "";
          width: 7px;
          height: 7px;
          border: solid $color-orange-normal;
          border-width: 0 3px 3px 0;
          display: inline-block;
          position: absolute;
          top: 50%;
          right: 5px;
          transform: translateY(-50%) rotate(45deg);
          -webkit-transform: translateY(-50%) rotate(45deg);
        }
        &.is-open {
          &:before {
            transform: translateY(-50%) rotate(-135deg);
            -webkit-transform: translateY(-50%) rotate(-135deg);
          }
        }
      }
    }

    &-image {
      &-wrapper {
        width: 50px;
      }
      &-item {
        @include style-img;
      }
    }

    &-option {
      &-wrapper {
        display: flex;
        flex-direction: column;
        position: absolute;
        top: calc(100% + 2px);
        @include style-border;
        z-index: 10;
        width: 100%;

        border-left: 1px solid $color-orange-normal;
        border-right: 1px solid $color-orange-normal;
        border-bottom: 1px solid $color-orange-normal;
      }
      &-item {
        background-color: white;
        @include style-flex-start;
        gap: 5px;
        text-align: start;
        &-text {
          padding: 10px 25px 10px 10px;
        }
        &:hover {
          background-color: $color-gray-middle;
        }
      }
    }
  }

  //-----------------Радио кнопки ---------------
  &__radio {
    &-wrapper {
      @include style-flex-start;
      justify-content: space-between;
      align-items: stretch;
      position: relative;
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
        justify-content: flex-end;
        flex-wrap: wrap;
        flex: 0 1 auto;
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
        content: "";
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

  //--------Стили чекбокса --------------

  &__checkbox {
    &-wrapper {
      @include style-flex-start;
      position: relative;
     }
    &-label {
      @include style-flex-center;
      justify-content: flex-start;
      flex: 1 1 auto;
      position: relative;
      @media all and (max-width: 480px) {
        flex-direction: column;
        align-items: flex-start;
      }
    }
    &-text {
      @include style-flex-center;
      justify-content: flex-start;
      position: relative;

      &.button {
        @include style-button;
        padding: 10px 15px;
      }
    }

    &-element {
      position: relative;
      margin: 5px;
      height: 30px;

      &.base {
        width: 30px;
      }

      &.button {
        display: none;
      }
      &.switcher {
        width: 70px;
        &-vertical {
          width: 25px;
          height: 65px;
        }
      }

      &:after,
      &:before {
        box-sizing: border-box;
        cursor: pointer;
        content: "";
        position: absolute;
        @include style-border;
      }

      &.switcher-vertical:after,
      &.switcher:after,
      &:before {
        transition: all 0.3s ease-in-out;
        height: 22px;
        top: 50%;
        background-color: $color-gray-light;
        transform: translateY(-50%);
        border-width: 2px;
        border-color: $color-orange-normal;
        @include style-flex-center;
        font-size: 13px;
        box-sizing: border-box;
      }
      &.base:before {
        width: 22px;
      }
      &.switcher-vertical:before,
      &.switcher:before {
        transition: all 0.3s ease-in-out;
        width: 35px;
        border-bottom-left-radius: 0;
        border-top-left-radius: 0;
        border-color: $color-dark-normal;
        z-index: 1;
        right: 0;
      }
      &.switcher:after {
        width: 35px;
        border-right: none;
        background-color: $color-dark-normal;
        box-shadow: 0 0 0 2px $color-gray-light inset;
        border-bottom-right-radius: 0;
        border-top-right-radius: 0;
        border-color: $color-dark-normal;
        z-index: 1;
        left: 0;
      }
      &.switcher-vertical:after,
      &.switcher-vertical:before {
        width: 25px;
        height: 35px;
        transform: translateY(0);
      }

      &.switcher-vertical:before {
        right: auto;
        top: 0;
        border-top-left-radius: $border-radius;
        border-bottom-right-radius: 0;
        background-color: $color-dark-normal;
        box-shadow: 0 0 0 2px $color-gray-light inset;
      }
      &.switcher-vertical:after {
        border-color: $color-dark-normal;
      }

      &:hover {
        &.base:before {
          border-color: $color-dark-normal;
        }

        &.switcher:after {
          background-color: $color-dark-hover;
        }
        &.switcher-vertical:before {
          background-color: $color-dark-hover;
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
            background-color: $color-orange-normal;
            box-shadow: 0 0 0 2px $color-gray-light inset;
            color: $color-white;
          }
          &.switcher-vertical:before,
          &.switcher:after {
            color: $color-dark-normal;
            background-color: $color-gray-light;
            border-color: $color-orange-normal;
          }
          &.switcher-vertical:after,
          &.switcher:before {
            background-color: $color-orange-hover;
            border-color: $color-orange-hover;
            box-shadow: 0 0 0 2px $color-gray-light inset;
            color: $color-white;
          }

          &.switcher-vertical:before {
          }

          &:hover {
            &.switcher {
            }
            &.base:before {
              background-color: $color-orange-normal;
            }
            &.switcher-vertical:after &.switcher:before {
              background-color: $color-orange-normal;
            }
          }
        }
        ~ .calc__checkbox-text.button {
          background-color: $color-orange-normal;
          color: $color-white;
        }
      }
    }
  }

  //-------всплывающая подсказка ------
  &__prompt {
    &-wrapper {
      color: $color-dark-normal;
      position: relative;
      margin-left: 5px;
      .popup-enter-active {
        transition: all 0.5s ease;
      }
      .popup-leave-to,
      .popup-enter-from {
        top: -10000px;
        opacity: 0;
        transform: perspective(1000px) translateX(-50%) rotateX(-90deg)
          scale(0.1);
      }
      .popup-leave-from,
      .popup-enter-to {
        top: 13px;
        opacity: 1;
        transform: perspective(1000px) translateX(-50%) rotateX(-360deg)
          scale(1.1);
      }
    }

    &-button {
      background-color: #f2f2f2;
      cursor: pointer;
      width: 20px;
      height: 20px;
      @include style-flex-center;
      border: 1px solid #464657;
      border-radius: 50%;
      font-weight: 600;
      &:hover {
        background-color: $color-dark-normal;
        color: $color-white;
      }
    }
    &-popup {
      &-wrapper {
        background-color: $color-gray-light;
        font-weight: normal;
        position: absolute;
        @include style-flex-center;
        left: 50%;
        transform: translateX(-50%);
        min-width: 300px;
        max-width: 700px;
        padding: 15px;
        border: 1px solid $color-dark-normal;
        border-radius: $border-radius;
        box-shadow: 0 0 9px 0 $color-gray-dark;
        z-index: 100;
        cursor: default;
        &.isLeft {
          left: auto;
          right: 0;
          transform: translateX(0);
        }
        &.isRight {
          right: auto;
          left: 0;
          transform: translateX(0);
        }
      }
    }
  }

  // tooltip
  &__tooltip {
    &-wrapper {
      display: flex;
      position: absolute;
      background-color: $color-gray-middle;
      @include style-border;
      border-color: $color-danger;
      z-index: 100;
      padding: 2px;
      box-shadow: 0 0 3px 0 $color-danger;
      bottom: calc(100% + 10px);
      left: 50%;
      transform: translateX(-50%);

      &.isLeft {
        left: auto;
        right: 0;
        transform: none;
      }
      &.isFlex {
        display: flex;
      }

      &.isRight {
        left: 0;
        right: auto;
        transform: none;
      }

      &.tooltip-transition-enter-active {
        transition: all 0.3s ease-in-out;
      }

      &.tooltip-transition-leave-to,
      &.tooltip-transition-enter-from {
        opacity: 0;
        transform: perspective(1000px) translateX(-50%) rotateX(-360deg)
          scale(0.1);
        &.isLeft,
        &.isRight {
          transform: perspective(1000px) rotateX(-360deg);
        }
      }
      &.tooltip-transition-leave-from,
      &.tooltip-transition-enter-to {
        opacity: 1;
        transform: perspective(1000px) translateX(-50%) rotateX(-360deg)
          scale(1.1);

        &.isLeft,
        &.isRight {
          transform: perspective(1000px) rotateX(-360deg);
        }
      }
    }
    &-decor {
      content: "";
      width: 20px;
      height: 20px;
      background-color: #e6e6e6;
      position: absolute;
      border-radius: 4px;
      z-index: -1;
      right: calc(50% - 10px);
      top: calc(100% - 12px);
      transform: translateX(-50%) rotate(45deg);
      border-bottom: 1px solid #ff4444;
      border-right: 1px solid #ff4444;
    }
    &-text {
      display: flex;
      color: $color-danger;
      border-radius: $border-radius;
      justify-content: center;
      min-width: 300px;
      background-color: $color-gray-middle;
    }
  }

  //--------------форма-----------------
  &__form {
    @include style-flex-center;
    flex-direction: column;
    max-width: 400px;
    width: 100%;
    padding: 10px;
    @include style-border;
    border-color: $color-dark-normal;
    margin: 10px auto;
    background-color: $color-gray-light;

    &-label {
      @include style-flex-center;
      justify-content: space-between;
      width: 100%;
      margin-bottom: 10px;
    }

    &-input {
      font-size: 15px;
      line-height: 16px;
      padding: 10px;
      border-radius: $border-radius;
      outline: none;
      width: 100%;
      max-width: 200px;
    }

    &-textarea {
      width: 100%;
      min-height: 500px;
      margin-bottom: 10px;
      outline: none;
      &[readonly] {
        background-color: $color-gray-light;
      }
    }

    &-submit {
      @include style-button;
      padding: 10px;
      @include style-flex-center;
      &:disabled {
        background-color: $color-gray-dark;
      }
    }
  }

  //---------------аккордеон----------------
  &__accordion {
    &-main-label {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 10px;
    }
    &-wrapper {
      @include style-flex-start;
      align-items: start;
      flex-direction: column;
      width: 100%;
    }
    &-item {
      &-label {
        @include style-button;
        @include style-flex-start;
        border-radius: 0;
        padding: 10px;
        width: 100%;
        margin-bottom: 5px;
        position: relative;
        gap: 5px;
        &:hover {
          @include style-button-hover;
        }
        &.isOpen {
          background-color: $color-orange-normal;
        }
        &.isError {
          background-color: $color-danger;
        }
        &-wrapper {
          @include style-flex-start;
          flex-direction: column;
          flex: 1 1 auto;
          width: 100%;
        }
      }
      &-content {
        width: 100%;
      }
      &-plus,
      &-minus {
        position: relative;
        width: 30px;
        height: 30px;
      }
      &-plus:before,
      &-minus:before {
        width: 30px;
        height: 30px;
        color: #ffffff;
        font-size: 30px;
        position: absolute;
        border: 1px solid #ffffff;
        border-radius: 50%;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        display: flex;
        justify-content: center;
        align-items: center;
      }

      &-plus:before {
        content: "+";
      }

      &-minus:before {
        content: "-";
      }
    }
  }

  //---------------------табы-----------------
  &__tab {
    &-main-label {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 10px;
      width: 100%;
      text-align: start;
    }
    &-wrapper {
      @include style-flex-start;
      align-items: start;
      flex-direction: column;
      width: 100%;
      margin: 10px 0;
    }
    &-item {
      &-label {
        @include style-button;
        @include style-flex-start;
        border-radius: 0;
        padding: 10px;
        margin-bottom: 5px;
        position: relative;
        &:hover {
          @include style-button-hover;
        }
        &.isOpen {
          background-color: $color-orange-normal;
        }
        &.isError {
          background-color: $color-danger;
        }
        &-wrapper {
          @include style-flex-start;
          flex: 1 1 auto;
          width: 100%;
        }
      }
      &-content-wrapper {
        display: flex;
        flex-direction: column;
        width: 100%;
      }
      &-content {
        @include style-flex-start;
        width: 100%;
      }
    }
  }

  &__bisection {
    &-label {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 10px;
      color: $color-dark-normal;
    }

    &-wrapper {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      width: 100%;
    }
    &-content-wrapper {
      display: flex;
      width: 100%;
      gap: 15px;
      @media all and (max-width: 768px) {
        flex-direction: column;
        align-items: start;
      }
    }
    &-left-side-wrapper,
    &-right-side-wrapper {
      flex: 1 1 auto;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    &-left-label,
    &-right-label {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 10px;
      color: $color-dark-normal;
    }
  }

  &__error {
    &-toggle {
      position: absolute;
      right: 0;
      top: 0;
      width: 40px;
      height: 40px;
      @include style-button;
    }
    &-wrapper {
      display: none;
      position: fixed;
      right: 0;
      flex-direction: column;
      bottom: 0;
      margin: 10px;
      background-color: $color-dark-normal;
      padding: 10px;
      color: $color-white;
      border-radius: $border-radius;
      max-width: 450px;
      max-height: 500px;
      box-shadow: 0 0 2px 2px $color-danger;
      min-height: 22px;
      min-width: 22px;
      &.isShow {
        display: flex;
      }
    }
    &-label {
      color: $color-orange-normal;
      margin-top: 35px;
    }
    &-item {
      display: flex;
      flex-direction: column;
      margin: 5px 0;
    }
    &-alert {
      margin-top: 15px;
      font-size: 18px;
    }
  }

  &__image {
    &-wrapper {
      display: flex;
      flex-direction: column;
      align-items: start;
      &-image {
        width: 100%;
        img {
          @include style-img;
        }
      }
    }
    &-label {
      &-wrapper {
        display: flex;
        margin: 5px 0;
      }
    }
  }
}
</style>
