<template>
  <div id="app-cleaning-calculator" v-cloak>
    <div id="custom-style" class="calc calc__wrapper" v-if="isData">
      <div class="calc__title">Выберите объект работы:</div>
      <div class="calc__accordion-wrapper" v-for="work in object_works">
        <div
          class="calc__accordion-title"
          @click="accordions[work.id].show = !accordions[work.id].show"
        >
          <div class="calc__accordion-plus" v-if="!accordions[work.id].show">
            +
          </div>
          <div class="calc__accordion-minus" v-if="accordions[work.id].show">
            -
          </div>
          {{ work.label }}<ui-prompt :prompt-text="work.prompt"></ui-prompt>
        </div>
        <div class="calc__accordion-content" v-if="accordions[work.id].show">
          <div
            class="calc__group-wrapper"
            v-for="(type, idx) in work.types_works"
          >
            <ui-input
              :label="type.label"
              :input-value="type.base_value"
              :element-name="work.id + idx"
              @changed-value="changeValue($event, work.id, idx)"
              @change-valid="changeValid($event, work.id, idx)"
              min="0"
              :unit="type.unit"
              not-empty
              only-number
              only-integer
              controls
            >
              <template #prompt v-if="type.prompt">
                <ui-prompt :prompt-text="type.prompt" />
              </template>
            </ui-input>
          </div>
          <div
            class="calc__accordion-result"
            v-if="accordions[work.id].summ > 0"
          >
            Сумма работ по объекту: {{ accordions[work.id].summ }}
            {{ currency }}
          </div>
        </div>
      </div>
      <div class="calc__result-wrapper" v-if="resultSumm">
        <div class="calc__result-data">
          Общая сумма: {{ resultSumm }} {{ currency }}
        </div>
        <div class="calc__result-reset" @click="reset">Сбросить!</div>
      </div>
      <teleport to="#teleport-element" v-if="resultSumm">
        {{ resultData }}
      </teleport>
    </div>
  </div>
</template>

<script>
import UiInput from "@/components/UI/UiInput";
import UiPrompt from "@/components/UI/UiPrompt";

export default {
  name: "TheCleaningCalculator",
  components: { UiInput, UiPrompt },
  async mounted() {
    const isGlobal = window.location.hostname !== "localhost";
    const localPath = "http://localhost:3000/cleaning-calculator";
    if (!isGlobal) {
      await fetch(localPath)
        .then((response) => response.json())
        .then((data) => {
          this.outData = data;
        });
    } else {
      this.outData = window?.dataCalculator;
    }

    this.currency = this.outData?.currency ? this.outData.currency : "руб.";
    this.object_works = this.outData?.object_works
      ? this.outData.object_works
      : {};

    Object.values(this.object_works).forEach((work, idx) => {
      work.id = "work_" + idx;
      this.accordions["work_" + idx] = {};
      this.accordions["work_" + idx]["show"] = false;
      this.accordions["work_" + idx]["summ"] = 0;
    });
  },
  data() {
    return {
      outData: {},
      currency: "руб.",
      object_works: {},
      accordions: {},
      errorsInputs: new Set(),
    };
  },
  methods: {
    changeValue({ value: data }, workId, idx) {
      this.object_works.forEach((obj) => {
        if (obj.id === workId) {
          obj.types_works[idx].base_value = data;
        }
      });
      this.calculateSumm();
    },
    changeValid(dateValid, workId, idx) {
      if (dateValid) {
        this.errorsInputs.add(workId + "_" + idx);
      } else {
        if (this.errorsInputs.has(workId + "_" + idx))
          this.errorsInputs.delete(workId + "_" + idx);
      }
    },
    calculateSumm() {
      this.object_works.forEach((obj) => {
        this.accordions[obj.id].summ = obj.types_works.reduce((acc, item) => {
          return acc + item.base_value * item.cost;
        }, 0);
      });
    },
    reset() {
      this.object_works.forEach((obj) => {
        obj.types_works.forEach((type) => {
          type.base_value = 0;
        });
      });
      this.calculateSumm();
    },
  },
  computed: {
    isData() {
      return Boolean(Object.keys(this.object_works).length);
    },
    validInputs() {
      return !Boolean(this.errorsInputs.size);
    },
    resultSumm() {
      return Object.values(this.accordions).reduce((acc, item) => {
        return acc + item.summ;
      }, 0);
    },
    resultData() {
      let result = "";
      Object.values(this.object_works).forEach((obj) => {
        if (this.accordions[obj.id].summ) {
          result += "\n" + obj.label + "\n";
          Object.values(obj.types_works).forEach((type) => {
            if (Number(type.base_value) > 0) {
              result +=
                type.label + " -  " + type.base_value + " " + type.unit + " \n";
            }
          });
          result +=
            "\n" + this.accordions[obj.id].summ + " " + this.currency + "\n";
        }
      });
      result +=
        "\n\nОбщая стоимость работ - " +
        this.resultSumm +
        " " +
        this.currency +
        "\n";
      return result;
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

#app-cleaning-calculator {
  margin: 0 auto;
  background-color: $color-gray-light;
  width: 100%;
  padding: 5px;
  box-sizing: border-box;
  * {
    box-sizing: border-box;
  }
}

#app-cleaning-calculator {
  .calc {
    &__title {
      color: $color-dark-normal;
      line-height: 20px;
      font-size: 20px;
      font-weight: bold;
      padding: 10px 0;
    }
    &__wrapper {
      @include style-flex-start;
      align-items: start;
      flex-direction: column;
      width: 100%;
    }
    &__accordion {
      &-wrapper {
        width: 100%;
      }
      &-title {
        @include style-button;
        padding: 10px 40px;
        line-height: 20px;
        font-weight: bold;
        position: relative;
        min-height: 40px;
      }
      &-plus,
      &-minus {
        position: absolute;
        @include style-button;
        font-size: 30px;
        font-weight: bold;
        left: 5px;
        border-radius: 50%;
        line-height: 30px;
        width: 30px;
      }
      &-result {
        margin: 20px 0;
        @include style-flex-center;
        background-color: $color-orange-normal;
        color: $color-white;
        padding: 10px;
      }
    }
    &__group {
      &-wrapper {
        margin-bottom: 20px;
        padding-left: 20px;
        border-left: 3px solid $color-orange-normal;
        &:hover {
          background-color: $color-gray-middle;
        }
      }
    }

    &__result {
      &-wrapper {
        @include style-flex-start;
        line-height: 20px;
        font-size: 20px;
        font-weight: bold;
        padding: 10px 0;
        gap: 20px;
      }
      &-reset {
        @include style-button;
        padding: 10px;
      }
    }
  }
}
</style>
