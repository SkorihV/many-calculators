<template>
  <div
    class="calc__wrapper-group-data"
    v-if="isVisibilityFromDependency"
    ref="parent"
  >
    <div class="calc__checkbox-wrapper" :class="classes">
      <label :for="localElementName" class="calc__checkbox-label">
        <input
          ref="checkbox"
          class="calc__checkbox-item"
          type="checkbox"
          :checked="isChecked || localValue"
          :disabled="isChecked"
          @click="inputLocalValue($event.target.checked)"
          :name="label"
          :id="localElementName"
        />
        <div
          v-if="label"
          class="calc__checkbox-text"
          :class="{ button: checkboxType === 'button' }"
        >
          {{ label }}
          <div class="empty-block" v-if="notEmpty">*</div>
          <slot name="prompt"></slot>
        </div>
        <div class="calc__checkbox-element" :class="checkboxType"></div>
        <div v-if="labelSecond.length" class="calc__checkbox-text_second">
          {{ labelSecond }}
        </div>
      </label>
      <ui-tooltip
        :is-show="isErrorEmpty"
        :tooltip-text="textErrorNotEmpty"
        :local-can-be-shown="isVisibilityFromDependency"
      />
    </div>
  </div>
  <div v-if="devModeData.length" v-html="devModeData"></div>
</template>

<script>
import UiTooltip from "@/components/UI/UiTooltip";
import { MixinsForProcessingFormula } from "@/components/UI/MixinsForProcessingFormula";
import { MixinsGeneralItemData } from "@/components/UI/MixinsGeneralItemData";

import { useBaseStore } from "@/store/piniaStore";
import { mapState } from "pinia";
import UsePropsTemplates from "@/components/UI/UsePropsTemplates";
import UseUtilityServices from "@/components/UI/UseUtilityServices";
import UseForProcessingFormula from "@/components/UI/UseForProcessingFormula";
import { computed, onMounted, ref, toRef, watch } from "vue";
import UseDevModeDataBlock from "@/components/UI/UseDevModeDataBlock";

export default {
  name: "UiCheckbox",
  emits: ["changedValue"],
  // mixins: [MixinsForProcessingFormula, MixinsGeneralItemData],
  components: { UiTooltip },
  props: {
    labelSecond: {
      type: String,
      default: "",
    },

    /**
     *     Начальное значение
     */
    checkboxValue: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    },

    /**
     *  альтернативный способ смены вида чекбокас - текстом
     *  default - base
     *  switcher - горизонтальный переключатель
     *  switcher-vertical - вертикальный переключатель
     *  button - кнопка
     */
    typeDisplayClass: {
      type: String,
      default: "base",
    },
    ...UsePropsTemplates([
      "formOutputMethod",
      "isChecked",
      "isNeedChoice",
      "dependencyPrices",
      "cost",
      "dependencyFormulaDisplay",
      "parentIsShow",
      "label",
      "notEmpty",
      "excludeFromCalculations",
      "elementName",
      "parentName",
      "formulaProcessingLogic",
      "classes",
      "templateName",
    ]),
  },
  setup(props, { emit }) {
    const store = useBaseStore();
    const localValue = ref(null);
    const textErrorNotEmpty = "Обязательное поле.";

    const parentIsShow = toRef(props, "parentIsShow");
    const dependencyFormulaDisplay = toRef(props, "dependencyFormulaDisplay");
    const dependencyPrices = props.dependencyPrices?.length
      ? toRef(props, "dependencyPrices")
      : ref([]);

    const { checkedValueOnVoid } = UseUtilityServices();

    const {
      isVisibilityFromDependency: isVisibilityFromDependencyLocal,
      initProcessingDependencyPrice,
      costAfterProcessingDependencyPrice,
      parsingFormulaVariables,
    } = UseForProcessingFormula({
      parentIsShow,
      dependencyFormulaDisplay,
      dependencyPrices,
    });
    const isVisibilityFromDependency = ref(
      isVisibilityFromDependencyLocal.value
    );
    watch(
      () => isVisibilityFromDependencyLocal.value,
      () => {
        isVisibilityFromDependency.value =
          isVisibilityFromDependencyLocal.value;
      }
    );

    const { devModeData } = UseDevModeDataBlock({
      label: props.label,
      elementName: props.elementName,
      dependencyFormulaDisplay,
      parsingFormulaVariables,
      isVisibilityFromDependency,
      templateName: props.templateName,
      localValue,
    });

    const inputLocalValue = (value) => {
      localValue.value = value;
      changeValue("click");
    };

    function changeValue(eventType = "click") {
      emit("changedValue", {
        value: localValue.value,
        displayValue: localValue.value ? "Да" : "Нет",
        name: localElementName.value,
        type: "checkbox",
        label: props.label?.length ? props.label : props.labelSecond,
        cost:
          localValue.value && checkedValueOnVoid(localCost.value)
            ? localCost.value
            : 0,
        formOutputMethod:
          props.formOutputMethod !== "no" ? props.formOutputMethod : null,
        excludeFromCalculations: props.excludeFromCalculations,
        isShow: isVisibilityFromDependency.value,
        eventType,
        formulaProcessingLogic: props.formulaProcessingLogic,
      });
      tryPassDependency();
      changeValid(eventType);
    }
    function changeValid(eventType) {
      store.checkValidationDataAndToggle({
        error: isErrorEmpty.value,
        name: localElementName.value,
        type: "checkbox",
        label: props.label,
        eventType,
        isShow: isVisibilityFromDependency.value,
        parentName: props.parentName,
      });
    }
    function tryPassDependency() {
      store.tryAddDependencyElement({
        name: localElementName.value,
        value: localValue.value,
        isShow: isVisibilityFromDependency.value,
        displayValue: localValue.value ? "Да" : "Нет",
        type: "checkbox",
      });
    }

    watch(
      () => props.checkboxValue,
      (newValue) => {
        localValue.value = Boolean(newValue);
        changeValid("checkbox");
      }
    );

    const localElementName = computed(() => {
      return checkedValueOnVoid(props.elementName)
        ? props.elementName
        : Math.random().toString();
    });
    const checkboxType = computed(() => {
      return props.typeDisplayClass ? props.typeDisplayClass : "base";
    });
    const isErrorEmpty = computed(() => {
      return props.isNeedChoice && !localValue.value;
    });

    /**
     * Возвращает цену подходящую условию, если моле отображается
     * Если не одна цена не подходит, то возвращается стандартная
     * @returns {Number|String|*}
     */
    const localCost = computed(() => {
      if (!initProcessingDependencyPrice.value || !dependencyPrices.value) {
        return props.cost;
      }

      let newCost = costAfterProcessingDependencyPrice(dependencyPrices.value);
      if (newCost !== null) {
        return newCost;
      }
      return props.cost;
    });

    onMounted(() => {
      localValue.value = Boolean(props.checkboxValue);
      if (props.isChecked) {
        localValue.value = true;
      }
      changeValue("mounted");
    });
    return {
      textErrorNotEmpty,
      classes: props.classes,
      localValue,
      isChecked: props.isChecked,
      localElementName,
      label: props.label,
      inputLocalValue,
      checkboxType,
      isErrorEmpty,
      notEmpty: props.notEmpty,
      isVisibilityFromDependency,
      devModeData,
    };
  },

  // mounted() {
  //   this.localValue = Boolean(this.checkboxValue);
  //   if (this.isChecked) {
  //     this.localValue = true;
  //   }
  //   this.changeValue("mounted");
  // },
  // data() {
  //   return {
  //     localValue: null,
  //     textErrorNotEmpty: "Обязательное поле.",
  //   };
  // },
  // methods: {
  //   inputLocalValue(value) {
  //     this.localValue = value;
  //     this.changeValue("click");
  //   },
  //   checkedValueOnVoid(value) {
  //     return value?.length !== 0 && value !== undefined && value !== null;
  //   },
  //   changeValue(eventType = "click") {
  //     this.$emit("changedValue", {
  //       value: this.localValue,
  //       displayValue: this.localValue ? "Да" : "Нет",
  //       name: this.localElementName,
  //       type: "checkbox",
  //       label: this.label?.length ? this.label : this.labelSecond,
  //       cost:
  //         this.localValue && this.checkedValueOnVoid(this.localCost)
  //           ? this.localCost
  //           : 0,
  //       formOutputMethod:
  //         this.formOutputMethod !== "no" ? this.formOutputMethod : null,
  //       excludeFromCalculations: this.excludeFromCalculations,
  //       isShow: this.isVisibilityFromDependency,
  //       eventType,
  //       formulaProcessingLogic: this.formulaProcessingLogic,
  //     });
  //     this.tryPassDependency();
  //     this.changeValid(eventType);
  //   },
  //   changeValid(eventType) {
  //     this.checkValidationDataAndToggle({
  //       error: this.isErrorEmpty,
  //       name: this.localElementName,
  //       type: "checkbox",
  //       label: this.label,
  //       eventType,
  //       isShow: this.isVisibilityFromDependency,
  //       parentName: this.parentName,
  //     });
  //   },
  //   tryPassDependency() {
  //     this.tryAddDependencyElement({
  //       name: this.localElementName,
  //       value: this.localValue,
  //       isShow: this.isVisibilityFromDependency,
  //       displayValue: this.localValue ? "Да" : "Нет",
  //       type: "checkbox",
  //     });
  //   },
  // },
  // watch: {
  //   checkboxValue(newValue) {
  //     this.localValue = Boolean(newValue);
  //     this.changeValid("checkbox");
  //   },
  // },
  // computed: {
  //   ...mapState(useBaseStore, [
  //     "tryAddDependencyElement",
  //     "checkValidationDataAndToggle",
  //     "devMode",
  //     "showInsideElementStatus",
  //   ]),
  //   localElementName() {
  //     return this.checkedValueOnVoid(this.elementName)
  //       ? this.elementName
  //       : Math.random().toString();
  //   },
  //   checkboxType() {
  //     return this.typeDisplayClass ? this.typeDisplayClass : "base";
  //   },
  //   isErrorEmpty() {
  //     return this.isNeedChoice && !this.localValue;
  //   },
  //
  //   /**
  //    * Возвращает цену подходящую условию, если моле отображается
  //    * Если не одна цена не подходит, то возвращается стандартная
  //    * @returns {Number|String|*}
  //    */
  //   localCost() {
  //     if (!this.initProcessingDependencyPrice || !this.dependencyPrices) {
  //       return this.cost;
  //     }
  //
  //     let newCost = this.costAfterProcessingDependencyPrice(
  //       this.dependencyPrices
  //     );
  //     if (newCost !== null) {
  //       return newCost;
  //     }
  //     return this.cost;
  //   },
  // },
};
</script>

<style scoped lang="scss"></style>
