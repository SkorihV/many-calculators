<template>
  <div id="app-base-constructor-calculator">
    <div class="calc calc__wrapper" id="custom-stile">
      <div
        class="calc__wrapper-group-data"
        v-for="(template, inx) in calculatorTemplates"
        :key="inx"
      >
        <component
          :is="template.template"
          :label="template?.label"
          :min="template?.min"
          :max="template?.max"
          :cost="template?.cost"
          :prompt="template?.prompt"
          :unit="template?.unit"
          :is-need-choice="template?.isNeedChoice"
          :type-display-class="template?.typeDisplayClass"
          :is-column="template?.isColumn"
          :input-value="template?.value"
          :controls="template?.controls"
          :step="template?.step"
          :is-currency="template?.isCurrency"
          :only-number="template?.onlyNumber"
          :only-integer="template?.onlyInteger"
          :checkbox-value="template?.value"
          :label-second="template?.labelSecond"
          :is-checked="template?.isChecked"
          :radio-values="template?.values"
          :range-value="template?.value"
          :show-dynamic-value="template?.showDynamicValue"
          :show-static-value="template?.showStaticValue"
          :show-steps="template?.showSteps"
          :step-prompt="template?.stepPrompt"
          :select-values="template?.value"
          :selected-item:="template?.selectedItem"
          :not-empty="template?.notEmpty"
          :element-name="template?.elementName"
          @changedValue="changeValue"
          @changeValid="changeValid"
        >
          <template v-slot:prompt>
            <ui-prompt :prompt-text="template.prompt" />
          </template>
        </component>
      </div>
     <div class="calc__wrapper-group-data">
       <ui-input only-number max="100" min="10" input-value="4"/>
     </div>
      <div class="calc__wrapper-group-data">
        <ui-checkbox />
      </div>
      <div class="calc__wrapper-group-data">
        <ui-checkbox type-button label="dasdasda" element-name="234"/>
      </div>
    </div>
  </div>
</template>

<script>
import UiRange from "@/components/UI/UiRange";
import UiInput from "@/components/UI/UiInput";
import UiSelect from "@/components/UI/UiSelect";
import UiRadio from "@/components/UI/UiRadio";
import UiCheckbox from "@/components/UI/UiCheckbox";
import UiPrompt from "@/components/UI/UiPrompt";

export default {
  name: "TheBasicCalculatorConstructor",
  components: { UiRange, UiInput, UiSelect, UiRadio, UiCheckbox, UiPrompt },
  async mounted() {
    const isGlobal = window.location.hostname !== "localhost";
    const localPath = "http://localhost:3000/apartment-renovation-calculator";
    if (!isGlobal) {
      await fetch(localPath)
        .then((response) => response.json())
        .then((data) => {
          this.outData = data;
        });
    } else {
      this.outData.calculatorTemplates = JSON.parse(JSON.stringify(window?.calculatorTemplates));
    }
    this.calculatorTemplates = this.outData?.calculatorTemplates
      ? this.outData?.calculatorTemplates
      : [];
    this.imageDir = window?.imageDir || "";
  },
  data() {
    return {
      outData: {},
      imageDir: "",
      calculatorTemplates: [],
      square: 0,
      resultsExtraElements: {},
    };
  },
  methods: {
    changeValueSquare(data) {
      this.square = data.value;
    },
    changeValue(data) {
      console.log("Данные по событию -  " + data);
      if (data.type === "radio") {
        this.resultsExtraElements[data.name] = {
          type: data.type,
          label: data.label,
          name: data.value.radioName,
          summ: data.value.cost,
        };
      } else if (data.type === "checkbox") {
        this.resultsExtraElements[data.name] = {
          type: data.type,
          label: data.label,
          summ: data.value ? data.cost : 0,
        };
      }
    },
    changeValid(data) {
      console.log("Данные по валидации - " + data);
    }
  },
  computed: {
    resultSumm() {
      return (
        this.square *
        Object.values(this.resultsExtraElements).reduce((sum, item) => {
          return sum + item.summ;
        }, 0)
      );
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

.button {
  @include style-button;
}

.calc__wrapper-group-data {
  margin-bottom: 20px;
  padding-left: 20px;
  border-left: 3px solid $color-orange-normal;
  &:hover {
    background-color: $color-gray-middle;
  }
}

#app-base-constructor-calculator {
  .calc {
    &__wrapper {
    }
  }
}
</style>
