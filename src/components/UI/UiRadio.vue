<template>
  <div
    class="calc__radio-wrapper"
    v-if="isVisibilityFromDependency"
    :class="[
      radioType,
      { column: isColumn, solid: isSolid, wrap: isWrap },
      classes,
    ]"
  >
    <div class="calc__radio-title" v-if="label">
      {{ label }} <slot name="prompt" />
    </div>
    <div class="calc__radio-wrapper-buttons">
      <div
        class="calc__radio-label"
        v-for="(radio, idx) in radioValues"
        :id="localElementName + '_' + idx"
        :class="{ checked: idx === currentIndexRadioButton }"
        :key="idx"
        @click="selectedCurrentRadio(idx)"
      >
        <span class="calc__radio-indicator" v-if="radioType === 'base'"></span>
        <span class="calc__radio-text">{{ radio.radioName }}</span>
        <ui-prompt :prompt-text="radio.prompt" />
      </div>
    </div>
    <ui-tooltip :is-show="isErrorEmpty" :tooltip-text="textErrorNotEmpty" />
  </div>
</template>

<script>
import UiPrompt from "@/components/UI/UiPrompt";
import UiTooltip from "@/components/UI/UiTooltip";
import { MixinsForWorkersTemplates } from "@/components/UI/MixinsForWorkersTemplates";

export default {
  name: "UiRadio",
  emits: ["changedValue", "changeValid"],
  mixins: [MixinsForWorkersTemplates],
  components: { UiPrompt, UiTooltip },
  mounted() {
    this.localElementName = this.checkedValueOnVoid(this.elementName)
      ? this.elementName
      : Math.random().toString();

    if (!this.isErrorEmpty && !this.isNeedChoice) {
      let timer = setInterval(() => {
        if (this.radioValues.length) {
          this.currentIndexRadioButton =
            this.checkedValueOnVoid(this.selectedItem) &&
            parseInt(this.selectedItem) < this.radioValues.length
              ? parseInt(this.selectedItem)
              : this.radioValues.length - 1;
          this.changeValue(
            "mounted"
          );
          clearInterval(timer);
        }
      }, 100);
      setTimeout(() => {
        clearInterval(timer);
      }, 10000);
    } else {
      this.changeValid();
    }
  },

  props: {
    radioValues: {
      type: Array,
      default: () => [],
    },
    /**
     * номер предвыборной кнопки
     */
    selectedItem: {
      type: [Number, String],
      default: 0,
      validator(value) {
        return !isNaN(Number(value));
      },
    },

    /**
     *   вертикальное положение кнопок
     */
    isColumn: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    },

    /**
     * По умолчанию не выбрано - нужно сделать выбор.
     */
    isNeedChoice: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    },

    /**
     *  способ отображения - указать текстом
     *  default - base
     *  1) buttons
     */
    typeDisplayClass: {
      type: String,
      default: "base",
    },

    /**
     * метод вывода данных в результирующую форму
     */
    formOutputMethod: {
      type: String,
      default: "no",
    },
    /**
     * в горизонтальном положении убрать пробелы между кнопками
     */
    isSolid: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    },

    /**
     * включить перенос для заголовка и кнопок
     */
    isWrap: {
      type: [Boolean, Number],
      default: true,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    },
  },
  data() {
    return {
      currentIndexRadioButton: null,
      textErrorNotEmpty: "Обязательное поле.",
      localElementName: null,
    };
  },
  methods: {
    checkedValueOnVoid(value) {
      return value?.length !== 0 && value !== undefined && value !== null;
    },
    selectedCurrentRadio(index) {
      this.currentIndexRadioButton = parseInt(index);

      this.changeValue();
    },
    changeValue(eventType = "click") {
      const radio =  this.radioValues[this.currentIndexRadioButton];
      this.$emit("changedValue", {
        value: radio,
        index: this.currentIndexRadioButton,
        name: this.localElementName,
        type: "radio",
        cost: this.checkedValueOnVoid(radio?.cost)
          ? parseFloat(radio.cost)
          : 0,
        label: this.label,
        formOutputMethod:
          this.formOutputMethod !== "no" ? this.formOutputMethod : null,
        eventType,
        unit: this.unit,
      });
      this.changeValid();
    },
    changeValid() {
      this.$emit("changeValid", {
        error: this.isErrorEmpty,
        name: this.localElementName,
        type: "radio",
        label: this.label,
      });
    },
  },
  watch: {
    selectedItem(newValue) {
      this.currentIndexRadioButton =
        this.checkedValueOnVoid(newValue) &&
        parseInt(newValue) < this.radioValues.length
          ? parseInt(this.selectedItem)
          : this.radioValues.length - 1;
      this.changeValue("selected");
    },
  },
  computed: {
    radioType() {
      return this.typeDisplayClass?.length ? this.typeDisplayClass : 'base'
    },
    isErrorEmpty() {
      return this.notEmpty && this.currentIndexRadioButton === null;
    },
  },
};
</script>

<style scoped lang="scss"></style>
