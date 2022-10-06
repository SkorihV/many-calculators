<template>
  <h1>Расчет фундамента</h1>
  <div id="app-base-calculator">
    <div id="custom-style" class="calc calc__wrapper">
      <div class="calc__wrapper-left-side">
        <div class="calc__wrapper-group-data">
          <ui-radio
            :radio-values="buildingData?.buildingTypes"
            @changed-value="changeCurrentType"
            :label="buildingData?.label"
            type-button
            element-name="buildersType"
            is-wrap
            is-solid
          >
            <template #prompt
              ><ui-prompt
                prompt-text="какая-то подсказка какая-то подсказка какая-то подсказка какая-то подсказка"
            /></template>
          </ui-radio>
        </div>

        <div class="calc__wrapper-group-data">
          <ui-range
            :range-value="long?.base_value"
            :label="long?.label"
            :step="long?.step"
            :min="long?.min"
            :max="long?.max"
            :step-prompt="long?.step"
            @changed-value="changeRangeLong"
            show-static-value
            show-steps
          >
            <template #prompt>
              <ui-prompt :prompt-text="long.prompt" />
            </template>
          </ui-range>
        </div>
        <div class="calc__wrapper-group-data">
          <ui-range
            :range-value="width?.base_value"
            :label="width?.label"
            :step="width?.step"
            :min="width?.min"
            :max="width?.max"
            :step-prompt="width?.step"
            @changed-value="changeRangeWidth"
            show-static-value
            show-steps
          >
            <template #prompt>
              <ui-prompt :prompt-text="width?.prompt" />
            </template>
          </ui-range>
        </div>

        <div class="calc__wrapper-group-data">
          <ui-radio
            :label="materialsSide?.label"
            :radio-values="materialsSide?.materials"
            @changed-value="changeCurrentMaterial"
            is-solid
            type-button
          >
            <template #prompt>
              <ui-prompt :prompt-text="materialsSide?.prompt" />
            </template>
          </ui-radio>
        </div>
      </div>

      <div class="calc__wrapper-right-side">
        <div class="calc__wrapper-group-data">
          <ui-range
            :range-value="floors?.base_value"
            :min="floors?.min"
            :max="floors?.max"
            :label="floors?.label"
            @changed-value="changeFloor"
            show-static-value
            show-steps
          >
            <template #prompt>
              <ui-prompt :prompt-text="floors?.prompt" />
            </template>
          </ui-range>
        </div>
        <div class="calc__wrapper-group-data" v-if="attic?.on">
          <ui-checkbox
            :checkbox-value="attic?.value"
            :label="attic?.label"
            @changed-value="changeAttic"
            type-button
          >
            <template #prompt>
              <ui-prompt :prompt-text="attic?.prompt" />
            </template>
          </ui-checkbox>
        </div>
      </div>
    </div>
    <teleport to="#teleport-element">
      {{ resultData }}
    </teleport>
  </div>
</template>

<script>
import UiRadio from "@/components/UI/UiRadio";
import UiPrompt from "@/components/UI/UiPrompt";
import UiRange from "@/components/UI/UiRange";
import UiCheckbox from "@/components/UI/UiCheckbox";

export default {
  name: "TheBaseCalculator",
  components: { UiRadio, UiPrompt, UiRange, UiCheckbox },
  async mounted() {
    const isGlobal = window.location.hostname !== "localhost";
    const localPath = "http://localhost:3000/base-calculator";
    if (!isGlobal) {
      await fetch(localPath)
        .then((response) => response.json())
        .then((data) => {
          this.outData = data;
        });
    } else {
      this.outData = window?.dataCalculator;
    }
    this.buildingData = this.outData?.building_data
      ? this.outData.building_data
      : {};
    this.long = this.outData?.long_data ? this.outData.long_data : {};
    this.width = this.outData?.width_data ? this.outData.width_data : {};
    this.materialsSide = this.outData?.materials_side
      ? this.outData.materials_side
      : {};
    this.floors = this.outData?.floors ? this.outData.floors : {};
    this.attic = this.outData?.attic ? this.outData.attic : {};
    this.attic.value = false;
  },
  data() {
    return {
      outData: {},
      buildingData: {},
      long: {},
      width: {},
      materialsSide: {},
      floors: {},
      attic: {},
      currentType: null,
      currentMaterial: null,
      currentFloor: null,
    };
  },
  methods: {
    changeCurrentType({ value }) {
      this.currentType = value;
    },
    changeCurrentMaterial({ value }) {
      this.currentMaterial = value;
    },
    changeRangeLong({ value }) {
      this.long.base_value = value;
    },
    changeRangeWidth({ value }) {
      this.width.base_value = value;
    },
    changeFloor({ value }) {
      this.floors.base_value = value;
    },
    changeAttic({ value }) {
      this.attic.value = value;
    },
  },
  computed: {
    resultData() {
      let resultData = "";

      if (this.currentType) {
        resultData +=
          this.buildingData?.label + " - " + this.currentType.radioName + "\n";
      }
      if (Object.keys(this.long).length) {
        resultData += this.long?.label + " - " + this.long.base_value + "\n";
      }

      if (Object.keys(this.width).length) {
        resultData += this.width?.label + " - " + this.width.base_value + "\n";
      }

      if (this.currentMaterial) {
        resultData +=
          this.materialsSide?.label +
          " - " +
          this.currentMaterial.radioName +
          "\n";
      }

      if (Object.keys(this.floors).length) {
        resultData +=
          this.floors?.label + " - " + this.floors.base_value + "\n";
      }

      if (this.attic?.on) {
        resultData += this.attic.label + " - ";
        resultData += this.attic.value ? "Включена" : "Не включена";
      }
      return resultData;
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

#app-base-calculator {
  .calc {
    &__wrapper {
      display: flex;
      gap: 10px;
      width: 100%;

      @media all and (max-width: 760px) {
        flex-direction: column;
      }

      &-left-side {
        display: flex;
        flex-direction: column;
        flex: 2 1 auto;
      }

      &-right-side {
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
      }

      &-group-data {
        margin-bottom: 20px;
        padding-left: 20px;
        border-left: 3px solid $color-orange-normal;
        display: flex;
        width: 100%;
        &:hover {
          background-color: $color-gray-middle;
        }
      }
    }
  }
}
</style>
