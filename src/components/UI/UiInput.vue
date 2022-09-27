<template>
  <div class="calc__input-wrapper" :class="{ 'is-stretch': isStretch }">
    <label
      :for="idName"
      class="calc__input-label"
      :class="{ 'is-column': isColumn }"
    >
      <div v-if="label" class="calc__input-label-text">
        {{ label }}<slot name="prompt" />
        <div class="calc__input-error-wrapper" v-if="isInvalid">
          <div v-if="isErrorEmpty" class="empty calc__input-error-item">
            {{ errorEmptyText }}
          </div>
          <div v-else-if="isErrorNumber" class="max calc__input-error-item">
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
        </div>
      </div>
      <div class="calc__input-wrapper-data">
        <input
          ref="trueInput"
          :id="idName"
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
  emits: ["changeValue", "changeValid"],
  props: {
    //данные для инпута
    inputValue: {
      type: [Number, String],
      default: null,
    },
    // имя необходимое для корректной работы Label
    idName: {
      type: String,
      default: Math.random().toString(),
    },
    //заголовок
    label: {
      type: String,
    },
    // единицы измерения
    unit: {
      type: String,
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
      type: Boolean,
    },
    // только числа
    onlyNumber: {
      type: Boolean,
    },
    // только целые числа
    onlyInteger: {
      type: Boolean,
    },
    // отобразить элементы управления
    controls: {
      type: Boolean,
    },
    // шаг при нажатии на + / -
    step: {
      type: Number,
      default: 1,
    },
    //разделять сотни пробелами
    isCurrency: {
      type: Boolean,
    },
    // отображать заголовок и инпут в колонку
    isColumn: {
      type: Boolean,
    },
    // растягивать обертку по ширине
    isStretch: {
      type: Boolean,
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
      nameTimer: null,
      fakeValueHidden: this.isCurrency,
      isInvalid: false,
    };
  },
  methods: {
    resultWitchNumberValid() {
      try {
        let currentValue = this.inputValue;
        if (this.valueIsNaN) {
          currentValue = "";
        }
        this.clearTimer();
        if (this.isErrorNumber || this.isErrorMin) {
          this.changeValueWitchTimer(this.min || 0);
        }
        if (this.isErrorMax) {
          this.changeValueWitchTimer(this.max);
        }

        if (
          currentValue.toString().slice(-1) === "." ||
          currentValue.toString().slice(0) === "-"
        ) {
          return currentValue;
        }

        if (this.onlyInteger) {
          currentValue = !isNaN(parseInt(currentValue))
            ? parseInt(currentValue)
            : null;
        }

        return currentValue;
      } catch (e) {
        console.error(e.message);
      }
    },
    tryChangeValueInput(e) {
      this.changeValue(e.target.value);
    },
    changeValue(value) {
      this.$emit("changeValue", value);
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
     */
    inputValue() {
      this.checkValid();
    },
  },
  computed: {
    resultValue() {
      if (this.onlyNumber) {
        return this.resultWitchNumberValid(this.inputValue);
      } else {
        return this.inputValue;
      }
    },
    resultValueDouble() {
      return parseFloat(this.inputValue).toLocaleString("ru");
    },
    valueIsNaN() {
      return isNaN(parseFloat(this.inputValue));
    },
    isErrorNumber() {
      return (
        (this.onlyNumber || this.max !== null || this.min !== null) &&
        isNaN(Number(this.inputValue))
      );
    },
    errorNumberText() {
      return this.isErrorNumber ? "Только числа!" : null;
    },
    isErrorEmpty() {
      return this.notEmpty && !this.inputValue?.toString().length;
    },
    errorEmptyText() {
      return this.isErrorEmpty ? "Заполните поле!" : null;
    },
    isErrorMax() {
      return (
        !this.valueIsNaN &&
        this.max !== null &&
        parseFloat(this.inputValue) > parseFloat(this.max)
      );
    },
    errorMaxText() {
      return this.max !== null &&
        !this.valueIsNaN &&
        parseFloat(this.inputValue) > parseFloat(this.max)
        ? `Максимальное значение ${this.max}`
        : null;
    },

    isErrorMin() {
      return (
        !this.valueIsNaN &&
        this.min !== null &&
        parseFloat(this.inputValue) < parseFloat(this.min)
      );
    },
    errorMinText() {
      return this.min !== null &&
        !this.valueIsNaN &&
        parseFloat(this.inputValue) < parseFloat(this.min)
        ? `Минимальное значение ${this.min}`
        : null;
    },
    isErrorCustom() {
      return this.customErrorPattern
        ? this.inputValue.toString().search(this.customErrorPattern) < 0
        : false;
    },
    customErrorTextOut() {
      return this.isErrorCustom ? this.customErrorText : "";
    },
  },
};
</script>

<style scoped></style>
