<script setup>
import UiTooltip from "@/components/UI/other/c_UiTooltip.vue";
import devBlock from "@/components/UI/devMode/c_devBlock.vue";
import iconElementWrapper from "@/components/UI/supporting/c_icon-element-wrapper.vue";
import { propsTemplate } from "@/servises/UsePropsTemplatesSingle";
import { onMounted, onUnmounted, ref, watch, computed, reactive, toRef } from "vue";
import {useEventListener} from "@/composables/useEventsListener";
import {getBaseStoreAction, getBaseStoreGetters} from "@/composables/useBaseStore";
import { useLocalDependencyList } from "@/composables/useLocalDependencyList";
import {useProcessingFormula} from "@/composables/useProcessingFormula";
import {useDisplaySpinner} from "@/composables/useDisplaySpinner";
import {getCurrentWidthElement, getIsMakeElementColumn} from "@/composables/useWidthElement";
import {checkedValueOnVoid} from '@/servises/UtilityServices'
import {useInitProcessingDependencyPrice} from "@/composables/useInitProcessingDependencyPrice";
import {useReportInitialStatusForElement} from "@/composables/useReportInitialStatusForElement";




const {isCanShowAllTooltips, getSomeElementChangedSelfVisibilityState} = getBaseStoreGetters()
const {tryAddDependencyElement, checkValidationDataAndToggle, tryToggleElementIsMounted, tryDeleteAllDataOnStoreForElementName} = getBaseStoreAction(['tryAddDependencyElement', 'checkValidationDataAndToggle', 'tryToggleElementIsMounted', 'tryDeleteAllDataOnStoreForElementName',])
const emits = defineEmits(["changedValue"])
const props = defineProps({
  rangeValue: {
    type: [Number, String],
    default: 0,
    validator(value) {
      return !isNaN(Number(value));
    },
  },
  /**
   * размер шага в ползунке
   */
  step: {
    type: [Number, String],
    default: 1,
    validator(value) {
      return !isNaN(Number(value));
    },
  },
  /**
   * отобразить ленту с шагами под ползунком
   */
  showSteps: {
    type: [Boolean, Number],
    default: false,
    validator(value) {
      return value === false || value === true || value === 0 || value === 1;
    },
  },
  /**
   *
   * Шаг деления в ленте
   */
  stepPrompt: {
    type: [Number, String],
    default: 1,
    validator(value) {
      return !isNaN(Number(value));
    },
  },
  /**
   *
   *     Отобразить текущее значение статичное
   */
  showStaticValue: {
    type: [Boolean, Number],
    default: false,
    validator(value) {
      return value === false || value === true || value === 0 || value === 1;
    },
  },
  /**
   * отобразить динамичное значение
   */
  showDynamicValue: {
    type: [Boolean, Number],
    default: false,
    validator(value) {
      return value === false || value === true || value === 0 || value === 1;
    },
  },
  iconSettingsRangeLabel: {
    type: Object,
    default: () => {},
  },
  ...propsTemplate.getProps([
    "label",
    "notEmpty",
    "excludeFromCalculations",
    "elementName",
    "formOutputMethod",
    "resultOutputMethod",
    "parentName",
    "isNeedChoice",
    "isColumn",
    "formulaProcessingLogic",
    "templateName",
    "classes",
    "unit",
    "dependencyPrices",
    "cost",
    "min",
    "max",
    "dependencyFormulaDisplay",
    "parentIsShow",
    "positionElement",
    "zeroValueDisplayIgnore",
  ]),
})


const thisElementInputRangeRef = ref(null)
const staticRef = ref(null)
const parentRef = ref(null)


const elementWidth = ref( 0);
const resultValue = ref( null);
const dynamicValue = ref( null);
const textErrorNotEmpty = ref( "Обязательное поле.");
const updateValueTimer = ref( null);
const canBeShownTooltip = ref( false);
const timerNameForLocalValue = ref( null);
const minimalWidthStaticElement = ref( 15);
const staticElementWidth = ref( minimalWidthStaticElement.value);


const {localDependencyList, constructLocalListElementDependencyInFormula} = useLocalDependencyList()
const {isVisibilityFromDependency, formulaAfterProcessingVariables, costAfterProcessingDependencyPrice} = useProcessingFormula(
  reactive(
    {
      formula: toRef(props, "dependencyFormulaDisplay"),
      parentIsShow: toRef(props, 'parentIsShow'),
      localDependencyList: localDependencyList,
      constructLocalListElementDependencyInFormula
    }
  )
)

useDisplaySpinner(props.elementName)
useReportInitialStatusForElement(toRef(props, 'parentIsShow'),  changeValue, changeValid)
const {initProcessingDependencyPrice} = useInitProcessingDependencyPrice(toRef(props, 'dependencyPrices'))

const {currentWidthElement, updatedCurrentWidth} = getCurrentWidthElement(isVisibilityFromDependency, parentRef)
const isExistLabel = computed(() => {
  return Boolean(props.label?.toString()?.length);
})
const {isMakeElementColumn} = getIsMakeElementColumn(currentWidthElement, isExistLabel)

const localMin = computed(() => {
      return checkedValueOnVoid(props.min) ? parseFloat(props.min) : 0;
    })
const localMax = computed(() => {
      return checkedValueOnVoid(props.max) ? parseFloat(props.max) : 10;
    })
const localStep = computed(() => {
      return checkedValueOnVoid(props.step) ? parseFloat(props.step) : 1;
    })
const localStepPrompt = computed(() => {
      return checkedValueOnVoid(props.stepPrompt)
        ? parseFloat(props.stepPrompt)
        : 1;
    })
const localElementName = computed(() => {
      return checkedValueOnVoid(props.elementName)
        ? props.elementName
        : Math.random().toString();
    })
const isHidePromptSteps = computed(() => {
  return (
    !props.showSteps &&
    !localMin.value &&
    !localMax.value &&
    localStepPrompt.value < 1
  );
})

const returnSteps = computed(() => {
      let steps = [];

      if (isHidePromptSteps.value) {
        return steps;
      }
      for (
        let i = localMin.value;
        i <= localMax.value;
        i += localStepPrompt.value
      ) {
        steps.push(i);
      }
      return steps;
    })
const isErrorEmpty = computed(() => {
      return props.notEmpty && resultValue.value === null;
    })
const localCanBeShownTooltip = computed(() => {
      return canBeShownTooltip.value && isVisibilityFromDependency.value;
    })
const isClassError = computed(() => {
      return (
        (localCanBeShownTooltip.value || isCanShowAllTooltips.value) &&
        isErrorEmpty.value
      );
    })
    /**
     * Возвращает цену подходящую условию, если поле отображается
     * Если не одна цена не подходит, то возвращается стандартная
     * @returns {Number|String|*}
     */const localCost = computed(() => {
      if (!isVisibilityFromDependency.value) {
        return null;
      }

      if (!initProcessingDependencyPrice.value || !props.dependencyPrices) {
        return updatedCostForOut(props.cost);
      }

      let { cost: newCost } = costAfterProcessingDependencyPrice(
        reactive({
          dependencyArrayItems: toRef(props, 'dependencyPrices'),
          formulaFieldName:  "dependencyFormulaCost",
          templateName: "UiRange",
          value: resultValue.value
        })

      );
      if (newCost !== null) {
        return updatedCostForOut(newCost);
      }
      return updatedCostForOut(props.cost);
    })
const positionStaticResultValue = computed(() => {
      updateWidthElement();
      if (resultValue.value === null) {
        return null;
      }
      const width = elementWidth.value - staticElementWidth.value / 2 - 10;

      let newPosition =
        (resultValue.value - localMin.value) / (localMax.value - localMin.value);

      if (newPosition < 0) {
        newPosition = 5;
      } else if (newPosition >= 1) {
        newPosition = width;
      } else {
        newPosition = width * newPosition - staticElementWidth.value / 10;
      }
      return newPosition + "px";
    })
const amountSteps = computed(() => {
      return (localMax.value - localMin.value) / localStepPrompt.value;
    })
const pointsForStepsLine = computed(() => {
      const rightShiftElementWidth = 21;
      const firstPointPosition = 12;
      let points = [];
      const width = elementWidth.value - rightShiftElementWidth;

      points.push(firstPointPosition);
      let i = 1;
      for (i; i <= amountSteps.value; i++) {
        const percent =
          (localStepPrompt.value * i) / (localMax.value - localMin.value);
        let position = 0;
        if (returnSteps.value[i].toString().length === 1) {
          position = width * percent + 11;
        } else {
          position = width * percent + 10;
        }

        points.push(position.toFixed(4));
      }
      return points;
    })
const isStaticValue = computed(() => {
      return (
        props.showStaticValue &&
        typeof resultValue.value === "number" &&
        isFinite(resultValue.value) &&
        positionStaticResultValue.value !== null
      );
    })
const isShowStepLine = computed(() => {
      return props.showSteps && elementWidth.value > 220;
    })





/**
 * Обработка значений поступающих извне необходим с задержкой для отображения ошибок остальных компонентов
 * @param newValue
 */
watch(() => props.rangeValue, (newValue) => {
      clearTimeout(updateValueTimer.value);
      updateValueTimer.value = setTimeout(() => {
        resultValue.value = parseFloat(newValue);
      }, 1500);
    })
watch(isVisibilityFromDependency, (newValue) => {
        if (newValue) {
          setTimeout(() => {
            elementWidth.value = thisElementInputRangeRef.value?.offsetWidth;
          }, 500);
        }
        changeValue("dependency");

    })
watch(dynamicValue, (newValue) => {
      dynamicValue.value = checkValidValueReturnNumber(newValue);
      if (resultValue.value !== dynamicValue.value) {
        changeDynamicValue();
      }
    })
watch(resultValue, (newValue) => {
      if (newValue !== dynamicValue.value) {
        dynamicValue.value = newValue;
      }
    })
watch(getSomeElementChangedSelfVisibilityState, () => {
      updatedCurrentWidth();
      setTimeout(() => {
        updateWidthElement();
      }, 10);
    })




function initBaseData(eventType = "mounted") {
      let timer = setInterval(() => {
        if (checkedValueOnVoid(props.rangeValue)) {
          resultValue.value = parseFloat(props.rangeValue);
          dynamicValue.value = parseFloat(props.rangeValue);
          changeValue(eventType);
          clearInterval(timer);
        }
      }, 100);
      setTimeout(() => {
        clearInterval(timer);
      }, 10000);
    }
function changeValueStep(step) {
      resultValue.value = checkValidValueReturnNumber(step);
      updateStaticElementWidth();
      changeValue("changeValueStep");
    }
function tryChangeValue(e) {
      clearTimeout(timerNameForLocalValue.value);
      resultValue.value = checkValidValueReturnNumber(e.target.value);
      updateStaticElementWidth();
      timerNameForLocalValue.value = setTimeout(() => {
        changeValue();
      }, 500);
    }
function changeDynamicValue() {
      resultValue.value = dynamicValue.value;
      updateStaticElementWidth();
      clearTimeout(timerNameForLocalValue.value);
      timerNameForLocalValue.value = setTimeout(() => {
        changeValue("changeDynamicValue");
      }, 500);
    }
function checkValidValueReturnNumber(checkedValue) {
      let value = !isNaN(parseFloat(checkedValue))
        ? parseFloat(checkedValue)
        : null;

      if (value > localMax.value) {
        value = localMax.value;
      }

      if (value < localMin.value) {
        value = localMin.value;
      }
      return value;
    }
function changeValue(eventType = "input") {
      updateWidthElement();
      emits("changedValue", {
        value: isVisibilityFromDependency.value ? resultValue.value : null,
        displayValue: isVisibilityFromDependency.value ? resultValue.value : null,
        name: localElementName.value,
        type: "range",
        cost: localCost.value,
        label: props.label,
        formOutputMethod:
          props.formOutputMethod !== "no" ? props.formOutputMethod : null,
        resultOutputMethod:
          props.resultOutputMethod !== "no" ? props.resultOutputMethod : null,
        excludeFromCalculations: props.excludeFromCalculations,
        isShow: isVisibilityFromDependency.value,
        unit: props.unit,
        eventType,
        formulaProcessingLogic: props.formulaProcessingLogic,
        position: props.positionElement,
        zeroValueDisplayIgnore: props.zeroValueDisplayIgnore,
      });
      tryPassDependency();
      changeValid(eventType);
      if (eventType !== "mounted") {
        shownTooltip();
      }
    }
function changeValid(eventType) {
      checkValidationDataAndToggle({
        error: isVisibilityFromDependency.value
          ? isErrorEmpty.value
          : isVisibilityFromDependency.value,
        name: localElementName.value,
        type: "range",
        label: props.label,
        eventType,
        isShow: isVisibilityFromDependency.value,
        parentName: props.parentName,
      });
    }
function tryPassDependency() {
      tryAddDependencyElement({
        name: localElementName.value,
        value: isVisibilityFromDependency.value ? resultValue.value : null,
        isShow: isVisibilityFromDependency.value,
        displayValue: isVisibilityFromDependency.value ? resultValue.value : null,
        type: "range",
      });
    }
function shownTooltip() {
      if (!canBeShownTooltip.value) {
        canBeShownTooltip.value = true;
      }
    }
function updatedCostForOut(cost) {
      return checkedValueOnVoid(cost)
        ? cost * Math.abs(resultValue.value)
        : null;
    }
function plus() {
      dynamicValue.value = checkValidValueReturnNumber(
        dynamicValue.value + localStep.value
      );
    }
function minus() {
      dynamicValue.value = checkValidValueReturnNumber(
        dynamicValue.value - localStep.value
      );
    }
function updateWidthElement() {
      if (
        elementWidth.value !== thisElementInputRangeRef.value?.offsetWidth
      ) {
        elementWidth.value = thisElementInputRangeRef.value?.offsetWidth;
      }
    }
function updateStaticElementWidth() {
      staticElementWidth.value = staticRef.value
        ? staticRef.value?.offsetWidth
        : minimalWidthStaticElement.value;
    }
function resizeUpdateWidthElement() {
      updateWidthElement();
    }
function contentLoadedUpdateWidthElement() {
      updateWidthElement();
    }



useEventListener(window, "resize", resizeUpdateWidthElement)
useEventListener(document, "DOMContentLoaded", contentLoadedUpdateWidthElement)

onMounted(() => {
  if (!props.isNeedChoice) {
    initBaseData();
  } else {
    changeValue("mounted");
  }

  updateWidthElement();
  updateStaticElementWidth();

  let timerElementInputRange = setInterval(() => {
    if (thisElementInputRangeRef.value?.offsetWidth || elementWidth.value) {
      updateWidthElement();
      clearInterval(timerElementInputRange);
    }
  }, 500);

  let timerStatic = setInterval(() => {
    if (staticRef.value?.offsetWidth) {
      updateStaticElementWidth();
      clearInterval(timerStatic);
    }
  }, 500);
})

onUnmounted(() => {
    tryDeleteAllDataOnStoreForElementName(localElementName.value);
})


</script>


<template>
  <div
    ref="parentRef"
    class="calc__wrapper-group-data isRange"
    :id="elementName"
    v-if="rangeValue !== null && isVisibilityFromDependency"
  >
    <div
      class="calc__range-wrapper"
      :class="[
        classes,
        { column: isColumn || isMakeElementColumn, static: isStaticValue },
      ]"
    >
      <icon-element-wrapper
        :icon-settings="iconSettingsRangeLabel"
        :alt="isExistLabel ? label : ''"
        :isExistLabel="isExistLabel"
      >
        <div class="calc__range-label-text" v-if="isExistLabel">
          {{ label }}
          <div class="empty-block" v-if="notEmpty">*</div>
          <slot name="prompt"></slot>
        </div>
      </icon-element-wrapper>
      <div class="calc__range-item-wrapper">
        <div class="calc__range-item-left-side">
          <input
            ref="thisElementInputRangeRef"
            class="calc__range-item"
            :class="{ isError: isClassError }"
            type="range"
            :min="localMin"
            :max="localMax"
            :step="localStep"
            :value="resultValue"
            @input="tryChangeValue"
            :name="localElementName"
          />
          <div v-if="isShowStepLine" class="calc__range-steps-wrapper">
            <div
              class="calc__range-steps-item"
              @click="changeValueStep(step)"
              v-for="(step, inx) in returnSteps"
              :style="{ left: pointsForStepsLine[inx] + 'px' }"
              :key="inx"
              :class="{
                'calc__range-steps-item_selected': step === resultValue,
              }"
            >
              <div class="calc__range-steps-item-value">{{ step }}</div>
            </div>
          </div>
          <div
            v-if="isStaticValue"
            :style="{ left: positionStaticResultValue }"
            ref="staticRef"
            class="calc__range-current-static"
          >
            {{ resultValue }}
          </div>
        </div>
        <div
          class="calc__range-current-wrapper"
          v-if="showDynamicValue || unit?.length"
        >
          <input
            class="calc__range-current-dynamic"
            :class="{ isError: isClassError }"
            v-if="showDynamicValue"
            type="text"
            v-model="dynamicValue"
            @keydown.up="plus"
            @keydown.down="minus"
          />
          <div class="calc__range-unit" v-if="unit?.length">
            {{ unit }}
          </div>
        </div>
      </div>
      <ui-tooltip
        :is-show="isErrorEmpty"
        :tooltip-text="textErrorNotEmpty"
        :local-can-be-shown="localCanBeShownTooltip || isCanShowAllTooltips"
      />
    </div>
  </div>
  <dev-block
    :label="label"
    :element-name="localElementName"
    :value="isVisibilityFromDependency ? resultValue : null"
    :local-cost="localCost"
    :is-visibility-from-dependency="isVisibilityFromDependency"
    :dependency-formula-display="dependencyFormulaDisplay"
    :parsing-formula-variables="formulaAfterProcessingVariables"
  />
</template>
