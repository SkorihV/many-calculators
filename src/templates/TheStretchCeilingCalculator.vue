<template>
  <div id="app_stretch_ceiling_calculator">
    <div id="custom-style" class="calc calc__wrapper">
      <div class="calc__wrapper-content content">
        <div class="calc__left-side">
          <div class="calc__wrapper-common-data">
            <div class="calc__wrapper-content_min">
              <ui-select
                label="Тип материала:"
                :options="typeMaterial"
                @selected-value="changeTypeMaterial"
                is-column
              >
                <template #prompt v-if="currentTypeMaterial?.prompt">
                  <ui-prompt>
                    {{ currentTypeMaterial.prompt }}
                  </ui-prompt>
                </template>
              </ui-select>
              <ui-input
                label="Площадь, м2:"
                :input-value="square"
                @change-value="changeSquare"
                only-number
                not-empty
                type-number
                is-column
                min="0"
                @change-valid="changeValid($event, 'square')"
              />

              <div class="calc__btn-more-options" @click="toggleOptions">
                Больше настроек
              </div>
            </div>
          </div>

          <div class="calc__wrapper-common-data" v-if="optionsIsOpen">
            <div class="calc__wrapper-options">
              <ui-input
                v-for="(option, idx) in extraOptions"
                @change-value="changeExtraOptions($event, idx)"
                @change-valid="changeValid($event, 'option' + idx)"
                only-number
                min="0"
                :label="option.title"
                :input-value="option.base_value"
                type-number
                is-integer
                is-stretch
              >
                <template v-if="option.prompt" #prompt>
                  <ui-prompt>
                    {{ option.prompt }}
                  </ui-prompt>
                </template></ui-input
              >
            </div>
          </div>

          <div
            class="calc__wrapper-common-data"
            v-if="summ && !errorsInputs.size"
          >
            <div class="calc__summ">Ваша цена: {{ summ }}</div>
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
              :alt="currentTypeMaterial.title"
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
      ? this.outData?.type_material
      : [];
    this.extraOptions = this.outData?.extra_options
      ? this.outData?.extra_options
      : [];
    this.imageDir = window?.imageDir || "";
  },
  data() {
    return {
      imageDir: "",
      outData: {},
      typeMaterial: [],
      extraOptions: [],
      currentTypeMaterial: null,
      optionsIsOpen: false,
      errorsInputs: new Set(),
      square: 0,
    };
  },
  methods: {
    changeTypeMaterial(material) {
      this.currentTypeMaterial = material;
    },
    toggleOptions() {
      this.optionsIsOpen = !this.optionsIsOpen;
    },
    changeExtraOptions(value, idx) {
      this.extraOptions[idx].base_value = value;
    },
    changeSquare(value) {
      this.square = value;
    },
    changeValid(dateValid, targetValid) {
      if (dateValid) {
        this.errorsInputs.add(targetValid);
      } else {
        if (this.errorsInputs.has(targetValid))
          this.errorsInputs.delete(targetValid);
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

      if (this.extraOptions) {
        this.extraOptions.forEach(
          (item) =>
            (dataExtraOptions +=
              item.title +
              " - количество " +
              item.base_value +
              " - по цене " +
              item.cost +
              " за единицу \n")
        );
      }

      return (
        "Общая сумма: " +
        this.summ +
        "\n Площадь: " +
        this.square +
        "\n Тип материала: " +
        this.currentTypeMaterial.title +
        "\n Стоимость материала:" + this.currentTypeMaterial.cost  +
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
      width: 100%;
      padding: 5px;
      &-content {
        width: 100%;
        @include style-flex-center;
        @media all and (max-width: 650px) {
          flex-direction: column;
          width: 100%;
        }
        &_min {
          @include style-flex-center;
          align-items: flex-end;
          @media all and (max-width: 550px) {
            flex-direction: column;
            align-items: flex-start;
            width: 100%;
          }
        }
      }
      &-common-data {
        margin-bottom: 20px;
        padding-left: 20px;
        border-left: 3px solid $color-orange-normal;
        width: 100%;
      }
      &-options {
        @include style-flex-start;
        flex-wrap: wrap;
        .calc__input-wrapper {
          max-width: calc(50% - 20px);
          width: 100%;
          @media all and (max-width: 980px) {
            max-width: 80%;
          }
        }

        @media all and (max-width: 980px) {
          flex-direction: column;
          align-items: flex-start;
        }
      }
      &-img {
        max-width: 300px;
      }
    }
    &__btn-more-options {
      @include style-flex-center;
      @include style-button;
      padding: 10px 5px;
      margin: 5px;
      flex: 1 1 100%;
      cursor: pointer;
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
    &__summ {
      padding: 5px;
      background-color: $color-dark-normal;
      color: $color-white;
      @include style-flex-start;
      flex: 1 1 auto;
      font-size: 20px;
      font-weight: 600;
      margin-right: 30px;
    }
  }
}
</style>
