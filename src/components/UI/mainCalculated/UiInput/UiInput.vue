<script setup>
import UiTooltip from "@/components/UI/other/UiTooltip.vue";
import devBlock from "@/components/UI/devMode/c_devBlock.vue";
import IconElementWrapper from "@/components/UI/supporting/icon-element-wrapper.vue";
import { propsTemplate } from "@/servises/UsePropsTemplatesSingle";
import {useDisplaySpinner} from "@/composables/useDisplaySpinner";

import {getBaseStoreAction, getBaseStoreGetters} from "@/composables/useBaseStore";
import {checkedValueOnVoid} from "@/servises/UtilityServices"
import {useProcessingFormula} from "@/composables/useProcessingFormula";
import {useLocalDependencyList} from "@/composables/useLocalDependencyList";
import {useReportInitialStatusForElement} from "@/composables/useReportInitialStatusForElement";
import {useUtilityServices} from "@/composables/useUtilityServices";
import {getCurrentWidthElement, getIsMakeElementColumn} from "@/composables/useWidthElement";
import { onMounted, onUnmounted, reactive, ref, toRef, watch, computed, nextTick } from "vue";
import { useInitProcessingDependencyPrice } from "@/composables/useInitProcessingDependencyPrice";

const {devMode, isCanShowAllTooltips} = getBaseStoreGetters()
const {tryAddDependencyElement, checkValidationDataAndToggle, tryToggleElementIsMounted, tryDeleteAllDataOnStoreForElementName} = getBaseStoreAction(['tryAddDependencyElement', 'checkValidationDataAndToggle', 'tryToggleElementIsMounted', 'tryDeleteAllDataOnStoreForElementName'])

const emits = defineEmits(["changedValue"])
const props = defineProps({
  /**
   * данные для инпута
   */
  inputValue: {
    type: [Number, String],
    default: null,
  },
  inputPlaceholder: {
    type: String,
  },
  /**
   * единицы измерения
   */
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
  /**
   * Список цен с зависимостями / условиями
   */
  dependencyPrices: {
    type: Array,
    default: () => [],
  },
  /**
   * отобразить элементы управления
   */
  controls: {
    type: [Boolean, Number],
    default: false,
    validator(value) {
      return value === false || value === true || value === 0 || value === 1;
    },
  },
  /**
   * шаг при нажатии на + / -
   */
  step: {
    type: [Number, String],
    default: 1,
    validator(value) {
      return !isNaN(Number(value));
    },
  },
  /**
   * Включить кратность шага для поля ввода
   */
  discreteStep: {
    type: [Boolean, Number],
    default: false,
    validator(value) {
      return value === false || value === true || value === 0 || value === 1;
    },
  },
  /**
   * разделять сотни пробелами
   */
  isCurrency: {
    type: [Boolean, Number],
    default: false,
    validator(value) {
      return value === false || value === true || value === 0 || value === 1;
    },
  },
  /**
   * Тип данных разрешенный вводить в поле
   * mixed
   * onlyNumber
   * onlyInteger
   */
  dataType: {
    type: String,
    default: "mixed",
  },
  iconSettingsInputLabel: {
    type: Object,
    default: () => {},
  },
  ...propsTemplate.getProps([
    "label",
    "notEmpty",
    "excludeFromCalculations",
    "elementName",
    "parentName",
    "formulaProcessingLogic",
    "classes",
    "templateName",
    "unit",
    "cost",
    "dependencyPrices",
    "max",
    "min",
    "isColumn",
    "isStretch",
    "formOutputMethod",
    "resultOutputMethod",
    "dependencyFormulaDisplay",
    "parentIsShow",
    "positionElement",
    "zeroValueDisplayIgnore",
  ]),
})

const parentRef = ref(null)

const inputFocus = ref(false)
const focusTimerName = ref(null)
const localInputBufferValue = ref(null)
const localInputValue = ref(null)
const nameTimer = ref(null)
const isInvalid = ref(false)
const canBeShownTooltip = ref(false)




useDisplaySpinner(props.elementName)
useReportInitialStatusForElement(toRef(props, 'parentIsShow'),  changeValue, changeValid)
const {getArrayElementsFromFormula} = useUtilityServices()

const {localDependencyList, constructLocalListElementDependencyInFormula} = useLocalDependencyList()
const {formulaAfterProcessingVariables, isVisibilityFromDependency, costAfterProcessingDependencyPrice} = useProcessingFormula(
  reactive({
    localDependencyList: localDependencyList,
    constructLocalListElementDependencyInFormula,
    formula: toRef(props,"dependencyFormulaDisplay"),
    parentIsShow: toRef(props, "parentIsShow")
  })
)
const {currentWidthElement} = getCurrentWidthElement(isVisibilityFromDependency, parentRef)
const isExistLabel = computed(() => {
  return Boolean(props.label?.toString()?.length);
})
const {isMakeElementColumn} = getIsMakeElementColumn(currentWidthElement, isExistLabel)
const {initProcessingDependencyPrice} = useInitProcessingDependencyPrice(toRef(props, 'dependencyPrices'))


const isMixedValue = computed(() => {
      return props.dataType === "mixed";
    })
const onlyNumberValue = computed(() => {
      return props.dataType === "onlyNumber";
    })
const onlyIntegerValue = computed(() => {
      return props.dataType === "onlyInteger";
    })
const localMax = computed(() => {
      return checkedValueOnVoid(props.max) && !isMixedValue.value
        ? Number(props.max)
        : null;
    })
const localMin = computed(() => {
      return checkedValueOnVoid(props.min) && !isMixedValue.value
        ? Number(props.min)
        : null;
    })
const localStep = computed(() => {
      return checkedValueOnVoid(props.step) ? Number(props.step) : 1;
    })
const isOnlyNumber = computed(() => {
      return onlyNumberValue.value || onlyIntegerValue.value;
    })
const showControlsButton = computed(() => {
      return props.controls && isOnlyNumber.value;
    })
const localElementName = computed(() => {
      return checkedValueOnVoid(props.elementName)
        ? props.elementName
        : Math.random().toString();
    })
const resultValue = computed(() => {
      if (!isVisibilityFromDependency.value) {
        return null;
      }
      if (isOnlyNumber.value) {
        return resultWitchNumberValid();
      } else {
        return localInputValue.value;
      }
    })
const valueIsNaN = computed(() => {
      return isNaN(parseFloat(localInputValue.value));
    })
const isDisabledMin = computed(() => {
      return resultValue.value === localMin.value;
    })
const isDisabledMax = computed(() => {
      return resultValue.value === localMax.value;
    })
const isErrorNumber = computed(() => {
      return (
        isOnlyNumber.value &&
        valueIsNaN.value &&
        localInputValue.value?.toString()?.length
      );
    })
const errorNumberText = computed(() => {
      return isErrorNumber.value ? "Только числа!" : null;
    })
const isErrorEmpty = computed(() => {
      return props.notEmpty && !localInputValue.value?.toString().length;
    })
const errorEmptyText = computed(() => {
      return isErrorEmpty.value ? "Заполните поле!" : null;
    })
const isErrorMax = computed(() => {
      return (
        !valueIsNaN.value &&
        localMax.value !== null &&
        parseFloat(localInputValue.value) > parseFloat(localMax.value)
      );
    })
const errorMaxText = computed(() => {
      return localMax.value !== null &&
      !valueIsNaN.value &&
      parseFloat(localInputValue.value) > parseFloat(localMax.value)
        ? `Максимальное значение ${localMax.value}`
        : null;
    })
const isErrorMin = computed(() => {
      return (
        !valueIsNaN.value &&
        localMin.value !== null &&
        parseFloat(localInputValue.value) < parseFloat(localMin.value)
      );
    })
const errorMinText = computed(() => {
      return localMin.value !== null &&
      !valueIsNaN.value &&
      parseFloat(localInputValue.value) < parseFloat(localMin.value)
        ? `Минимальное значение ${localMin.value}`
        : null;
    })
const tooltipError = computed(() => {
      if (isErrorNumber.value) {
        return { error: isErrorNumber.value, errorText: errorNumberText.value };
      } else if (isErrorMax.value) {
        return { error: isErrorMax.value, errorText: errorMaxText.value };
      } else if (isErrorMin.value) {
        return { error: isErrorMin.value, errorText: errorMinText.value };
      } else if (isErrorEmpty.value) {
        return { error: isErrorEmpty.value, errorText: errorEmptyText.value };
      } else {
        return false;
      }
    })
const isErrorClass = computed(() => {
  return tooltipError.value?.error && isCanShowAllTooltips.value;
})
const localCanBeShownTooltip = computed(() => {
      return canBeShownTooltip.value && isVisibilityFromDependency.value;
    })
    /**
     * Возвращает цену подходящую условию, если моле отображается
     * Если не одна цена не подходит, то возвращается стандартная
     * @returns {Number|String|*}
     */
const localCost = computed(() => {
      if (!isVisibilityFromDependency.value) {
        return null;
      }
      if (!initProcessingDependencyPrice || !props.dependencyPrices) {
        return updatedCostForOut(props.cost);
      }
      let { cost: newCost } = costAfterProcessingDependencyPrice(
        reactive({
          dependencyArrayItems: toRef(props, 'dependencyPrices'),
          formulaFieldName:  "dependencyFormulaCost",
          templateName: "UiInput",
          value: localInputValue.value
        })
      );
      if (newCost !== null) {
        return updatedCostForOut(newCost);
      }
      return updatedCostForOut(props.cost);
    })
const needFixedResult = computed(() => {
      return Boolean(
        (props.discreteStep || props.controls) && onlyNumberValue.value
      );
    })
const numberSignsAfterComma = computed(() => {
      return props.step.toString().includes(".") && needFixedResult.value
        ? props.step.toString().split(".").pop().length
        : 0;
    })




watch(isVisibilityFromDependency, () => {
  changeValue("dependency");
})
watch(inputFocus, (isFocus) => {
    if (!isFocus) {
      changeValue("notFocus");
      shownTooltip();
      clearTimeout(focusTimerName.value);
    }
})
watch(localInputBufferValue, (newValue) => {
    if (isOnlyNumber.value) {
      localInputValue.value = parseFloat(
        newValue?.toString().replaceAll(/\s/g, "").replaceAll(/,/g, ".")
      );
    } else {
      localInputValue.value = newValue;
    }

    clearTimeout(focusTimerName.value);
    focusTimerName.value = setTimeout(() => {
      if (inputFocus.value) {
        setTimeout(() => (inputFocus.value = true), 1000);
      }
      inputFocus.value = false;
    }, 3000);
})


function resultWitchNumberValid() {
      try {
        clearTimer(nameTimer.value);
        localInputValue.value = parseFloat(
          localInputValue.value
            ?.toString()
            .replaceAll(/\s/g, "")
            .replaceAll(/,/g, ".")
        );

        if (
          localInputValue.value?.toString().slice(-1) === "." ||
          localInputValue.value?.toString().slice(0) === "-"
        ) {
          return localInputValue.value;
        }

        if (isErrorNumber.value || isErrorEmpty.value) {
          resetNumberValue();
          return null;
        }

        if (isErrorMin.value) {
          resetNumberValue();
        }

        if (isErrorMax.value) {
          changeValueWitchTimer(localMax.value);
        }

        if (props.discreteStep) {
          localInputValue.value =
            Math.round(parseFloat(localInputValue.value) / props.step) *
            props.step;
        } else {
          localInputValue.value = parseFloat(localInputValue.value);
        }

        if (valueIsNaN.value) {
          localInputValue.value = "";
        }

        if (onlyIntegerValue.value) {
          localInputValue.value = !valueIsNaN.value
            ? parseInt(localInputValue.value)
            : null;
        }

        localInputValue.value = updateValueAfterSignComma(
          localInputValue.value
        );

        if (!inputFocus.value) {
          addLocalInputBufferValue(localInputValue.value);
        }

        return localInputValue.value;
      } catch (e) {
        if (devMode.value) {
          console.error(e.message);
        }
      }
    }
function changeValue(eventType = "input") {
      emits("changedValue", {
        value: resultValue.value?.toString()?.length ? resultValue.value : null,
        displayValue: resultValue.value?.toString()?.length
          ? resultValue.value
          : null,
        name: localElementName.value,
        type: "input",
        cost: localCost.value,
        label: props.label,
        formOutputMethod:
          props.formOutputMethod !== "no" ? props.formOutputMethod : null,
        resultOutputMethod:
          props.resultOutputMethod !== "no" ? props.resultOutputMethod : null,
        isShow: isVisibilityFromDependency.value,
        excludeFromCalculations: props.excludeFromCalculations,
        unit: props.unit,
        eventType,
        formulaProcessingLogic: props.formulaProcessingLogic,
        position: props.positionElement,
        zeroValueDisplayIgnore: props.zeroValueDisplayIgnore,
      });
      tryPassDependency();
      if (eventType !== "delete" || eventType !== "mounted") {
        changeValid(eventType);
      }
    }
/**
 * возвращает общее состояние не валидности инпута
 */
function changeValid(eventType) {
  nextTick(() => {
    isInvalid.value = [
      isErrorMin.value,
      isErrorMax.value,
      isErrorEmpty.value,
      isErrorNumber.value,
    ].some((item) => item);

    checkValidationDataAndToggle({
      error: isVisibilityFromDependency.value
        ? isInvalid.value
        : isVisibilityFromDependency.value,
      name: localElementName.value,
      type: "input",
      label: props.label,
      eventType,
      isShow: isVisibilityFromDependency.value,
      parentName: props.parentName,
    });
  });
  if (eventType !== "mounted") {
    shownTooltip();
  }
}
function tryPassDependency() {
      tryAddDependencyElement({
        name: localElementName.value,
        value: resultValue.value?.toString()?.length ? resultValue.value : null,
        isShow: isVisibilityFromDependency.value,
        displayValue: resultValue.value?.toString()?.length
          ? resultValue.value
          : null,
        type: "input",
      });
    }
function changeValueWitchTimer(value) {
      nameTimer.value = setTimeout(() => {
        localInputValue.value = value;
        changeValue("timer");
        shownTooltip();
      }, 2000);
    }
function clearTimer(name) {
      if (name) clearTimeout(name);
    }
function plus(payload) {
      if (!isOnlyNumber.value) {
        return false;
      }
      if (valueIsNaN.value) {
        resetNumberValue();
      }

      let value = parseFloat(localInputValue.value) + localStep.value;

      if (checkedValueOnVoid(localMax.value)) {
        value = value <= localMax.value ? value : localMax.value;
      }
      value = updateValueAfterSignComma(value);
      localInputValue.value = value;
      addLocalInputBufferValue(value);
      if (payload !== "key") {
        changeValue("plus");
      }
    }
function minus(payload) {
      if (!isOnlyNumber.value) {
        return false;
      }
      if (valueIsNaN.value) {
        resetNumberValue();
      }

      let value = parseFloat(localInputValue.value) - localStep.value;
      if (checkedValueOnVoid(localMin.value)) {
        value = value >= localMin.value ? value : localMin.value;
      }
      value = updateValueAfterSignComma(value);
      localInputValue.value = value;
      addLocalInputBufferValue(value);
      if (payload !== "key") {
        changeValue("minus");
      }
    }
function updateValueAfterSignComma(value) {
      return needFixedResult.value
        ? parseFloat(value.toFixed(numberSignsAfterComma.value))
        : value;
    }
function shownTooltip() {
      if (!canBeShownTooltip.value) {
        canBeShownTooltip.value = true;
      }
    }
function resetNumberValue() {
      changeValueWitchTimer(localMin.value || 0);
    }
function updatedCostForOut(cost) {
      return isOnlyNumber.value &&
      checkedValueOnVoid(cost) &&
      !isNaN(parseFloat((cost * localInputValue.value).toFixed(5)))
        ? parseFloat((cost * localInputValue.value).toFixed(5))
        : null;
    }
function addLocalInputBufferValue(value) {
      if (isOnlyNumber.value && props.isCurrency) {
        localInputBufferValue.value = value.toLocaleString("ru-RU", {
          useGrouping: true,
          maximumFractionDigits: 5,
        });
      } else {
        localInputBufferValue.value = value;
      }
    }



onMounted(() => {
  if (isOnlyNumber.value && localMin.value > Number(props.inputValue)) {
    localInputValue.value = localMin.value;
    changeValue("mounted");
  } else if (isOnlyNumber.value && localMax.value < Number(props.inputValue)) {
    localInputValue.value = localMax.value;
    changeValue("mounted");
  } else if (isOnlyNumber.value) {
    localInputValue.value = props.inputValue;
    changeValue("mounted");
  } else {
    changeValue("mounted");
  }
})
onUnmounted(() => {
  tryDeleteAllDataOnStoreForElementName(localElementName.value);

})


</script>


<template>
  <div
    class="calc__wrapper-group-data"
    v-if="isVisibilityFromDependency"
    :id="elementName"
    ref="parentRef"
  >
    <div
      class="calc__input-wrapper"
      :class="[classes, { column: isColumn || isMakeElementColumn }]"
    >
      <icon-element-wrapper
        :icon-settings="iconSettingsInputLabel"
        :alt="isExistLabel ? label : ''"
        :isExistLabel="isExistLabel"
      >
        <div class="calc__input-label-text" v-if="isExistLabel">
          {{ label }}
          <div class="empty-block" v-if="notEmpty">*</div>
          <slot name="prompt" />
        </div>
      </icon-element-wrapper>
      <div class="calc__input-wrapper-data" :class="{ stretch: isStretch }">
        <div
          class="calc__input-buttons-minus"
          :class="{ disabled: isDisabledMin }"
          v-if="showControlsButton"
          @click="minus"
        >
          -
        </div>
        <input
          ref="trueInput"
          type="text"
          v-model="localInputBufferValue"
          :placeholder="inputPlaceholder"
          @keydown.up="plus('key')"
          @keydown.down="minus('key')"
          @blur="inputFocus ? (inputFocus = false) : null"
          @focus="inputFocus = true"
          class="calc__input-item"
          :class="{
            number: isOnlyNumber,
            error: isErrorClass,
            stretch: isStretch,
          }"
          autocomplete="off"
        />
        <div
          class="calc__input-buttons-plus"
          :class="{ disabled: isDisabledMax }"
          v-if="showControlsButton"
          @click="plus"
        >
          +
        </div>
        <div v-if="unit?.length" class="calc__input-unit">{{ unit }}</div>
      </div>
      <ui-tooltip
        :is-show="Boolean(tooltipError?.error)"
        :tooltip-text="tooltipError?.errorText"
        :local-can-be-shown="localCanBeShownTooltip"
      />
    </div>
  </div>
  <dev-block
    :label="label"
    :element-name="localElementName"
    :value="resultValue"
    :local-cost="localCost"
    :is-visibility-from-dependency="isVisibilityFromDependency"
    :dependency-formula-display="dependencyFormulaDisplay"
    :parsing-formula-variables="formulaAfterProcessingVariables"
  />
</template>
