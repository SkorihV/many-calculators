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
  data() {},
  computed: {
    routes() {
      return this.$router.getRoutes();
    },
  },
};
</script>

<style lang="scss">
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

//normal orange - FF7044
//normal dark- 464657
//hover orange - FF5D2B
//hover dark- 5A5A70
//font - 00000
//серый - CCCCCC
// border - E6E6E6 -
// background - F2F2F2

* {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: 0;
}

.main-wrapper {
  max-width: 980px;
  margin: 0 auto;
  background-color: $color-gray-dark;
  min-height: 100vh;
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
  * {
    margin: 0;
    font-size: 15px;
    text-align: center;
    color: $color-font-dark;
    font-family: Arial, Helvetica, sans-serif;
    box-sizing: border-box;
  }
  //--------Стили input text-----
  &__input {
    &-wrapper {
      @include style-flex-center;
      flex-direction: column;
      margin: 5px;
      position: relative;
      flex: 1 1 auto;
      padding-bottom: 15px;
    }

    &-label {
      @include style-flex-center;
      width: 100%;
      justify-content: space-between;
      &-text {
        flex: 1 0 auto;
        margin-right: auto;
        display: flex;
        justify-content: flex-start;
        text-transform: uppercase;
      }
    }

    &-item {
      font-size: 15px;
      line-height: 16px;
      padding: 10px;
      max-width: 100px;
      @include style-border;
      &:hover,
      &:focus-visible {
        @include style-border-hover;
        outline: none;
      }
    }
    &-unit {
      margin-left: 5px;
    }
    &-error {
      font-size: 10px;
      color: $color-danger;
      font-weight: 600;
      position: absolute;
      bottom: 0;
    }
  }
  //--------Стили input range-----

  &__range {
    &-wrapper {
      background-color: $color-gray-middle;
      display: flex;
      flex-direction: column;
      width: 100%;
      margin: 5px 0;
    }

    &-item {
      -webkit-appearance: none;
      width: 100%;
      height: 15px;
      border-radius: 5px;
      background: #d3d3d3;
      outline: none;
      opacity: 0.7;
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
      }
      &-item {
        flex: 1 1 auto;
        position: relative;
        cursor: pointer;
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
            background-color: $color-dark-normal;
            color: $color-gray-light;
          }
        }
      }
    }
  }

  //---------Стили select-----

  &__select {
    &-wrapper {
      @include style-flex-center;
      max-width: 100px;
      width: 100%;
      gap: 5px;
      padding-bottom: 15px;
      &.is-column {
        flex-direction: column;
      }
    }
    &-change {
      &-wrapper {
        cursor: pointer;
        @include style-border;
        font-size: 15px;
        line-height: 16px;
        background-color: white;
        position: relative;
      }

      &-item {
        position: relative;
        padding: 10px 25px 10px 20px;
        &:before {
          content: "";
          width: 7px;
          height: 7px;
          border: solid $color-dark-normal;
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

    &-option {
      &-wrapper {
        display: flex;
        flex-direction: column;
        position: absolute;
        width: 100%;
        left: 0;
        top: 100%;
        @include style-border;
      }
      &-item {
        background-color: white;
        padding: 10px;
        &:hover {
          background-color: $color-gray-middle;
        }
      }
    }
  }

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
    }

    &-textarea {
      width: 100%;
      height: 100px;
      margin-bottom: 10px;
      outline: none;
    }

    &-submit {
      cursor: pointer;
      @include style-button;
      padding: 10px;
      @include style-flex-center;
    }
  }
}
</style>
