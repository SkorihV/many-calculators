<script setup>
import UiTooltip from "@/components/UI/other/UiTooltip.vue";
import devBlock from "@/components/UI/devMode/c_devBlock.vue";
import IconElementWrapper from "@/components/UI/supporting/icon-element-wrapper.vue";

import {useDisplaySpinner} from "@/composables/useDisplaySpinner";
import { propsTemplate } from "@/servises/UsePropsTemplatesSingle";
import {getBaseStoreGetters, getBaseStoreAction} from "@/composables/useBaseStore";
import {computed, onMounted, onUnmounted, reactive, ref, toRef, watch} from "vue";
import {useLocalDependencyList} from "@/composables/useLocalDependencyList";
import {useProcessingFormula} from "@/composables/useProcessingFormula";
import {checkedValueOnVoid} from "@/servises/UtilityServices"
import {getCurrentWidthElement, getIsMakeElementColumn} from "@/composables/useWidthElement";
import goScrollToElement from "@/components/UI/mainCalculated/UiCheckbox/goScrollToElement";
import {useIsCheckedType} from "@/components/UI/mainCalculated/UiCheckbox/useIsCheckedType";

import {useInitProcessingDependencyPrice} from "@/composables/useInitProcessingDependencyPrice";
import {useReportInitialStatusForElement} from "@/composables/useReportInitialStatusForElement";


const emits = defineEmits(["changedValue"])
const props = defineProps({
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
  buttonText: {
    type: String,
    require: true,
  },
  buttonTextChecked: {
    type: String,
    require: true,
  },
  scrollIntoName: {
    type: String,
    default: null,
  },
  costForVoid: {
    type: [String, Number],
    default: null,
    validator(value) {
      return !isNaN(Number(value));
    },
  },
  iconSettingsCheckboxLabel: {
    type: Object,
    default: () => {},
  },
  ...propsTemplate.getProps([
    "formOutputMethod",
    "resultOutputMethod",
    "isNeedChoice",
    "dependencyPrices",
    "cost",
    "dependencyFormulaDisplay",
    "parentIsShow",
    "label",
    "excludeFromCalculations",
    "elementName",
    "parentName",
    "formulaProcessingLogic",
    "classes",
    "templateName",
    "positionElement",
    "isColumn",
    "zeroValueDisplayIgnore",
    "baseValue",
  ]),
})

const currentLocalTextButton = ref("")
const isLocalChecked = ref(null)
const textErrorNotEmpty = ref("Обязательное поле.")
const canBeShownTooltip = ref(false)
const isChecked = ref(false) // активирована
const notActive = ref(false) // невозможно активировать
const checkboxValue = ref(false) // начальное значение
const parentRef = ref(null)

const {isCanShowAllTooltips} = getBaseStoreGetters()
const {checkValidationDataAndToggle, tryAddDependencyElement, tryDeleteAllDataOnStoreForElementName, tryToggleElementIsMounted} = getBaseStoreAction(["tryAddDependencyElement", "checkValidationDataAndToggle", "tryToggleElementIsMounted",
  "tryDeleteAllDataOnStoreForElementName",])
const {localDependencyList, constructLocalListElementDependencyInFormula} = useLocalDependencyList()
const {isVisibilityFromDependency, costAfterProcessingDependencyPrice, formulaAfterProcessingVariables} = useProcessingFormula(
    reactive({
      formula: toRef(props, "dependencyFormulaDisplay"),
      parentIsShow: toRef(props, 'parentIsShow'),
      localDependencyList: localDependencyList,
      constructLocalListElementDependencyInFormula
    })
)
useReportInitialStatusForElement(toRef(props, 'parentIsShow'),  changeValue, changeValid)
useDisplaySpinner(props.elementName)

const {currentWidthElement} = getCurrentWidthElement(isVisibilityFromDependency, parentRef)
const isExistLabel = computed(() => {
  return Boolean(props.label.toString()?.length);
})
const {isMakeElementColumn} = getIsMakeElementColumn(currentWidthElement, isExistLabel)
const {initProcessingDependencyPrice} = useInitProcessingDependencyPrice(toRef(props, 'dependencyPrices'))
const {isBase, isButton, isSwitcher, isSwitcherVertical} = useIsCheckedType(props.typeDisplayClass)

onMounted(() => {
  checkboxValue.value = props.baseValue === "active";
  isChecked.value = props.baseValue === "selected";
  notActive.value = props.baseValue === "notActive";

  if (!props.isNeedChoice) {
    isLocalChecked.value= Boolean(checkboxValue.value || isChecked.value);
  }
  if (isLocalChecked.value) {
    currentLocalTextButton.value = props.buttonTextChecked?.length
        ? props.buttonTextChecked
        : props.buttonText;
  } else {
    currentLocalTextButton.value = props.buttonText;
  }
  changeValue("mounted");
})

const localElementName = computed(() => {
    return checkedValueOnVoid(props.elementName)
        ? props.elementName
        : Math.random().toString();
  })

const isErrorEmpty = computed(() => {
    return Boolean(props.isNeedChoice && !isLocalChecked.value);
})
const isErrorClass = computed(() => {
  return Boolean(
      isErrorEmpty.value &&
      isVisibilityFromDependency.value &&
      isCanShowAllTooltips.value
  );
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
  if (!initProcessingDependencyPrice.value || !props.dependencyPrices) {
    return isLocalChecked.value&& checkedValueOnVoid(props.cost)
        ? parseFloat(props.cost)
        : !isLocalChecked.value&& checkedValueOnVoid(props.costForVoid)
            ? parseFloat(props.costForVoid)
            : null;
  }

  let { cost: newCost } = costAfterProcessingDependencyPrice(
      reactive({
        dependencyArrayItems: toRef(props, 'dependencyPrices'),
        formulaFieldName:  "dependencyFormulaCost"
      })
  );

  if (newCost !== null) {
    return newCost;
  }
  return isLocalChecked.value&& checkedValueOnVoid(props.cost)
      ? parseFloat(props.cost)
      : !isLocalChecked.value&& checkedValueOnVoid(props.costForVoid)
          ? parseFloat(props.costForVoid)
          : null;
})

watch(isVisibilityFromDependency, (value) => {
  if (value) {
    isLocalChecked.value = !props.isNeedChoice
        ? Boolean(checkboxValue.value || isChecked.value)
        : null;
  } else {
    isLocalChecked.value = null;
  }
  changeValue("dependency");
})

function inputLocalValue() {
  if (notActive.value) {
    return null;
  }
  if (!isChecked.value) {
    isLocalChecked.value = !isLocalChecked.value;
  }
  currentLocalTextButton.value =
      isLocalChecked.value && props.buttonTextChecked?.length
          ? props.buttonTextChecked
          : props.buttonText;
  changeValue("click");
}
function changeValue(eventType = "click") {
  emits("changedValue", {
    value: isVisibilityFromDependency.value ? isLocalChecked.value: null,
    displayValue: isLocalChecked.value? "Да" : "Нет",
    name: localElementName.value,
    type: "UiCheckbox",
    label: props.label || props.buttonText,
    cost: localCost.value,
    formOutputMethod:
        props.formOutputMethod !== "no" ? props.formOutputMethod : null,
    resultOutputMethod:
        props.resultOutputMethod !== "no" ? props.resultOutputMethod : null,
    excludeFromCalculations: props.excludeFromCalculations,
    isShow: isVisibilityFromDependency.value,
    eventType,
    formulaProcessingLogic: props.formulaProcessingLogic,
    position: props.positionElement,
    zeroValueDisplayIgnore: props.zeroValueDisplayIgnore,
  });
  tryPassDependency();
  changeValid(eventType);
  if (isLocalChecked.value && props.scrollIntoName) {
    goScrollToElement(props.scrollIntoName);
  }
}
function changeValid(eventType) {
  checkValidationDataAndToggle({
    error: isVisibilityFromDependency.value
        ? isErrorEmpty.value
        : isVisibilityFromDependency.value,
    name: localElementName.value,
    type: "UiCheckbox",
    label: props.label,
    eventType,
    isShow: isVisibilityFromDependency.value,
    parentName: props.parentName,
  });
  if (eventType !== "mounted") {
    canBeShownTooltip.value = true;
  }
}
function tryPassDependency() {
  tryAddDependencyElement({
    name: localElementName.value,
    value: isVisibilityFromDependency.value ? isLocalChecked.value: null,
    isShow: isVisibilityFromDependency.value,
    displayValue: currentLocalTextButton.value,
    type: "UiCheckbox",
  });
}

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
      class="calc__checkbox-wrapper"
      :class="[classes, { column: isColumn || isMakeElementColumn }]"
    >
      <icon-element-wrapper
        :icon-settings="iconSettingsCheckboxLabel"
        :alt="isExistLabel ? label : ''"
        :isExistLabel="isExistLabel"
      >
        <div class="calc__checkbox-label-text" v-if="isExistLabel">
          {{ label }}
          <div class="empty-block" v-if="isNeedChoice">*</div>
          <slot name="prompt" v-if="isExistLabel"></slot>
        </div>
      </icon-element-wrapper>
      <div @click="inputLocalValue" class="calc__checkbox-control-wrapper">
        <div
          class="calc__checkbox-control-button"
          v-if="isButton"
          :class="{
            checked: isLocalChecked,
            error: isErrorClass,
          }"
        >
          {{ currentLocalTextButton }}
          <slot name="prompt"></slot>
        </div>
        <div
          class="calc__checkbox-control-base"
          v-if="isBase || isSwitcher || isSwitcherVertical"
          :class="{
            switcher: isSwitcher || isSwitcherVertical,
            checked: isLocalChecked,
            error: isErrorClass,
          }"
        >
          <div class="calc__checkbox-control-text">
            <template v-if="isSwitcher || isSwitcherVertical">
              {{ buttonText }}
            </template>
            <template v-if="isBase">
              {{ currentLocalTextButton }}
            </template>
            <div class="empty-block" v-if="!isExistLabel && isNeedChoice">
              *
            </div>
            <slot name="prompt" v-if="!isExistLabel"></slot>
          </div>
          <div
            class="calc__checkbox-control-element"
            :class="{
              base: isBase,
              switcher: isSwitcher || isSwitcherVertical,
              'switcher-vertical': isSwitcherVertical,
              checked: isLocalChecked,
              error: isErrorClass,
            }"
          ></div>
          <div
            class="calc__checkbox-control-text_checked"
            v-if="
              (isSwitcher || isSwitcherVertical) && buttonTextChecked?.length
            "
          >
            {{ buttonTextChecked }}
          </div>
        </div>
        <ui-tooltip
          :is-show="isErrorEmpty"
          :tooltip-text="textErrorNotEmpty"
          :local-can-be-shown="isVisibilityFromDependency && canBeShownTooltip"
        />
      </div>
    </div>
  </div>
  <dev-block
    :label="label"
    :element-name="localElementName"
    :value="isLocalChecked"
    :local-cost="localCost"
    :is-visibility-from-dependency="isVisibilityFromDependency"
    :dependency-formula-display="dependencyFormulaDisplay"
    :parsing-formula-variables="formulaAfterProcessingVariables"
  />
</template>
