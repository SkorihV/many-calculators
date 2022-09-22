<template>
  <div id="app_stretch_ceiling_calculator">
    <div class="calc calc__wrapper">
      <div class="calc__wrapper-content content">
        <div class="content__left-side">
          <div class="calc__wrapper-common-data">
            <div class="calc__wrapper-content_min">
              <ui-select :options="typeMaterial" @selected-value="changeTypeMaterial" />
              <ui-input
                only-number
                not-empty
              />
            </div>
          </div>
        </div>
        <div class="content__right-side">

        </div>
      </div>
    </div>
    {{currentTypeMaterial}}
  </div>
</template>

<script>
import UiSelect from "@/components/UI/UiSelect";
import UiInput from "@/components/UI/UiInput";

export default {
  name: "TheStretchCeilingCalculator",
  components: {UiSelect, UiInput},

  async mounted() {
    const isGlobal = window.location.hostname !== "localhost";
    const localPath = "http://localhost:3000/stretch-ceiling-calculator";
    if (!isGlobal) {
      await fetch(localPath)
        .then((response) => response.json())
        .then((data) => {
          this.outData = data;
        });
    } else {
      this.outData = window?.dataCalculator;
    }

    this.typeMaterial = this.outData?.type_material ? this.outData?.type_material : [];
    this.extraElement = this.outData?.extra_element ? this.outData?.extra_element : [];

  },
  data() {
    return {
      outData: {},
      typeMaterial: [],
      extraElement: [],
      currentTypeMaterial: null
    };
  },
  methods: {
    changeTypeMaterial(material) {
      console.log(material);
      this.currentTypeMaterial = material;
    }
  }
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
  &__wrapper {
    background-color: $color-gray-light;
    @include style-flex-center;
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
    padding: 5px;
    &-content {
      width: 100%;
      &_min {
        @include style-flex-center;
        align-items: flex-end;
      }
    }
    &-common-data {
      margin-bottom: 20px;
      padding-left: 20px;
      border-left: 3px solid $color-orange-normal;
    }
  }
}
</style>
