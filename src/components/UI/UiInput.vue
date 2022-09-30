<template>
  <div class="calc__input-wrapper" :class="{ 'is-stretch': isStretch }">
    <label
      :for="elementName"
      class="calc__input-label"
      :class="{ 'is-column': isColumn }"
    >
      <div v-if="label" class="calc__input-label-text">
        {{ label }}<slot name="prompt" />
        <div class="calc__input-error-wrapper" v-if="isInvalid">

          <div v-if="isErrorNumber" class="max calc__input-error-item">
            {{ errorNumberText }}
          </div>
          <div v-else-if="isErrorMax" class="max calc__input-error-item">
            {{ errorMaxText }}
          </div>
          <div v-else-if="isErrorMin" class="min calc__input-error-item">
            {{ errorMinText }}
          </div>
          <div v-else-if="isErrorCustom" class="min calc__input-error-item">
            {{ customErrorTextOut }}
          </div>
          <div v-else-if="isErrorEmpty" class="empty calc__input-error-item">
            {{ errorEmptyText }}
          </div>
        </div>
      </div>
      <div class="calc__input-wrapper-data">
        <input
          ref="trueInput"
          :id="elementName"
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
    </label>
  </div>
</template>

<script>
export default {
  name: "UiInput",
  emits: ["changedValue", "changeValid"],
  props: {
    //данные для инпута
    inputValue: {
      type: [Number, String],
      default: null,
    },
    // имя необходимое для корректной работы Label
    elementName: {
      type: String,
      default: Math.random().toString(),
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
      type: Number,
      default: null,
    },
    // максимальное значение в инпуте
    max: {
      type: [Number, String],
      default: null,
    },
    // минимальное значение в инпуте
    min: {
      type: [Number, String],
      default: null,
    },
    // инпут не может быть пустым
    notEmpty: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      }
    },
    // только числа
    onlyNumber: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      }
    },
    // только целые числа
    onlyInteger: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      }
    },
    // отобразить элементы управления
    controls: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      }
    },
    // шаг при нажатии на + / -
    step: {
      type: Number,
      default: 1,
    },
    //разделять сотни пробелами
    isCurrency: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      }
    },
    // отображать заголовок и инпут в колонку
    isColumn: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      }
    },
    // растягивать обертку по ширине
    isStretch: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      }
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
    if (this.min && this.min > this.inputValue) {
      this.changeValue(this.min);
      this.currentInputValue = this.min
    } else {
      this.changeValue(this.inputValue);
      this.currentInputValue = this.inputValue;
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
    };
  },
  methods: {
    resultWitchNumberValid() {
      try {

        this.clearTimer();
        if (this.isErrorNumber || this.isErrorMin) {
          console.log(3333);
          this.changeValueWitchTimer(this.min || 0);
        }
        if (this.isErrorMax) {
          this.changeValueWitchTimer(this.max);
        }

        if (this.valueIsNaN) {
          this.currentInputValue = "";
        }

        if (
          this.currentInputValue.toString().slice(-1) === "." ||
          this.currentInputValue.toString().slice(0) === "-"
        ) {
          return this.currentInputValue;
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
      this.changeValue(e.target.value);
    },
    changeValue(value) {
      this.$emit("changedValue", {
        value,
        name: this.elementName,
        type: "input",
        cost: this.cost,
        label: this.label,
      });
      this.checkValid();
    },
    changeValueWitchTimer(value) {
      this.nameTimer = setTimeout(() => {
        this.changeValue(value);
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
        this.$emit("changeValid", this.isInvalid);
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
      let value = parseFloat(this.inputValue) + this.step;
      if (this.max !== null && this.max !== "") {
        value = value <= this.max ? value : this.max;
      }

      this.changeValue(value);
    },
    minus() {
      let value = parseFloat(this.inputValue) - this.step;
      if (this.min !== null && this.min !== "") {
        value = value >= this.min ? value : this.min;
      }
      this.changeValue(value);
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
        (this.onlyNumber || this.max !== null || this.min !== null) &&
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
        this.max !== null &&
        parseFloat(this.currentInputValue) > parseFloat(this.max)
      );
    },
    errorMaxText() {
      return this.max !== null &&
        !this.valueIsNaN &&
        parseFloat(this.currentInputValue) > parseFloat(this.max)
        ? `Максимальное значение ${this.max}`
        : null;
    },

    isErrorMin() {
      return (
        !this.valueIsNaN &&
        this.min !== null &&
        parseFloat(this.currentInputValue) < parseFloat(this.min)
      );
    },
    errorMinText() {
      return this.min !== null &&
        !this.valueIsNaN &&
        parseFloat(this.currentInputValue) < parseFloat(this.min)
        ? `Минимальное значение ${this.min}`
        : null;
    },
    isErrorCustom() {
      return this.customErrorPattern
        ? this.currentInputValue.toString().search(this.customErrorPattern) < 0
        : false;
    },
    customErrorTextOut() {
      return this.isErrorCustom ? this.customErrorText : "";
    },
  },
};
</script>

<style scoped></style>
