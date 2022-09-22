<template>
<div class="calc__prompt-wrapper">
  <div class="calc__prompt-button">&#63;</div>
  <div class="calc__prompt-popup">
    <slot></slot>
  </div>
</div>
</template>

<script>
export default {
  name: "UiPrompt"
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
  &__prompt {
    &-wrapper {
      position: relative;
    }

    &-button {
      background-color: $color-gray-light;
      cursor: pointer;
      padding: 5px;
      width: 10px;
      height: 10px;
      @include style-flex-center;
      border: 1px solid $color-dark-normal;
      border-radius: 50%;
      font-weight: 600;
      &:hover {
        background-color: $color-dark-normal;
        color: $color-white;
        + .calc__prompt-popup {
          display: block;
          opacity: 1;
        }
      }
    }
    &-popup {
      background-color: $color-gray-light;
      position: absolute;
      display: none;
      left: calc(0px + 20px);
      top: calc(0px + 10px);
      max-width: 300px;
      padding: 15px;
      border: 1px solid $color-dark-normal;
      border-radius: $border-radius;

      transition-property: opacity;
      transition-duration: 5s;
      transition-timing-function: linear;
      transition-delay: 5s;

      &:hover {
        display: block;
      }
    }
  }
}

</style>
