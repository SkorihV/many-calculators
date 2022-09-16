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
        v-if="fakeValueHidden"
      />
      <div v-if="unit?.length" class="calc__input-unit">{{ unit }}</div>
    </label>
    <div v-if="isErrorEmpty" class="empty calc__input-error">
      {{ errorEmpty }}
    </div>
    <div v-else-if="isErrorNumber" class="max calc__input-error">
      {{ errorNumber }}
    </div>
    <div v-else-if="isErrorMax" class="max calc__input-error">
      {{ errorMax }}
    </div>
    <div v-else-if="isErrorMin" class="min calc__input-error">
      {{ errorMin }}
    </div>
  </div>
</template>

<script>
export default {
  name: "UiInput",
  emits: ["changeValue", "changeValid", "changeValueBlur"],
  props: {
    inputValue: {
      type: [Number, String],
      default: 0,
    },
    idName: {
      type: String,
    },
    label: {
      type: String,
    },
    unit: {
      type: String,
    },
    customErrorText: {
      type: String,
    },
    customErrorPattern: {
      type: String,
      default: null,
    },
    onlyNumber: {
      type: Boolean,
    },
    max: {
      type: [Number, String],
      default: null,
    },
    min: {
      type: [Number, String],
      default: null,
    },
    notEmpty: {
      type: Boolean,
    },
    typeNumber: {
      type: Boolean,
    },
    isFixed: {
      type: Boolean,
    },
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
      errorTimeout: null,
      fakeValueHidden: this.isCurrency,
    };
  },
  methods: {
    resultWitchNumberValid() {
      try {
        let currentValue = this.inputValue;
        this.clearTimer();
        if (this.isErrorNumber) {
          this.changeValueWitchTimer(this.min || 0);
        }

        if (currentValue.toString().slice(-1) === ".") {
          return currentValue;
        }

        if (this.isFixed) {
          return parseFloat(currentValue).toFixed(2);
        }
        return currentValue;
      } catch (e) {
        console.error(e.message);
      }
    },
    tryChangeValueInput(e) {
      let value = parseFloat(e.target.value);
      this.changeValue(value);
    },
    changeValue(value) {
      this.$emit("changeValue", value);
      this.checkValid();
    },
    changeValueWitchTimer(value) {
      this.errorTimeout = setTimeout(() => {
        this.changeValue(value);
      }, 1500);
    },
    clearTimer() {
      if (this.errorTimeout) clearTimeout(this.errorTimeout);
    },
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
        console.log(isInvalid);
      });
    },
    showTrueValue() {
      if (this.isCurrency) {
        this.fakeValueHidden = false;
        this.$nextTick(() => {
          this.$refs.trueInput.focus();
        });
      }
    },
    trueTrueValue() {
      this.fakeValueHidden = true;
    },
  },
  watch: {
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
      if (this.onlyNumber) {
        return this.resultWitchNumberValid().toLocaleString("ru");
      } else {
        return this.inputValue;
      }
    },
    valueIsNaN() {
      return isNaN(parseFloat(this.inputValue));
    },
    isTypeNumber() {
      return this.typeNumber ? "Number" : "Text";
    },

    isErrorNumber() {
      const isError =
        (this.onlyNumber || this.max !== null || this.min !== null) &&
        isNaN(Number(this.inputValue));
      return isError;
    },
    errorNumber() {
      return this.isErrorNumber ? "Только числа!" : null;
    },
    isErrorEmpty() {
      return this.notEmpty && !this.inputValue?.toString().length;
    },
    errorEmpty() {
      return this.isErrorEmpty ? "Заполните поле!" : null;
    },
    isErrorMax() {
      const isError =
        !this.valueIsNaN &&
        this.max !== null &&
        parseFloat(this.inputValue) > parseFloat(this.max);
      return isError;
    },
    errorMax() {
      return this.max !== null &&
        !this.valueIsNaN &&
        parseFloat(this.inputValue) > parseFloat(this.max)
        ? `Максимальное значение ${this.max}`
        : null;
    },

    isErrorMin() {
      const isError =
        !this.valueIsNaN &&
        this.min !== null &&
        parseFloat(this.inputValue) < parseFloat(this.min);
      return isError;
    },
    errorMin() {
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
