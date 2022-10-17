<template>
  <div class="calc__wrapper-group-data" v-if="isVisibilityFromDependency">
    <div
      class="calc__select-wrapper"
      :class="[{ 'is-column': isColumn }, classes]"
      :style="[minWidthWrapper, maxWidthWrapper]"
    >
      <div class="calc__select-label" v-if="label">
        {{ label }}<slot name="prompt"></slot>
      </div>
      <div class="calc__select-change-wrapper">
        <div
          v-if="currentOption"
          class="calc__select-change-item"
          @click="toggleOpenClose"
          :class="{ 'is-open': isOpen }"
        >
          <div
            v-if="currentOption?.image?.filename"
            class="calc__select-image-wrapper"
          >
            <img
              :alt="currentOption.selectName"
              class="calc__select-image-item"
              :src="imageDir + currentOption.image.filename"
            />
          </div>
          {{ currentOption.selectName }}
        </div>
        <div class="calc__select-option-wrapper" v-if="isOpen">
          <div
            class="calc__select-option-item"
            @click="changeSelect(option, idx)"
            v-for="(option, idx) in selectValuesAfterProcessingDependency"
            :key="idx"
          >
            <template v-if="currentIndexOption !== idx">
              <div
                v-if="option?.image?.filename"
                class="calc__select-image-wrapper"
              >
                <img
                  :alt="option.selectName"
                  class="calc__select-image-item"
                  :src="imageDir + option.image.filename"
                />
              </div>
              <div class="calc__select-option-item-text">
                {{ option.selectName }}
              </div>
              <ui-prompt
                v-if="option?.prompt?.length"
                :prompt-text="option.prompt"
              ></ui-prompt>
            </template>
          </div>
        </div>
      </div>
      <ui-tooltip
        :is-show="isErrorEmpty"
        :tooltip-text="textErrorNotEmpty"
        :local-can-be-shown="isVisibilityFromDependency"
      />
    </div>
  </div>
</template>

<script>
import UiTooltip from "@/components/UI/UiTooltip";
import UiPrompt from "@/components/UI/UiPrompt";
import { MixinsForWorkersTemplates } from "@/components/UI/MixinsForWorkersTemplates";

export default {
  name: "UiSelect",
  emits: ["changedValue", "changeValid"],
  mixins: [MixinsForWorkersTemplates],
  inject: ["globalDataForDependencies", "globalCanBeShownTooltip"],
  components: { UiTooltip, UiPrompt },
  mounted() {
    if (!this.isErrorEmpty && !this.isNeedChoice) {
      let timer = setInterval(() => {
        if (this.currentIndexOption === null && this.selectValues.length) {
          this.currentIndexOption =
            this.checkedValueOnVoid(this.selectedItem) &&
            parseInt(this.selectedItem) < this.selectValues.length
              ? parseInt(this.selectedItem)
              : this.selectValues.length - 1;

          this.changeSelect(
            this.selectValues[this.currentIndexOption],
            this.currentIndexOption,
            "mounted"
          );
          clearInterval(timer);
        }
      }, 100);
      setTimeout(() => {
        clearInterval(timer);
      }, 10000);
    } else {
      this.changeValid("mounted");
    }

    document.addEventListener("click", (e) => {
      if (!this.$el.contains(e.target)) {
        this.close();
      }
    });
  },
  props: {
    selectValues: {
      type: Array,
      default: () => [],
    },

    isColumn: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    },

    /**
     * номер выбранного селекта
     */
    selectedItem: {
      type: [Number, String],
      default: 0,
      validator(value) {
        return !isNaN(Number(value));
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
     * метод вывода данных в результирующую форму
     */
    formOutputMethod: {
      type: String,
      default: "no",
    },

    minWidth: {
      type: [Number, String],
      default: 200,
    },
    maxWidth: {
      type: [Number, String],
    },
  },
  data() {
    return {
      isOpen: false,
      currentOption: {
        selectName: "Не выбрано!",
      },
      currentIndexOption: null,
      textErrorNotEmpty: "Обязательное поле.",
      mockOption: {
        selectName: "Не выбрано!",
      },
    };
  },
  methods: {
    checkedValueOnVoid(value) {
      return value?.length !== 0 && value !== undefined && value !== null;
    },
    open() {
      this.isOpen = true;
    },
    toggleOpenClose() {
      this.isOpen = !this.isOpen;
    },
    close() {
      this.isOpen = false;
    },
    changeSelect(item, idx, eventType = "click") {
      this.currentIndexOption = idx;
      this.currentOption = item;
      this.changeValue(eventType);
      this.close();
    },
    changeValue(eventType = "click") {
      this.$emit("changedValue", {
        value: this.currentOption,
        index: this.currentIndexOption,
        name: this.localElementName,
        type: "select",
        cost: this.checkedValueOnVoid(this.localCost)
          ? parseFloat(this.localCost)
          : 0,
        label: this.label,
        formOutputMethod:
          this.formOutputMethod !== "no" ? this.formOutputMethod : null,
        eventType,
      });
      if (eventType !== "delete" || eventType !== "mounted") {
        this.changeValid(eventType);
      }
    },
    changeValid(eventType) {
      this.$emit("changeValid", {
        error: this.isErrorEmpty,
        name: this.localElementName,
        type: "select",
        label: this.label,
        eventType,
      });
    },
  },
  watch: {
    selectedItem(newValue) {
      this.currentIndexOption =
        this.checkedValueOnVoid(this.newValue) &&
        parseInt(this.newValue) < this.selectValues.length
          ? parseInt(this.newValue)
          : this.selectValues.length - 1;
      this.currentOption = this.selectValues[this.currentIndexOption];
      this.changeValue();
    },
    globalCanBeShownTooltip() {
      if (this.isVisibilityFromDependency) {
        this.changeValid("global");
      }
    },
    selectValuesAfterProcessingDependency: {
      handler(newValue, oldValue) {
        if (newValue?.length !== oldValue?.length) {
          this.currentOption = this.mockOption;
          this.currentIndexOption = -1;
          this.changeValue("delete");
        }
      },
      deep: true,
    },
  },
  computed: {
    localElementName() {
      return this.checkedValueOnVoid(this.elementName)
        ? this.elementName
        : Math.random().toString();
    },
    imageDir() {
      return window?.imageDir ? window.imageDir : "";
    },
    minWidthWrapper() {
      return this.minWidth ? `min-width:${this.minWidth}px;` : "";
    },
    maxWidthWrapper() {
      return this.maxWidth ? `max-width:${this.maxWidth}px;` : "";
    },
    isErrorEmpty() {
      return this.notEmpty && this.currentIndexOption === null;
    },

    /**
     * Существует список цен с зависимостями
     * @returns {boolean}
     */
    isDependencyPriceExist() {
      return Boolean(
        this.currentOption?.dependencyPrices?.filter(
          (item) => item?.enabledFormula && item?.dependencyFormulaCost?.length
        )
      );
    },
    /**
     * Иницаилизировать проверку условий зависимых цен
     *
     * @returns {boolean}
     */
    initProcessingDependencyPrice() {
      return this.isDependencyPriceExist && this.isDependencyNameExist;
    },

    /**
     * Возвращает цену подходящую условию
     * Если не одна цена не подходит, то возвращается стандартная
     * @returns {Number|String|*}
     */
    localCost() {
      if (this.initProcessingDependencyPrice) {
        let newCost = this.costAfterProcessingDependencyPrice(
          this.currentOption?.dependencyPrices
        );
        if (newCost !== null) {
          return newCost;
        }
        return this.currentOption?.cost;
      }
      return this.currentOption?.cost;
    },
    selectValuesAfterProcessingDependency() {
      if (this.isDependencyNameExist) {
        return this.selectValues.filter((select) => {
          if (
            select?.enabledProcessingDependency &&
            select?.dependencyFormulaItem.length
          ) {
            let formula = this.processingFormulaSpecialsSymbols(
              select.dependencyFormulaItem
            );
            formula = this.processingVariablesOnFormula(formula);
            // console.log(formula);
            try {
              return eval(formula);
            } catch (e) {
              console.error(e.message);
              return false;
            }
          }
          return true;
        });
      }
      return this.selectValues;
    },
  },
};
</script>

<style scoped></style>
