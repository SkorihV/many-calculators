<template>
<div id="app-apartment-renovation-calculator">
  <div class="calc calc__wrapper" id="custom-stile">
      <div class="calc__wrapper-group-data">
        {{squareData}}
        <ui-range
          :is="squareData.template"
          :label="squareData?.label"
          :min="squareData?.min"
          :max="squareData?.max"
          :range-value="squareData?.value"
          :step="squareData?.step"
          :step-prompt="squareData?.stepPrompt"
          :unit="squareData?.unit"
          :cost="squareData?.cost"
          :prompt="squareData?.prompt"
          :showDynamicValue="squareData?.showDynamicValue"
          :showStaticValue="squareData?.showStaticValue"
          :showSteps="squareData?.showSteps"
          @changedValue="changeValueSquare"
        >
          <template #prompt
          ><ui-prompt
            :prompt-text="squareData.prompt"
          /></template>
        </ui-range>
      </div>

        <div class="calc__wrapper-group-data" v-for="(element, inx) in extraElementsData" :key="inx">
          <component
            :is="element.template"
            :label="element?.label"
            :min="element?.min"
            :max="element?.max"
            :cost="element?.cost"

            :typeDisplayClass="element?.typeDisplayClass"
            :range-value="element?.value"

            :checkbox-value="element?.value"
            :labelSecond="element?.labelSecond"
            :checked="element?.checked"

            :radio-values="element?.values"
            :selected-item:="element?.selectedItem"

            :step="element?.step"
            :step-prompt="element?.stepPrompt"
            :unit="element?.unit"

            :prompt="element?.prompt"
            :showDynamicValue="element?.showDynamicValue"
            :showStaticValue="element?.showStaticValue"
            :showSteps="element?.showSteps"
            @changedValue="changeValue"
          >
            <template v-slot:prompt >
              <ui-prompt :prompt-text="element.prompt"/>
            </template>
          </component>
        </div>
  </div>
  {{resultsExtraElements}}
  <br>
  Результат вычислений: {{resultSumm}}
</div>
</template>

<script>
import UiRange from "@/components/UI/UiRange";
import UiInput from "@/components/UI/UiInput";
import UiSelect from "@/components/UI/UiSelect";
import UiPrompt from "@/components/UI/UiPrompt";
import UiRadio from "@/components/UI/UiRadio";
import UiCheckbox from "@/components/UI/UiCheckbox";

export default {
  name: "TheApartmentRenovationCalculator",
  components: {UiRange, UiInput, UiSelect, UiRadio, UiCheckbox, UiPrompt},
  async mounted() {
    const isGlobal = window.location.hostname !== "localhost";
    const localPath = "http://localhost:3000/apartment-renovation-calculator\n";
    if (!isGlobal) {
      await fetch(localPath)
        .then((response) => response.json())
        .then((data) => {
          this.outData = data;
        });
    } else {
      this.outData.dataCalculatorSquare = window?.dataCalculatorSquare;
      this.outData.dataCalculatorExtra = window?.dataCalculatorExtra;
    }
    this.squareData = this.outData?.dataCalculatorSquare ? this.outData?.dataCalculatorSquare : {};
    this.extraElementsData = this.outData?.dataCalculatorExtra ? this.outData?.dataCalculatorExtra : {};
  },
  data() {
    return {
      outData: {},
      squareData: {},
      extraElementsData: [],
      square: 0,
      resultsExtraElements: {},
    };
  },
  methods: {
    changeValueSquare(data) {
      this.square = data.value;
    },
    changeValue(data) {
      if(data.type === "radio") {
        this.resultsExtraElements[data.name] = {
          type: data.type,
          label: data.label,
          name: data.value.radioName,
          summ: data.value.cost,
       }
      } else if (data.type === "checkbox") {
        this.resultsExtraElements[data.name] = {
          type: data.type,
          label: data.label,
          summ: data.value ? data.cost : 0,
        }

      }
    }
  },
  computed: {
    resultSumm() {
      return this.square * Object.values(this.resultsExtraElements).reduce((sum, item) => {
        return sum + item.summ;
      }, 0)
    }
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

#app-apartment-renovation-calculator {
  .calc {
    &__wrapper {
      &-group-data {
        margin-bottom: 20px;
        padding-left: 20px;
        border-left: 3px solid $color-orange-normal;
        &:hover {
          background-color: $color-gray-middle;
        }
      }
    }
  }
}


</style>
