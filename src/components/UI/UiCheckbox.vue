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
import { useBaseStore } from "@/store/piniaStore";
import UsePropsTemplates from "@/components/UI/UsePropsTemplates";
import UseUtilityServices from "@/components/UI/UseUtilityServices";
import UseForProcessingFormula from "@/components/UI/UseForProcessingFormula";
import { computed, onMounted, ref, toRef, watch } from "vue";
import UseDevModeDataBlock from "@/components/UI/UseDevModeDataBlock";

export default {
  name: "UiCheckbox",
  emits: ["changedValue"],
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
    const dependencyPrices = props.dependencyPrices;
    const cost = props.cost;
    const label = props.label;

    const classes = props.classes;
    const notEmpty = props.notEmpty;
    const isChecked = props.isChecked;
    const parentName = props.parentName;
    const elementName = props.elementName;
    const labelSecond = props.labelSecond;
    const isNeedChoice = props.isNeedChoice;
    const checkboxValue = props.checkboxValue;
    const formOutputMethod = props.formOutputMethod;
    const excludeFromCalculations = props.excludeFromCalculations;
    const formulaProcessingLogic = props.formulaProcessingLogic;


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
      changeValid,
      changeValue,
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
      label,
      elementName: elementName,
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
        label: label?.length ? label : props.labelSecond,
        cost:
          localValue.value && checkedValueOnVoid(localCost.value)
            ? localCost.value
            : 0,
        formOutputMethod:
          formOutputMethod !== "no" ? formOutputMethod : null,
        excludeFromCalculations,
        isShow: isVisibilityFromDependency.value,
        eventType,
        formulaProcessingLogic,
        error: isErrorEmpty.value,
        parentName,
      });
      tryPassDependency();
      changeValid(eventType);
    }
    function changeValid(eventType) {
      store.checkValidationDataAndToggle({
        error: isErrorEmpty.value,
        name: localElementName.value,
        type: "checkbox",
        label,
        eventType,
        isShow: isVisibilityFromDependency.value,
        parentName,
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

    const localElementName = computed(() => {
      return checkedValueOnVoid(elementName)
        ? elementName
        : Math.random().toString();
    });
    const checkboxType = computed(() => {
      return props.typeDisplayClass ? props.typeDisplayClass : "base";
    });
    const isErrorEmpty = computed(() => {
      return isNeedChoice && !localValue.value;
    });

    /**
     * Возвращает цену подходящую условию, если моле отображается
     * Если не одна цена не подходит, то возвращается стандартная
     * @returns {Number|String|*}
     */
    const localCost = computed(() => {
      if (!initProcessingDependencyPrice.value || !dependencyPrices) {
        return cost;
      }

      let newCost = costAfterProcessingDependencyPrice(dependencyPrices);
      if (newCost !== null) {
        return newCost;
      }
      return cost;
    });

    onMounted(() => {
      localValue.value = Boolean(checkboxValue);
      if (isChecked) {
        localValue.value = true;
      }
      changeValue("mounted");
    });
    return {
      textErrorNotEmpty,
      localValue,
      localElementName,
      inputLocalValue,
      checkboxType,
      isErrorEmpty,
      isVisibilityFromDependency,
      devModeData,
      label,
      classes,
      notEmpty,
      isChecked,
      labelSecond,
    };
  },
};
</script>

<style scoped lang="scss"></style>
