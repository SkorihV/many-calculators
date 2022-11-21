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


//$calc-color-text : var(--calc-color-text);
//
//$calc-color-btn : var(--calc-color-btn);
//$calc-color-btn-text : var(--calc-color-btn-text);
//
//$calc-color-btn-hover : var(--calc-color-btn-hover);
//$calc-color-btn-text-hover : var(--calc-color-btn-text-hover);
//
//$calc-color-btn-checked : var(--calc-color-btn-checked);
//$calc-color-btn-checked-text : var(--calc-color-btn-checked-text);
//
//$calc-color-danger : var(--calc-color-danger);
//$calc-color-danger-text : var(--calc-color-danger-text);
//
//$calc-color-more : var(--calc-color-more);



	$calc-color-text : #464657;
	$calc-color-btn : #464657;
	$calc-color-btn-text : #ffffff;

	$calc-color-btn-hover : #6f6fdc;
	$calc-color-btn-text-hover : white;

	$calc-color-btn-checked :  #ff7044;
	$calc-color-btn-checked-text : #464657;

	$calc-color-danger : red;
	$calc-color-danger-text : white;

	$calc-color-more : yellow;


$border-radius: 4px;


@mixin style-border {
  border: 1px solid $calc-color-btn;
  border-radius: $border-radius;
  margin: 1px;
}

@mixin style-border-hover {
  border: 1px solid $calc-color-more;
}

@mixin style-button {
  color: $calc-color-btn-text;
  cursor: pointer;
  background-color: $calc-color-btn;
  @include style-flex-center;
  @include style-border;
}

@mixin style-button-hover {
  background-color: $calc-color-btn-hover;
  box-shadow: 0 0 3px 1px $calc-color-btn-hover;
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
  background-color: #f6f2f2;
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
    color: white;
    background-color: gray;
    font-weight: 500;
    &:hover {
      @include style-border-hover;
      @include style-button-hover;
      color: white;
    }
    &_active {
      @include style-border-hover;
      @include style-button-hover;
      color: white;
    }
  }
}

.calc {
  position: relative;
  * {
    margin: 0;
    font-size: 15px;
    text-align: center;
    color: $calc-color-text;
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
      border-left: 3px solid $calc-color-btn-hover;
      width: 100%;
      position: relative;
    }
  }
  &__error-block {
    width: 100%;
    @include style-flex-center;
    padding: 20px;
    background-color: $calc-color-danger ;
    color: $calc-color-danger-text;

  }
  &__show-result-btn {
    @include style-button;
    padding: 20px;
    margin: 5px 0;
    align-self: center;
    &:hover {
      @include style-button-hover;
      background-color: $calc-color-btn-hover;
    }
  }
  //--------Стили input text-----
  &__input {
    &-wrapper {
      @include style-flex-center;
      flex-direction: column;
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
      border-bottom: 2px solid $calc-color-btn-hover;
      &:hover,
      &:focus-visible {
        @include style-border-hover;
        border-bottom: 2px solid $calc-color-btn;
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
          @include style-button-hover;
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
        background: $calc-color-btn;
        cursor: pointer;
        @include style-button;
        &:hover {
          background-color: $calc-color-btn-hover;
          @include style-button-hover;
        }
      }
      &::-moz-range-thumb {
        width: 25px;
        height: 25px;
        border-radius: 50%;
        background: $calc-color-btn;
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
            background-color: $calc-color-btn ;
            color: $calc-color-btn-text;
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

        color: $calc-color-btn-text;
        padding: 4px 6px;
        @include style-button;
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
        border-bottom: 2px solid $calc-color-btn-hover;
        &:hover,
        &:focus-visible {
          @include style-border-hover;
          border-bottom: 2px solid $calc-color-btn;
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
        position: relative;
        flex: 1 1 100%;
        width: 100%;
        border-bottom: 2px solid $calc-color-btn-hover;
        background-color: white;
        &:hover {
          @include style-border-hover;
          border-bottom: 2px solid $calc-color-btn;
          .calc__select-change-item {
            &:before {
              border: solid $calc-color-btn;
              border-width: 0 3px 3px 0;
            }
          }
        }
      }

      &-item {
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
          border: solid $calc-color-btn-hover;
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

        border-left: 1px solid $calc-color-btn-hover;
        border-right: 1px solid $calc-color-btn-hover;
        border-bottom: 1px solid $calc-color-btn-hover;
      }
      &-item {
        background-color: white;
        @include style-flex-start;
        &:hover {
          background-color: $calc-color-btn-hover;
          .calc__select-option-item-text {
            color: $calc-color-btn-text-hover;
          }
        }
        gap: 5px;
        text-align: start;
        &-text {
          padding: 10px 25px 10px 10px;
          text-align: start;
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
      min-height:31px;
      &.base {
        .calc__radio {
          &-indicator {
            position: relative;
            display: flex;
            width: 16px;
            height: 16px;
            border: 1px solid $calc-color-btn-text;
            border-radius: $border-radius;
            border-radius: 50%;
            margin-right: 4px;
            flex-shrink: 0;
            &:hover {
              border: 1px solid $calc-color-btn-text-hover;
            }
          }
        }
        .calc__radio-label:hover {
          box-shadow: 0 0 3px 1px $calc-color-btn-hover;
          background-color: $calc-color-btn-hover;
          .calc__radio-text {
            color: $calc-color-btn-text-hover;
          }
        }
        .calc__radio-label.checked:hover {
          box-shadow: 0 0 3px 1px $calc-color-btn-checked;
          background-color: $calc-color-btn;
          .calc__radio-text {
            color: $calc-color-btn-text;
          }
        }
      }

      &.buttons {
        .calc__radio-label {
          &:hover {
            background-color: $calc-color-btn-hover;
            .calc__radio-text {
              color: $calc-color-btn-text-hover;
            }
          }
          &.checked {
            background-color: $calc-color-btn-checked;
            color: $calc-color-btn-checked-text;
            &:hover {
              box-shadow: 0 0 3px 1px $calc-color-btn-checked;
            }
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
      border-bottom: 1px solid $calc-color-btn;
      padding: 5px 10px;
      position: relative;
      &:hover {
        @include style-button-hover;
      }
      &.checked {
        .calc__radio-indicator {
          box-shadow: 0 0 1px 3px $calc-color-more inset;
          &::after {
            content: "";
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            border-radius: 50%;
            width: 8px;
            height: 8px;
            background-color: $calc-color-btn-checked;
          }
          +.calc__radio-text {
            color: $calc-color-btn-text;
          }

        }
        .calc__radio-text {
          color: $calc-color-btn-checked-text;
        }
      }
      &::after {
        content: "";
        display: block;
        left: 0;
        width: 100%;
        position: absolute;
        background-color: $calc-color-btn-text;
        height: 1px;
        bottom: 1px;
      }
    }
    &-text {
      display: flex;
      color: $calc-color-btn-text;
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
        &:hover {
          @include style-button-hover;
        }
      }
    }

    &-element {
      position: relative;
      margin: 5px;
      height: 30px;

      &.base {
        width: 30px;
        &:after {
          display: none;
        }
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
        transform: translateY(-50%);
        border-width: 2px;
        border-color:$calc-color-btn;
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
        border-color: $calc-color-btn;
        z-index: 1;
        right: 0;
      }
      &.switcher {
        &:after {
          width: 35px;
          border-right: none;
          background-color: $calc-color-btn;
          border-color: $calc-color-btn;
          border-style:solid;
          box-shadow: 0 0 0 2px $calc-color-more inset;
          border-right-width: 2px;
          border-bottom-right-radius: 0;
          border-top-right-radius: 0;
          z-index: 1;
          left: 0;
        }
        &:hover:after {
          background-color: $calc-color-btn-hover;
          border-color: $calc-color-btn-hover;
        }
        &:hover:before {
          border-color: $calc-color-btn-hover;
        }
      }
      &.switcher-vertical:after,
      &.switcher-vertical:before {
        width: 25px;
        height: 35px;
        transform: translateY(0);
      }

      &.switcher-vertical {
        &:before {
          right: auto;
          top: 0;
          border-top-left-radius: $border-radius;
          border-bottom-right-radius: 0;
          background-color: $calc-color-btn;
          box-shadow: 0 0 0 2px $calc-color-more inset;
        }
        &:hover:before {
          background-color: $calc-color-btn-hover;
          border-color: $calc-color-btn-hover;
        }
      }
      &.switcher-vertical {
        &:after {
          border-color: $calc-color-btn;
        }
        &:hover:after {
          border-color: $calc-color-btn-hover;
        }
      }

      &:hover {
        &.base:before {
          border-color: $calc-color-btn-hover;
          background-color: $calc-color-btn-hover;
          box-shadow: 0 0 0 2px $calc-color-more inset;
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
          &.base {
            &:before {
              background-color: $calc-color-btn-checked;
              box-shadow: 0 0 0 2px $calc-color-more inset;
            }
            &:hover:before {
              background-color: $calc-color-btn-hover;
            }
          }
          &.switcher-vertical:before,
          &.switcher:after {
            border-color: $calc-color-btn-checked;
            background-color: inherit;
            box-shadow:none;
          }
          &.switcher-vertical:hover:before,
          &.switcher:hover:after {
            border-color: $calc-color-btn-hover;
          }


          &.switcher-vertical:after,
          &.switcher:before {
            background-color: $calc-color-btn-checked;
            border-color: $calc-color-btn-checked;
            box-shadow: 0 0 0 2px $calc-color-more inset;
          }

          &.switcher-vertical:hover:after,
          &.switcher:hover:before {
            background-color: $calc-color-btn-hover;
            border-color: $calc-color-btn-hover;
          }


        }
        ~ .calc__checkbox-text.button {
          background-color: $calc-color-btn-checked;
          color: $calc-color-btn-checked-text;
        }
      }
    }
  }

  //-------всплывающая подсказка ------
  &__prompt {
    &-wrapper {
      margin-left: 5px;
    }

    &-button {
      background-color: #f2f2f2;
      cursor: pointer;
      width: 20px;
      height: 20px;
      @include style-flex-center;
      border: 1px solid $calc-color-btn;
      border-radius: 50%;
      font-weight: 600;
      line-height: 15px;
      &:hover {
        background-color: $calc-color-btn-hover;
        color: $calc-color-btn-text-hover;
      }
    }
  }
  .prompt {
    &-wrapper {
      z-index: 100;
      position: absolute;
      display: flex;
      justify-content: center;
      align-items: center;
      left: 0;
      right: 0;
      overflow: hidden;
      &.prompt-enter-active,
      &.prompt-leave-active {
        transition: all 0.3s ease;
        opacity: 1;
        max-height: 80vh;
        transform: scale(1);
      }

      &.prompt-enter-from,
      &.prompt-leave-to {
        transition: all 0.3s ease;
        opacity: 0;
        max-height: 0;
        transform: scale(0.8);
      }
    }

    &-content {
      background-color: white;
      padding: 30px;
      max-width: 80%;
      overflow-y: auto;
      border: 1px solid $calc-color-btn;
      border-radius: $border-radius;
      box-shadow: 0 0 9px 0 $calc-color-btn;
    }
  }

  // tooltip
  &__tooltip {
    &-wrapper {
      display: flex;
      position: absolute;
      @include style-border;
      border-color: $calc-color-danger;
      z-index: 100;
      padding: 2px;
      box-shadow: 0 0 3px 0 $calc-color-danger;
      bottom: calc(100% + 10px);
      left: 50%;
      transform: translateX(-50%);
      background-color: white;

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
      background-color: white;
      position: absolute;
      border-radius: 4px;
      z-index: -1;
      right: calc(50% - 10px);
      top: calc(100% - 12px);
      transform: translateX(-50%) rotate(45deg);
      border-bottom: 1px solid $calc-color-danger;
      border-right: 1px solid $calc-color-danger;
      display:block;
    }
    &-text {
      display: flex;
      color: $calc-color-danger;
      border-radius: $border-radius;
      justify-content: center;
      min-width: 300px;
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
          .calc__accordion-item-plus:before,
          .calc__accordion-item-minus:before {
            border: 1px solid $calc-color-btn-text;
            color: $calc-color-btn-text;
          }
        }
        &.isOpen {
          background-color: $calc-color-btn-checked;
          color: $calc-color-btn-checked-text;
          .calc__accordion-item-plus:before,
          .calc__accordion-item-minus:before {
            border: 1px solid $calc-color-btn-checked-text;
            color: $calc-color-btn-checked-text;
          }
          &:hover {
            box-shadow: 0 0 3px 1px $calc-color-btn-checked;
          }
        }
        &.isError {
          background-color: $calc-color-danger;
          color: $calc-color-danger-text;
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
        border: 1px solid $calc-color-btn-text;
        color: $calc-color-btn-text;
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
        flex: 0 1 auto;

        &:hover {
          @include style-button-hover;
        }
        &.isOpen {
          background-color: $calc-color-btn-checked;
          color: $calc-color-btn-checked-text;
          &:hover {
            box-shadow: 0 0 3px 1px $calc-color-btn-checked;
          }
        }
        &.isError {
          background-color: $calc-color-danger;
          color: $calc-color-danger-text;
        }
        &-wrapper {
          @include style-flex-start;
          flex: 1 1 auto;
          width: 100%;
          flex-wrap: wrap;
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
      color: $calc-color-text;
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
      color: $calc-color-text;
    }
  }

  .calc__error {
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
      background-color: $calc-color-btn;
      padding: 10px;
      color: $calc-color-btn-text;
      border-radius: $border-radius;
      max-width: 450px;
      max-height: 500px;
      box-shadow: 0 0 2px 2px $calc-color-danger ;
      min-height: 42px;
      min-width: 42px;
      overflow: auto;
      box-sizing: border-box;
      &.isShow {
        display: flex;
      }
    }
    &-label {
      color: $calc-color-danger;
      margin-top: 35px;
    }
    &-item {
      color: $calc-color-btn-text;
      display: flex;
      flex-direction: column;
      margin: 5px 0;
      &-name {
        color: $calc-color-btn-text;
      }
    }
    &-alert {
      color: $calc-color-danger;
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
        height: 100%;
        overflow: hidden;
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
  .resultDataBlock {
    color: $calc-color-text;
    margin: 0 auto;
  }
  &__duplicator {
    width: 100%;
    display: flex;
    flex-direction: column;
  }
}
</style>
