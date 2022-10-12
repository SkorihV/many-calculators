<template>
  <div id="app_stretch_ceiling_calculator">
    <div id="custom-style" class="calc calc__wrapper">
      <div class="calc__wrapper-content content">
        <div class="calc__left-side">
          <div class="calc__wrapper-group-data">
            <div class="calc__wrapper-content_min">
              <ui-select
                label="Тип материала:"
                :selectValues="typeMaterial"
                @changed-value="changeTypeMaterial"
                min-width="200"
              >
                <template #prompt v-if="currentTypeMaterial?.prompt">
                  <ui-prompt :prompt-text="currentTypeMaterial.prompt" />
                </template>
              </ui-select>
              <ui-input
                label="Площадь, м2:"
                :input-value="square"
                @changed-value="changeSquare"
                not-empty
                only-number
                is-column
                controls
                min="0"
                element-name="square"
                @change-valid="changeValid"
              />
            </div>
          </div>
          <div class="calc__wrapper-group-data" v-if="baseOptions.length">
            <div class="calc__wrapper-group-title">Базовые опции опции:</div>
            <div
              class="calc__wrapper-options"
              v-for="(option, idx) in baseOptions"
            >
              <ui-input
                :label="option.label"
                :input-value="option.base_value"
                :min="option.min_value"
                :max="option.max_value"
                :element-name="'baseOption' + idx"
                :unit="option.unit"
                @change-valid="changeValid"
                @changed-value="changeBaseOptions($event, idx)"
                not-empty
                only-number
                only-integer
                is-stretch
                controls
              >
                <template v-if="option?.prompt" #prompt>
                  <ui-prompt :prompt-text="option.prompt" />
                </template>
              </ui-input>
            </div>
          </div>
          <div class="calc__wrapper-group-data" v-if="extraOptions">
            <div class="calc__wrapper-group-title">Дополнительные опции:</div>
            <div class="calc__btn-more-options" @click="toggleOptions">
              Больше настроек
            </div>
            <template v-if="optionsIsOpen">
              <div
                class="calc__wrapper-options"
                v-for="(option, idx) in extraOptions"
              >
                <ui-input
                  :input-value="option.base_value"
                  :min="option.min_value"
                  :max="option.max_value"
                  :element-name="'extraOption' + idx"
                  :label="option.label"
                  :unit="option.unit"
                  min="0"
                  @changed-value="changeExtraOptions($event, idx)"
                  @change-valid="changeValid"
                  not-empty
                  only-number
                  only-integer
                  is-stretch
                  controls
                >
                  <template v-if="option.prompt" #prompt>
                    <ui-prompt :prompt-text="option.prompt" />
                  </template>
                </ui-input>
              </div>
            </template>
          </div>

          <div class="calc__wrapper-group-data" v-if="summ">
            <div class="calc__wrapper-controls">
              <div class="calc__summ">Ваша цена: {{ summ }}</div>
              <div class="calc__restart" @click="reset">Сбросить опции.</div>
            </div>
          </div>
        </div>
        <div class="calc__right-side">
          <div
            class="calc__wrapper-img"
            v-if="currentTypeMaterial?.materialImage?.filename"
          >
            <img
              class="calc__image"
              :src="imageDir + currentTypeMaterial.materialImage.filename"
              :alt="currentTypeMaterial.label"
            />
          </div>
        </div>
      </div>
    </div>
    <teleport to="#teleport-element" v-if="dataForResult.length">
      {{ dataForResult }}
    </teleport>
  </div>
</template>

<script>
import UiSelect from "@/components/UI/UiSelect";
import UiInput from "@/components/UI/UiInput";
import UiPrompt from "@/components/UI/UiPrompt";
import { computed } from "vue";

export default {
  name: "TheStretchCeilingCalculator",
  components: { UiSelect, UiInput, UiPrompt },

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

    this.typeMaterial = this.outData?.type_material
      ? JSON.parse(JSON.stringify(this.outData?.type_material))
      : [];
    this.baseOptions = this.outData?.base_options
      ? JSON.parse(JSON.stringify(this.outData?.base_options))
      : [];
    this.extraOptions = this.outData?.extra_options
      ? JSON.parse(JSON.stringify(this.outData?.extra_options))
      : [];
    this.imageDir = window?.imageDir || "";
  },
  provide() {
    return {
      globalCanBeShownTooltip: computed(() => this.shownAllTooltips),
    };
  },
  data() {
    return {
      imageDir: "",
      outData: {},
      typeMaterial: [],
      extraOptions: [],
      baseOptions: [],
      currentTypeMaterial: null,
      optionsIsOpen: false,
      errorsInputs: new Set(),
      square: 0,
      shownAllTooltips: true,
    };
  },
  methods: {
    changeTypeMaterial({ value }) {
      this.currentTypeMaterial = value;
    },
    toggleOptions() {
      this.optionsIsOpen = !this.optionsIsOpen;
    },
    changeExtraOptions({ value }, idx) {
      this.extraOptions[idx].base_value = value;
    },
    changeBaseOptions({ value }, idx) {
      this.baseOptions[idx].base_value = value;
    },
    changeSquare({ value }) {
      this.square = value;
    },
    changeValid({ isInvalid, name }) {
      if (isInvalid) {
        this.errorsInputs.add(name);
      } else {
        if (this.errorsInputs.has(name)) this.errorsInputs.delete(name);
      }
    },
    getOptionsTemplateForResult(option) {
      return (
        option.title +
        " - количество " +
        option.base_value +
        " - по цене " +
        option.cost +
        " за единицу \n"
      );
    },
    reset() {
      this.square = 0;

      if (this.baseOptions.length) {
        for (let i = 0; i < this.baseOptions.length; i++) {
          this.baseOptions[i].base_value =
            this.outData.base_options[i].base_value;
        }
      }

      if (this.extraOptions.length) {
        for (let i = 0; i < this.extraOptions.length; i++) {
          this.extraOptions[i].base_value =
            this.outData.extra_options[i].base_value;
        }
      }
    },
  },
  computed: {
    summ() {
      if (!parseFloat(this.square) || this.currentTypeMaterial === null) {
        return 0;
      }
      return (
        this.currentTypeMaterial.cost * this.square +
        this.baseOptions.reduce(
          (acc, item) => acc + item.base_value * item.cost,
          0
        ) +
        this.extraOptions.reduce(
          (acc, item) => acc + item.base_value * item.cost,
          0
        )
      );
    },
    dataForResult() {
      if (
        !this.summ ||
        this.errorsInputs.size ||
        this.currentTypeMaterial === null
      ) {
        return "";
      }
      let dataExtraOptions = "";
      let dataBaseOptions = "";

      if (this.baseOptions) {
        dataBaseOptions += "\n Базовые опции: \n";
        this.baseOptions.forEach((item) => {
          if (item.base_value > 0) {
            dataExtraOptions += this.getOptionsTemplateForResult(item);
          }
        });
      }

      if (this.extraOptions) {
        dataExtraOptions += "\n Дополнительные опции: \n";
        this.extraOptions.forEach((item) => {
          if (item.base_value > 0) {
            dataExtraOptions += this.getOptionsTemplateForResult(item);
          }
        });
      }

      return (
        "Общая сумма: " +
        this.summ +
        "\n Площадь: " +
        this.square +
        "\n Тип материала: " +
        this.currentTypeMaterial.selectName +
        "\n Стоимость материала: " +
        this.currentTypeMaterial.cost +
        dataBaseOptions +
        dataExtraOptions
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

#app_stretch_ceiling_calculator {
  .calc {
    &__wrapper {
      background-color: $color-gray-light;
      @include style-flex-center;
      flex-direction: column;
      align-items: flex-start;
      justify-content: start;
      width: 100%;
      padding: 5px;
      &-content {
        width: 100%;
        @include style-flex-start;
        gap: 5px;
        @media all and (max-width: 650px) {
          flex-direction: column;
          width: 100%;
        }
        &_min {
          @include style-flex-center;
          align-items: flex-end;
          justify-content: space-between;
          width: 100%;

          @media all and (max-width: 550px) {
            flex-direction: column;
            align-items: flex-start;
            width: 100%;
          }
        }
      }
      &-group-data {
        margin-bottom: 20px;
        padding-left: 20px;
        border-left: 3px solid $color-orange-normal;
        display: flex;
        flex-direction: column;
        align-items: start;
        &:hover {
          background-color: $color-gray-middle;
        }
      }
      &-group-title {
        font-size: 16px;
        font-weight: 600;
      }
      &-options {
        @include style-flex-start;
        flex-wrap: wrap;
        width: 100%;
        margin-right: 10px;
        border-bottom: 1px solid $color-gray-middle;
      }
      &-controls {
        @include style-flex-start;
      }
      &-img {
        max-width: 300px;
      }
    }
    &__btn-more-options {
      @include style-flex-center;
      @include style-button;
      padding: 10px;
      margin: 5px;
      flex: 1 1 100%;
      &:hover {
        @include style-button-hover;
      }
    }
    &__left-side {
      display: flex;
      flex: 1 1 100%;
      flex-direction: column;
      @media all and (max-width: 650px) {
        width: 100%;
      }
    }
    &__right-side {
      max-width: 30%;
      flex: 1 1 100%;
      @media all and (max-width: 650px) {
        width: 100%;
        max-width: none;
      }
    }
    &__image {
      @include style-img;
      aspect-ratio: 1/1;
    }
    &__restart,
    &__summ {
      padding: 10px;
      @include style-button;
      flex: 1 1 auto;
      font-size: 20px;
      font-weight: 600;
      margin-right: 30px;
    }
  }
}
</style>
