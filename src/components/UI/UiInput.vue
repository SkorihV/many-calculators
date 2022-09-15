<template>
  <div class="calc__input-wrapper">
    <label :for="idName" class="calc__input-label">
      <div v-if="label" class="calc__input-label-text">
        {{ label }}
      </div>
      <input
        :id="idName"
        type="text"
        :value="resultValue"
        @input="tryChangeValue"
        class="calc__input"
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
  emits: ["changeValue"],
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
      default: null,
    },
  },
  mounted() {
    if (this.min ) {
      this.changeValue(this.min);
    }
  },
  data() {
    return {
      isErrorCustom: false,
      errorTimeout: null
    };
  },
  methods: {
    resultWitchNumberValid() {
      try {
        let currentValue = this.inputValue;
        if (this.isErrorNumber) {
          this.changeValueWitchTimer(this.min || 0);
        }

        if (currentValue.lastIndexOf === ".") {
          return currentValue;
        }
        // currentValue = this.checkingPerMaxMin;

        return parseFloat(currentValue);

      } catch (e) {
        console.error(e.message)
      }

    },
    tryChangeValue(e) {
      if (this.errorTimeout) clearTimeout(this.errorTimeout);
      let value = parseFloat(parseFloat(e.target.value).toFixed(2));
      this.changeValue(value)
    },
    changeValue(value) {
      this.$emit('changeValue', value);
    },
    changeValueWitchTimer(value){
      this.errorTimeout = setTimeout(() => {
        this.changeValue(value);
      }, 1500);
    }
  },
  computed: {
    resultValue() {
      if (this.onlyNumber) {
        return this.resultWitchNumberValid();
      } else {
        return this.inputValue
      }
    },

    valueIsNaN() {
      return isNaN(parseFloat(this.inputValue));
    },
    checkingPerMaxMin() {
      if (this.isErrorMax) {
        return parseFloat(this.max);
      } else if (this.isErrorMin) {
        return parseFloat(this.min);
      }
      return parseFloat(this.inputValue);
    },
    isErrorNumber() {
      const isError = (
        (this.onlyNumber || this.max !== null || this.min !== null) &&
        isNaN(Number(this.inputValue))
      )

      if (isError) {
        this.changeValueWitchTimer(this.min || 0);
      }
      return isError

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
      const isError = (
        !this.valueIsNaN &&
        this.max !== null &&
        parseFloat(this.inputValue) > parseFloat(this.max)
      )
      if (isError) {
        this.changeValueWitchTimer(this.max);
      }
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
      const isError = (
        !this.valueIsNaN &&
        this.min !== null &&
        parseFloat(this.inputValue) < parseFloat(this.min)
      );

      if (isError) {
        this.changeValueWitchTimer(this.min)
      }
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
