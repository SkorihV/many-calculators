<template>
  <div class="calc__input-wrapper" :class="{ 'is-stretch': isStretch }">
    <label
      :for="localElementName"
      class="calc__input-label"
      :class="{ 'is-column': isColumn }"
    >
      <div v-if="label" class="calc__input-label-text">
        {{ label }}<slot name="prompt" />
      </div>
      <div class="calc__input-wrapper-data">
        <input
          ref="trueInput"
          :id="localElementName"
          type="text"
          :value="resultValue"
          @input="tryChangeValueInput"
          @keydown.enter="trueTrueValue"
          class="calc__input-item"
          autocomplete="off"
          v-if="!fakeValueHidden"
        />
        <template v-if="isCurrency">
          <input
            @click="showTrueValue"
            type="text"
            :value="resultValueDouble"
            class="calc__input-item currency"
            autocomplete="off"
            v-show="fakeValueHidden"
          />
        </template>
        <div v-if="controls" class="calc__input-buttons-wrapper">
          <div class="calc__input-buttons-plus" @click="plus">+</div>
          <div class="calc__input-buttons-minus" @click="minus">-</div>
        </div>
        <div v-if="unit?.length" class="calc__input-unit">{{ unit }}</div>
      </div>
      <ui-tooltip
        :is-show="tooltipError.error"
        :tooltip-text="tooltipError.errorText"
      />
    </label>
  </div>
</template>

<script>
import UiTooltip from "@/components/UI/UiTooltip";

export default {
  name: "UiInput",
  emits: ["changedValue", "changeValid"],
  components: { UiTooltip },
  props: {
    //данные для инпута
    inputValue: {
      type: [Number, String],
      default: null,
    },
    // имя необходимое для корректной работы Label
    elementName: {
      type: String,
      default: null,
    },
    //заголовок
    label: {
      type: String,
      default: null,
    },
    // единицы измерения
    unit: {
      type: String,
    },
    cost: {
      type: [Number, String],
      default: null,
      validator(value) {
        return !isNaN(Number(value));
      },
    },
    // максимальное значение в инпуте
    max: {
      type: [Number, String],
      default: null,
      validator(value) {
        return !isNaN(Number(value));
      },
    },
    // минимальное значение в инпуте
    min: {
      type: [Number, String],
      default: null,
      validator(value) {
        return !isNaN(Number(value));
      },
    },
    // инпут не может быть пустым
    notEmpty: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    },
    // только числа
    onlyNumber: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    },
    // только целые числа
    onlyInteger: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    },
    // отобразить элементы управления
    controls: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    },
    // шаг при нажатии на + / -
    step: {
      type: [Number, String],
      default: 1,
      validator(value) {
        return !isNaN(Number(value));
      },
    },
    //разделять сотни пробелами
    isCurrency: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    },
    // отображать заголовок и инпут в колонку
    isColumn: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    },
    // растягивать обертку по ширине
    isStretch: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    },
    // шаблон rex для ручной валидации

    customErrorPattern: {
      type: RegExp,
      default: null,
    },
    //текст для ошибки созданной в ручную
    customErrorText: {
      type: String,
    },
  },
  mounted() {
    this.localMax = this.checkedValueOnVoid(this.max) ? Number(this.max) : null;
    this.localMin = this.checkedValueOnVoid(this.min)  ? Number(this.min) : null;
    this.localStep = this.checkedValueOnVoid(this.step) ? Number(this.step) : 1;
    this.localElementName =  this.checkedValueOnVoid(this.elementName) ? this.elementName : Math.random().toString()
    if (!isNaN(parseFloat(this.localMin)) && this.localMin > this.inputValue) {
      this.currentInputValue = this.localMin;
      this.changeValue();
    } else {
      this.currentInputValue = this.inputValue;
      this.changeValue();
    }

    if (this.isCurrency) {
      window.addEventListener("click", (e) => {
        if (
          !this.$el.contains(e.target) &&
          !e.target.classList.contains("calc__input-item")
        ) {
          this.fakeValueHidden = true;
        }
      });
    }
  },
  data() {
    return {
      currentInputValue: null,
      nameTimer: null,
      fakeValueHidden: this.isCurrency,
      isInvalid: false,
      localMax: null,
      localMin: null,
      localStep: 1,
      localElementName: null
    };
  },
  methods: {
    checkedValueOnVoid(value) {
     return value?.length !== 0 && value !== undefined && value !== null;
    },
    resultWitchNumberValid() {
      try {
        this.clearTimer();
        if (this.isErrorNumber) {
          this.changeValueWitchTimer(this.localMin || 0);
          return null;
        }
        if ( this.isErrorMin) {
          this.changeValueWitchTimer(this.localMin || 0);
        }

        if (this.isErrorMax) {
          this.changeValueWitchTimer(this.localMax);
        }

        if (
          this.currentInputValue?.toString().slice(-1) === "." ||
          this.currentInputValue?.toString().slice(0) === "-"
        ) {
          return this.currentInputValue;
        }

        this.currentInputValue = parseFloat(this.currentInputValue)
        if (this.valueIsNaN) {
          this.currentInputValue = "";
        }

        if (this.onlyInteger) {
          this.currentInputValue = !isNaN(parseInt(this.currentInputValue))
            ? parseInt(this.currentInputValue)
            : null;
        }

        return this.currentInputValue;
      } catch (e) {
        console.error(e.message);
      }
    },
    tryChangeValueInput(e) {
      this.currentInputValue = e.target.value;
      this.changeValue();
    },
    changeValue() {
      this.$emit("changedValue", {
        value: this.resultValue,
        name: this.localElementName,
        type: "input",
        cost: this.cost,
        label: this.label,
      });
      this.checkValid();
    },
    changeValueWitchTimer(value) {
      this.nameTimer = setTimeout(() => {
        this.currentInputValue = value;
        this.changeValue();
      }, 1500);
    },
    clearTimer() {
      if (this.nameTimer) clearTimeout(this.nameTimer);
    },
    /**
     * возвращает общее состояние не валидности инпута
     */
    checkValid() {
      this.$nextTick(() => {
        this.isInvalid = [
          this.isErrorMin,
          this.isErrorMax,
          this.isErrorEmpty,
          this.isErrorNumber,
          this.isErrorCustom,
        ].some((item) => item);
        this.$emit("changeValid", {
          isInvalid: this.isInvalid,
          name: this.localElementName,
          type: "input",
          label: this.label
        });
      });
    },
    /**
     * при включенной обработки сотых отображает инпут с настоящим значением при фокусе
     */
    showTrueValue() {
      if (this.isCurrency) {
        this.fakeValueHidden = false;
        this.$nextTick(() => {
          this.$refs.trueInput.focus();
        });
      }
    },
    trueTrueValue() {
      if (this.isCurrency) {
        this.fakeValueHidden = true;
      }
    },
    plus() {
      let value = this.currentInputValue + this.localStep;
      if (this.checkedValueOnVoid(this.localMax)) {
        value = value <= this.localMax ? value : this.localMax;
      }
      this.currentInputValue = value;
      this.changeValue();
    },
    minus() {
      let value = this.currentInputValue - this.localStep;
      if (this.checkedValueOnVoid(this.localMin)) {
        value = value >= this.localMin ? value : this.localMin;
      }
      this.currentInputValue = value;
      this.changeValue();
    },
  },
  watch: {
    /**
     * после изменения содержимого инпута происходит общая проверка валидности
     *
     */
    inputValue(newValue) {
      this.currentInputValue = newValue;
      this.checkValid();
    },
  },
  computed: {
    resultValue() {
      if (this.onlyNumber) {
        return this.resultWitchNumberValid();
      } else {
        return this.currentInputValue;
      }
    },
    resultValueDouble() {
      return parseFloat(this.currentInputValue).toLocaleString("ru");
    },
    valueIsNaN() {
      return isNaN(parseFloat(this.currentInputValue));
    },
    isErrorNumber() {
      return (
        (this.onlyNumber || this.localMax !== null || this.localMin !== null) &&
        isNaN(Number(this.currentInputValue))
      );
    },
    errorNumberText() {
      return this.isErrorNumber ? "Только числа!" : null;
    },
    isErrorEmpty() {
      return this.notEmpty && !this.currentInputValue?.toString().length;
    },
    errorEmptyText() {
      return this.isErrorEmpty ? "Заполните поле!" : null;
    },
    isErrorMax() {
      return (
        !this.valueIsNaN &&
        this.localMax !== null &&
        parseFloat(this.currentInputValue) > parseFloat(this.localMax)
      );
    },
    errorMaxText() {
      return this.localMax !== null &&
        !this.valueIsNaN &&
        parseFloat(this.currentInputValue) > parseFloat(this.localMax)
        ? `Максимальное значение ${this.localMax}`
        : null;
    },

    isErrorMin() {
      return (
        !this.valueIsNaN &&
        this.localMin !== null &&
        parseFloat(this.currentInputValue) < parseFloat(this.localMin)
      );
    },
    errorMinText() {
      return this.localMin !== null &&
        !this.valueIsNaN &&
        parseFloat(this.currentInputValue) < parseFloat(this.localMin)
        ? `Минимальное значение ${this.localMin}`
        : null;
    },
    isErrorCustom() {
      return this.customErrorPattern
        ? this.currentInputValue?.toString().search(this.customErrorPattern) < 0
        : false;
    },
    customErrorTextOut() {
      return this.isErrorCustom ? this.customErrorText : "";
    },
    tooltipError() {
      if (this.isErrorNumber) {
        return { error: this.isErrorNumber, errorText: this.errorNumberText };
      } else if (this.isErrorMax) {
        return { error: this.isErrorMax, errorText: this.errorMaxText };
      } else if (this.isErrorMin) {
        return { error: this.isErrorMin, errorText: this.errorMinText };
      } else if (this.isErrorCustom) {
        return {
          error: this.isErrorCustom,
          errorText: this.customErrorTextOut,
        };
      } else if (this.isErrorEmpty) {
        return { error: this.isErrorEmpty, errorText: this.errorEmptyText };
      } else {
        return false;
      }
    },
  },
};
</script>

<style scoped></style>
