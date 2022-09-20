<template>
  <div class="calc__input-wrapper">
    <label :for="idName" class="calc__input-label">
      <div v-if="label" class="calc__input-label-text">
        {{ label }}
      </div>
      <input
        ref="trueInput"
        :id="idName"
        :type="isTypeNumber"
        :value="resultValue"
        @input="tryChangeValueInput"
        @keydown.enter="trueTrueValue"
        class="calc__input-item"
        autocomplete="off"
        v-if="!fakeValueHidden"
      />

      <input
        @click="showTrueValue"
        :type="isTypeNumber"
        :value="resultValueDouble"
        class="calc__input-item currency"
        autocomplete="off"
        v-show="fakeValueHidden"
      />
      <div v-if="unit?.length" class="calc__input-unit">{{ unit }}</div>
    </label>
    <div v-if="isErrorEmpty" class="empty calc__input-error">
      {{ errorEmptyText }}
    </div>
    <div v-else-if="isErrorNumber" class="max calc__input-error">
      {{ errorNumberText }}
    </div>
    <div v-else-if="isErrorMax" class="max calc__input-error">
      {{ errorMaxText }}
    </div>
    <div v-else-if="isErrorMin" class="min calc__input-error">
      {{ errorMinText }}
    </div>
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
      default: 0,
    },
    // имя необходимое для корректной работы Label
    idName: {
      type: String,
    },
    label: {
      type: String,
    },
    unit: {
      type: String,
    },
    //текст для ошибки созданной в ручную
    customErrorText: {
      type: String,
    },
    // шаблон rex для ручной валидации
    customErrorPattern: {
      type: String,
      default: null,
    },
    onlyNumber: {
      type: Boolean,
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
    // инпут не должен быть пустым
    notEmpty: {
      type: Boolean,
    },
    // изменить стандартный тип Text на Number
    typeNumber: {
      type: Boolean,
    },
    //разделять сотни пробелами
    isCurrency: {
      type: Boolean,
      default: false,
    },
  },
  mounted() {
    if (this.min) {
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
      isErrorCustom: false,
      nameTimer: null,
      fakeValueHidden: this.isCurrency,
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

        if (currentValue.toString().slice(-1) === ".") {
          return currentValue;
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
        let isInvalid = [
          this.isErrorMin,
          this.isErrorMax,
          this.isErrorEmpty,
          this.isErrorNumber,
          this.isErrorCustom,
        ].some((item) => item);
        this.$emit("changeValid", isInvalid);
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
        return this.resultWitchNumberValid();
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
    isTypeNumber() {
      return this.typeNumber ? "Number" : "Text";
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
  },
};
</script>

<style scoped></style>
