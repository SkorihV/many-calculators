<script>
const typeElement = "UiSelect";
</script>

<script setup>
import {
  onMounted,
  reactive,
  ref,
  onUnmounted,
  watch,
  nextTick,
  computed,
  toRef,
} from "vue";
import {useBaseStore} from "@/store/baseStore";
import {useDependencyListStore} from "@/store/dependencyListStore";
import {useValidationListStore} from "@/store/validationListStore";
import {storeToRefs} from "pinia";

import UiTooltip from "@/components/UI/other/UiTooltip.vue";
import UiPrompt from "@/components/UI/other/UiPrompt.vue";
import devBlock from "@/components/UI/devMode/devBlock/devBlock.vue";
import IconElementWrapper from "@/components/UI/supporting/icon-element-wrapper.vue";
import { propsTemplate } from "@/servises/UsePropsTemplatesSingle";

import { useDisplaySpinner } from "@/composables/useDisplaySpinner";
import { useEventListener } from "@/composables/useEventsListener";
import { checkedValueOnVoid } from "@/servises/UtilityServices";
import { useProcessingFormula } from "@/composables/useProcessingFormula";
import { useLocalDependencyList } from "@/composables/useLocalDependencyList";
import { processingVariablesOnFormula } from "@/servises/ProcessingFormula";
import {
  getCurrentWidthElement,
  getIsMakeElementColumn,
} from "@/composables/useWidthElement";
import { useReportInitialStatusForElement } from "@/composables/useReportInitialStatusForElement";

import { getArrayElementsFromFormula } from "@/servises/UtilityServices";
import { useHighlightElement } from "@/composables/useHighlightElement";
import {useDisplayComponents} from "@/composables/useDisplayComponents";
import { useElementNameList } from "@/composables/useElementNameList";

const emits = defineEmits(["changedValue"]);
const props = defineProps({
  selectValues: {
    type: Array,
    default: () => [],
  },
  /**
   * номер выбранного селекта
   */
  selectedItem: {
    type: [Number, String],
    default: 1,
    validator(value) {
      return !isNaN(Number(value));
    },
  },
  isSearch: {
    type: [Boolean, Number],
    default: false,
    validator(value) {
      return value === false || value === true || value === 0 || value === 1;
    },
  },
  iconSettingsSelectLabel: {
    type: Object,
    default: () => {},
  },
  ...propsTemplate.getProps([
    "isColumn",
    "isStretch",
    "isNeedChoice",
    "formOutputMethod",
    "resultOutputMethod",
    "label",
    "notEmpty",
    "excludeFromCalculations",
    "elementName",
    "parentName",
    "formulaProcessingLogic",
    "classes",
    "templateName",
    "parentIsShow",
    "dependencyFormulaDisplay",
    "positionElement",
    "zeroValueDisplayIgnore",
    "globalMaxWidth",
    "globalMaxHeight",
  ]),
});

const mockOption = {
  selectName: "Не выбрано!",
  value: null,
  isShow: true,
  cost: null,
};

const searchField = ref("");
const isOpen = ref(true);
const currentOption = ref(null);
const currentIndexOption = ref(null);
const textErrorNotEmpty = ref("Обязательное поле.");

const localSelectValues = ref([]);
const canBeShownTooltip = ref(false);
const hoverElementIndex = ref(null);
const maxWidthSelectList = ref(null);
const localSelectedItem = ref(1);

const optionList = ref(null);
const changeElement = ref(null);
const parentRef = ref(null);
const selectRef = ref(null);

const baseStore = useBaseStore()
const { devMode, isCanShowAllTooltips } = storeToRefs(baseStore);
const dependencyStore = useDependencyListStore()
const {isDependencyElement} = storeToRefs(dependencyStore)
const validationStore = useValidationListStore()


const { localDependencyList, constructLocalListElementDependencyInFormula } =
  useLocalDependencyList();
const {
  isVisibilityFromDependency,
  costAfterProcessingDependencyPrice,
  formulaAfterProcessingVariables,
} = useProcessingFormula(
  reactive({
    localDependencyList: localDependencyList,
    constructLocalListElementDependencyInFormula,
    formula: toRef(props, "dependencyFormulaDisplay"),
    parentIsShow: toRef(props, "parentIsShow"),
  })
);


useReportInitialStatusForElement(
  toRef(props, "parentIsShow"),
  changeValue,
  changeValid
);
const { currentWidthElement } = getCurrentWidthElement(
  isVisibilityFromDependency,
  parentRef
);

const isExistLabel = computed(() => {
  return Boolean(props.label?.toString().length);
});
const { isMakeElementColumn } = getIsMakeElementColumn(
  currentWidthElement,
  isExistLabel
);

const isExistCurrentPrompt = computed(() => {
  return Boolean(currentOption.value?.prompt?.length);
});

const currentAmountSelectList = computed(() => {
  return Object.values(selectValuesAfterProcessingDependency.value)?.filter(
    (item) => item?.isShow
  )?.length;
});

const isShowArrow = computed(() => {
  return Boolean(currentAmountSelectList.value > 1);
});

const needMockValue = computed(() => {
  return props.notEmpty || props.isNeedChoice;
});

const localElementName = computed(() => {
  return checkedValueOnVoid(props.elementName)
    ? props.elementName
    : Math.random().toString();
});

const { isHighlightElement } = useHighlightElement(localElementName);
useDisplaySpinner(localElementName.value);
useDisplayComponents(localElementName.value, isVisibilityFromDependency, typeElement)
useElementNameList({name: localElementName.value, label: props.label, position: props.positionElement})

const isCurrentIndexOptionsNotExist = computed(() => {
  return currentIndexOption.value === null;
});

const isErrorEmpty = computed(() => {
  return props.notEmpty && isCurrentIndexOptionsNotExist.value;
});

const isErrorClass = computed(() => {
  return (
    isErrorEmpty.value &&
    isCanShowAllTooltips.value &&
    isVisibilityFromDependency.value
  );
});

/**
 * Возвращает цену подходящую условию, если моле отображается
 * Если не одна цена не подходит, то возвращается стандартная
 * @returns {Number|String|*}
 */
const localCost = computed(() => {
  if (
    isCurrentIndexOptionsNotExist.value ||
    !isVisibilityFromDependency.value
  ) {
    return null;
  }
  if (!currentOption.value?.dependencyPrices?.length) {
    return currentOption.value?.cost ? currentOption.value?.cost : null;
  }

  let { cost: newCost } = costAfterProcessingDependencyPrice(
    reactive({
      dependencyArrayItems: currentOption.value?.dependencyPrices,
      formulaFieldName: "dependencyFormulaCost",
    })
  );

  if (newCost !== null) {
    return newCost;
  }
  return currentOption.value?.cost ? currentOption.value?.cost : null;
});

const currentOptionDisplayValue = computed(() => {
  if (
    (needMockValue.value && isCurrentIndexOptionsNotExist.value) ||
    !isVisibilityFromDependency.value
  ) {
    return null;
  }

  return currentOption.value?.selectName;
});

const currentOptionValue = computed(() => {
  if (
    (needMockValue.value && isCurrentIndexOptionsNotExist.value) ||
    !isVisibilityFromDependency.value
  ) {
    return null;
  }

  const isExistExtraValue = Boolean(
    currentOption.value?.extraValueForDependency?.toString()?.length
  );

  return isExistExtraValue
    ? currentOption.value?.extraValueForDependency
    : !isNaN(parseInt(currentOption?.value?.value))
    ? currentOption?.value?.value
    : null;
});

const mutationSelectValue = computed(() => {
  return localSelectValues.value.map((selectItem, index) => {
    const localIndex = needMockValue.value ? index : index + 1;
    selectItem.value = selectItem.value?.toString()?.length
      ? selectItem.value
      : localIndex;
    return selectItem;
  });
});

/**
 * Получить список селектов после обработки формул на отображение самих селектов
 * @returns {*[]}
 */
const selectValuesAfterProcessingDependency = computed(() => {
  return mutationSelectValue.value
    .map((selectItem) => {
      const extraValueIsExist = Boolean(
        selectItem?.extraValueForDependency?.toString()?.length
      );

      if (!selectItem?.dependencyFormulaItem?.length) {
        selectItem.isShow = true;
        return selectItem;
      }

      let formula = getArrayElementsFromFormula(
        selectItem.dependencyFormulaItem
      );
      constructLocalListElementDependencyInFormula(formula);

      let allDependencyShow = formula.every((item) => {
        if (isDependencyElement.value(item)) {
          return localDependencyList[item]?.isShow;
        }
        return true;
      });

      if (!allDependencyShow) {
        selectItem.isShow = true;
        return selectItem;
      }

      formula = formula.map((item) => {
        if (item.toLowerCase() === "_self_" && extraValueIsExist) {
          return '"' + selectItem?.extraValueForDependency + '"';
        } else if (item.toLowerCase() === "_self_" && !extraValueIsExist) {
          return selectItem.value;
        }
        return item;
      });

      formula = processingVariablesOnFormula(formula, localDependencyList);

      let newDataIsShow;
      try {
        newDataIsShow = eval(formula);
      } catch (e) {
        if (devMode.value) {
          console.error(e.message, formula);
        }
        newDataIsShow = false;
      }
      selectItem.isShow = newDataIsShow;
      const valueInDependency = Boolean(
        selectItem?.extraValueForDependency?.toString()?.length
      )
        ? selectItem?.extraValueForDependency
        : selectItem.value;
      if (!newDataIsShow && valueInDependency === currentOptionValue) {
        resetSelectedValue();
      }
      return selectItem;
    })
    .filter((selectItem) => {
      if (props.isSearch && searchField.value?.length) {
        return (
          selectItem.selectName
            .toLowerCase()
            .indexOf(searchField.value.toLowerCase()) !== -1
        );
      }
      return selectItem;
    });
});

const maxWidthForChangeElement = computed(() => {
  return maxWidthSelectList.value
    ? "max-width:" + maxWidthSelectList.value + "px; width: 100%;"
    : null;
});

const maxWidthForOptionList = computed(() => {
  return maxWidthSelectList.value
    ? "max-width:" + maxWidthSelectList.value + "px; width: 100%;"
    : null;
});

watch(isOpen, (newValue) => {
  if (newValue && !Object.keys(localDependencyList)?.length) {
    localSelectValues.value?.forEach((select) => {
      if (select?.dependencyFormulaItem?.length) {
        let formula = getArrayElementsFromFormula(select.dependencyFormulaItem);
        constructLocalListElementDependencyInFormula(formula);
      }
    });
  }
  if (newValue) {
    nextTick(() => {
      updatedWidthSelect();
    });
  }
});

watch(isVisibilityFromDependency, (newValue, oldValue) => {
  if (newValue && !oldValue) {
    resetWidthSelect();
    initSelect("dependency");
  } else {
    changeValue("dependency");
  }
  if (!newValue) {
    resetSelectedValue();
  }
});

watch(
  localCost,
  () => {
    changeValue("dependency");
  },
  { deep: true }
);

watch(
  () => currentOption,
  (newValue) => {
    if (newValue.value?.isShow === false) {
      initSelect();
    }
  },
  { deep: true }
);

function initSelectMockData(eventType = "mounted") {
  if (needMockValue.value) {
    changeSelect(localSelectValues.value[0], null, eventType);
  }
}

function initSelectData(eventType = "mounted") {
  if (localSelectValues.value.length) {
    localSelectedItem.value = !!parseInt(props.selectedItem)
      ? parseInt(props.selectedItem) - 1
      : 0;
    currentIndexOption.value =
      checkedValueOnVoid(localSelectedItem.value) &&
      localSelectedItem.value < localSelectValues.value.length
        ? localSelectedItem.value
        : 0;

    changeSelect(
      localSelectValues.value[currentIndexOption.value],
      currentIndexOption.value,
      eventType
    );
  }
}

function open() {
  if (
    selectValuesAfterProcessingDependency.value.filter(
      (option) => option.isShow
    ).length > 1
  ) {
    isOpen.value = true;
  }
}

function toggleOpenClose() {
  if (
    selectValuesAfterProcessingDependency.value.filter(
      (option) => option.isShow
    ).length > 1
  ) {
    isOpen.value = !isOpen.value;
  }
}

function close() {
  isOpen.value = false;
}

function changeSelect(item, inx, eventType = "click") {
  if (needMockValue.value && inx === 0) {
    currentIndexOption.value = null;
  } else {
    currentIndexOption.value = inx;
  }
  currentOption.value = item;
  setTimeout(() => {
    changeValue(eventType);
  }, 100);
  close();
}

function changeValue(eventType = "click") {
  emits("changedValue", {
    value: currentOptionValue.value,
    displayValue: currentOptionDisplayValue.value,
    index: currentIndexOption.value,
    name: localElementName.value,
    type: "select",
    cost: localCost.value,
    label: props.label,
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
}

function changeValid(eventType) {
  validationStore.checkValidationDataAndToggle({
    error: isVisibilityFromDependency.value
      ? isErrorEmpty.value
      : isVisibilityFromDependency.value,
    name: localElementName.value,
    type: "select",
    label: props.label,
    eventType,
    isShow: isVisibilityFromDependency.value,
    parentName: props.parentName,
  });
  if (eventType === "click") {
    canBeShownTooltip.value = true;
  }
}

function tryPassDependency() {
  dependencyStore.addDependencyElement({
    name: localElementName.value,
    value: currentOptionValue.value,
    isShow: isVisibilityFromDependency.value,
    displayValue: currentOptionDisplayValue,
    type: "select",
  });
}

function resetSelectedValue() {
  nextTick(() => {
    let length = selectValuesAfterProcessingDependency.value.length;
    for (let i = 0; i < length; i++) {
      let currentOptionItem = selectValuesAfterProcessingDependency.value[i];
      if (currentOptionItem.isShow) {
        changeSelect(currentOptionItem, i, "changeAmountSelectList");
        return;
      }
    }
  });
}

function resetWidthSelect() {
  maxWidthSelectList.value = null;
}

function updatedWidthSelect() {
  if (
    optionList.value?.offsetWidth === 0 ||
    changeElement.value?.offsetWidth === 0 ||
    maxWidthSelectList.value !== null
  ) {
    return false;
  }
  setTimeout(() => {
    if (optionList.value?.offsetWidth > changeElement.value?.offsetWidth) {
      maxWidthSelectList.value = optionList.value?.offsetWidth;
    } else {
      maxWidthSelectList.value = changeElement.value?.offsetWidth;
    }
  }, 100);
}

function clickClose(e) {
  if (!selectRef?.value?.contains(e.target)) {
    close();
  }
}

function initSelect(eventType) {
  if (needMockValue.value) {
    initSelectMockData(eventType);
  } else {
    initSelectData(eventType);
  }
}


useEventListener(window, "click", clickClose);

onMounted(() => {
  localSelectValues.value = props.selectValues;

  if (needMockValue.value) {
    localSelectValues.value.unshift(mockOption);
  }

  initSelect("mounted");
  setTimeout(() => {
    updatedWidthSelect();
  }, 200);
});
onUnmounted(() => {
  baseStore.tryDeleteAllDataOnStoreForElementName(localElementName.value);
});
</script>

<template>
  <div
    class="calc__wrapper-group-data"
    :class="{ 'is-highlight': isHighlightElement }"
    ref="parentRef"
    v-if="isVisibilityFromDependency"
    :id="localElementName"
  >
    <div
      class="calc__select-wrapper"
      :class="[
        { column: isColumn || isMakeElementColumn, open: isOpen },
        classes,
      ]"
      ref="selectRef"
    >
      <icon-element-wrapper
        :icon-settings="iconSettingsSelectLabel"
        :alt="isExistLabel ? label : ''"
        :isExistLabel="isExistLabel"
      >
        <div class="calc__select-label-text" v-if="isExistLabel">
          {{ label }}
          <div class="empty-block" v-if="notEmpty">*</div>
          <slot name="prompt"></slot>
        </div>
      </icon-element-wrapper>
      <div class="calc__select-wrapper-right-side">
        <div
          class="calc__select-change-wrapper"
          ref="changeElement"
          :style="[maxWidthForChangeElement]"
          :class="{ error: isErrorClass, stretch: isStretch }"
        >
          <div
            v-if="currentOption"
            class="calc__select-change-item"
            @click="toggleOpenClose"
            @mouseover="hoverElementIndex = 'main'"
            @mouseleave="hoverElementIndex = null"
          >
            <icon-element-wrapper
              :alt="currentOption?.selectName"
              :icon-settings="currentOption?.iconSettingsSelectItem"
              :global-max-width="globalMaxWidth"
              :global-max-height="globalMaxHeight"
              :is-parent-hover="hoverElementIndex === 'main'"
            >
              {{ currentOption.selectName }}
            </icon-element-wrapper>
            <ui-prompt
              v-if="isExistCurrentPrompt"
              :prompt-text="currentOption.prompt"
            />
            <div class="calc__select-arrow" v-if="isShowArrow"></div>
          </div>
          <div
            class="calc__select-option-wrapper"
            :class="{ stretch: isStretch }"
            :style="[maxWidthForOptionList]"
            ref="optionList"
            v-show="isOpen"
          >
            <input
              class="calc__select-option-search"
              type="text"
              v-if="isSearch"
              v-model="searchField"
            />
            <div class="calc__select-option-list">
              <template
                v-for="(option, idx) in selectValuesAfterProcessingDependency"
                :key="idx"
              >
                <div
                  class="calc__select-option-item"
                  @click="changeSelect(option, idx)"
                  v-if="currentOption?.value !== option?.value && option.isShow"
                  @mouseover="hoverElementIndex = idx"
                  @mouseleave="hoverElementIndex = null"
                >
                  <icon-element-wrapper
                    :alt="option?.selectName"
                    :icon-settings="option?.iconSettingsSelectItem"
                    :global-max-width="globalMaxWidth"
                    :global-max-height="globalMaxHeight"
                    :is-parent-hover="hoverElementIndex === idx"
                  >
                    <div class="calc__select-option-item-text">
                      {{ option.selectName }}
                    </div>
                  </icon-element-wrapper>
                  <ui-prompt
                    v-if="option?.prompt?.length"
                    :prompt-text="option.prompt"
                  />
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
      <ui-tooltip
        :is-show="isErrorEmpty"
        :tooltip-text="textErrorNotEmpty"
        :local-can-be-shown="isVisibilityFromDependency && canBeShownTooltip"
      />
    </div>
    <dev-block
      :label="label || localElementName"
      :type-element="typeElement"
      :element-name="localElementName"
      :value="currentOptionValue"
      :local-cost="localCost"
      :is-visibility-from-dependency="isVisibilityFromDependency"
      :dependency-formula-display="dependencyFormulaDisplay"
    />
  </div>
</template>
