<script>
const typeElement = "DuplicatorItem";
</script>

<script setup>
import {
  ref,
  onMounted,
  watch,
  computed,
  onUnmounted,
} from "vue";
import {useBaseStore} from "@/store/baseStore";
import {useDependencyListStore} from "@/store/dependencyListStore";
import {useResultListStore} from "@/store/resultListStore";
import { useElementNamesStore } from "@/store/elementNamesStore";
import { useDisplayComponentsStore } from "@/store/displayComponentsStore";
import {useInnerVariablesStore} from "@/store/innerCustomVariableStore";
import {storeToRefs} from "pinia";

import TemplatesWrapper from "@/components/templates/calculator/TemplatesWrapper.vue";
import TemplatesWrapperColumn from "@/components/templates/columns/TemplatesWrapperColumn.vue";
import devBlock from "@/components/UI/devMode/devBlock.vue";
import TemplatesWrapperStructural from "@/components/templates/structural/TemplatesWrapperStructural.vue";
import IconElementWrapper from "@/components/supporting/icon-element-wrapper.vue";

import { propsTemplate } from "@/servises/UsePropsTemplatesSingle";
import { useLocalDependencyList } from "@/composables/useLocalDependencyList";
import { getProxyFreeVariables } from "@/composables/getProxyFreeVariables";
import {
  decimalAdjust,
  processingArrayOnFormulaProcessingLogic,
} from "@/servises/UtilityServices";
import { processingVariablesOnFormula } from "@/servises/ProcessingFormula";
import {
  REGEXP_NUMBERS,
  REGEXP_SIGN,
  REGEXP_VARIABLE,
} from "@/constants/regexp";
import { getArrayElementsFromFormula } from "@/servises/UtilityServices";
import {
  BANNED_STANDARD_NAME,
  NAME_RESERVED_VARIABLE_SUM
} from "@/constants/variables";
import { useGetOtherGlobalSum } from "@/composables/useGetOtherGlobalSum";
import {useDisplayComponents} from "@/composables/useDisplayComponents";
import errorMessage from "@/servises/devErrorMessage";


const baseStore = useBaseStore()
const dependencyStore = useDependencyListStore()
const resultStore = useResultListStore()
const displayStore = useDisplayComponentsStore()
const nameStore = useElementNamesStore()
const innerStore = useInnerVariablesStore()
const { checkedIsStructureTemplate } = storeToRefs(baseStore);
const { getResultElementByName, isResultElement } = storeToRefs(resultStore)


const emits = defineEmits(["changedValue", "duplicate", "deleteDuplicator"]);
const props = defineProps({
  duplicatorData: {
    type: Object,
    default: null,
  },
  isDuplicate: {
    type: Boolean,
    default: false,
  },
  showDuplicateButton: {
    type: Boolean,
    default: true,
  },
  originVariables: {
    type: Array,
    default: () => [],
  },
  originData: {
    type: Object,
    default: () => {},
  },
  iconSettingsDuplicatorLabel: {
    type: Object,
    default: () => {},
  },
  ...propsTemplate.getProps([
    "prompt",
    "formula",
    "parentName",
    "parentIsShow",
    "index",
    "dependencyFormulaDisplay",
    "elementName",
    "positionElement",
    "unit",
    "roundOffType",
    "signAfterDot"
  ]),
});

const counterDuplicate = ref(0);
const localResultData = ref({});
const mutationsInputData = ref(null);
const isMounted = ref(false)
const localParentName =
  props.index === 0 ? props.parentName + "_" + "0" : props.parentName;
const LOCAL_NAME_RESERVED_VARIABLE_SUM =
  NAME_RESERVED_VARIABLE_SUM + "_" + props.index;

const { localDependencyList, constructLocalListElementDependencyInFormula } =
  useLocalDependencyList();

const isVisibilityFromDependency = computed(() => {
  return props.parentIsShow
})
useDisplayComponents(mutationsInputData.value?.elementName, isVisibilityFromDependency, typeElement)

/**
 *
 * @returns {boolean}
 */
const isExistDependencyMainFormula = computed(() => {
  return Boolean(props.originData?.dependencyMainFormula?.length);
});

/**
 *
 * @type {ComputedRef<unknown>}
 */
const mainFormulaResult = computed(() => {
  if (!isExistDependencyMainFormula.value) {
    return props.formula?.length ? props.formula : "";
  }
  const formulaAfterDependency = props.originData.dependencyMainFormula?.reduce(
    (resultFormula, item) => {
      let dependencyFormula = getArrayElementsFromFormula(
        item.dependencyFormula
      );

      dependencyFormula = dependencyFormula.map((variable) => {
        if (isLocalVariable(variable)) {
          return variable + "_" + props.index;
        }
        return variable;
      });

      constructLocalListElementDependencyInFormula(dependencyFormula);
      dependencyFormula = processingVariablesOnFormula(
        dependencyFormula,
        localDependencyList
      );

      const formulaIsExist = Boolean(item?.formula?.length);
      try {
        if (eval(dependencyFormula) && formulaIsExist) {
          resultFormula = item.formula;
        }
      } catch (e) {
        errorMessage("Формула зависимости для смены главной формулы дупликатора: " + e.message, 'error')
      }
      return resultFormula;
    },
    ""
  );

  const isFormulaAfterDependency = Boolean(formulaAfterDependency?.length);
  if (isFormulaAfterDependency) {
    return formulaAfterDependency;
  }

  return props.formula?.length ? props.formula : "";
});

/**
 * Разбиваем полученную формулу на массив с переменными и знаками.
 * Избавляемся от пустых элементов.
 * @returns {*}
 */
const variablesInFormula = computed(() => {
  return getArrayElementsFromFormula(mainFormulaResult.value);
});

const variablesInFormulaExcludeSigns = computed(() => {
  return variablesInFormula.value.filter((item) => {
    const isNumber = Boolean(item?.match(REGEXP_NUMBERS));
    const isSign = Boolean(item?.match(REGEXP_SIGN));
    return !isNumber && !isSign;
  });
});

/**
 * Список переменных в формуле из глобального окружения
 * @returns {*}
 */
const listGlobalsVariables = computed(() => {
  return variablesInFormulaExcludeSigns.value.filter((item) => {
    return (
      !props.originVariables.includes(item) &&
      item !== NAME_RESERVED_VARIABLE_SUM &&
      item !== LOCAL_NAME_RESERVED_VARIABLE_SUM
    );
  });
});

/**
 * в формулу добавляем префиксы для переменных дупликатора
 * @returns {*}
 */
const attachIndexForFormulaElements = computed(() => {
  return variablesInFormula.value.map((item) => {
    if (isLocalVariable(item)) {
      item = item + "_" + props.index;
    }
    return item;
  });
});

/**
 * конечная формула после обработки в виде строки с переменными
 * @returns {*}
 */
const mutationFormulaResult = computed(() => {
  return attachIndexForFormulaElements.value.join(" ");
});

const { summaFreeVariables, usedVariablesOutsideFormula } =
  useGetOtherGlobalSum(mutationFormulaResult, true, localParentName);

/**
 * Список переменных из формулы вместе с данными
 * @returns {*}
 */
const dataListVariablesOnFormula = computed(() => {
  return attachIndexForFormulaElements.value?.map((item) => {
    const isReserveVariable = item === LOCAL_NAME_RESERVED_VARIABLE_SUM
    const isGlobalVariable = listGlobalsVariables.value.includes(item)
    const isNumber = !isNaN(Number(item))

    if (isNumber) {
      return parseFloat(item)
    } else if (isReserveVariable) {
      return getProxyFreeVariables(
        summaFreeVariables.value,
        summaFreeVariables.value,
        LOCAL_NAME_RESERVED_VARIABLE_SUM
      );
    } else if (isGlobalVariable) {
      return getResultElementByName.value(item);
    } else {
      const data = Object.values(localResultData.value).filter(
        (itemInner) => itemInner.name === item
      );
      return data.length ? data[0] : item;
    }
  });
});

/**
 * формула со всеми конечными данными и обработанными переменными
 * @returns {*}
 */
const compileFormulaWitchData = computed(() => {
  if (!variablesInFormula.value.length) {
    return summaFreeVariables.value;
  }

  return processingArrayOnFormulaProcessingLogic(
    dataListVariablesOnFormula.value
  )
    .map((item) => {
      const nameIsNotExist = !item?.name?.length;
      const isReserveVariable = item?.name === NAME_RESERVED_VARIABLE_SUM;
      const isAllowReturnLocalCost =
        usedVariablesOutsideFormula.value.includes(item.name) &&
        localResultData.value[item.name]?.isShow &&
        !item.excludeFromCalculations;
      const isAllowReturnGlobalCost =
        listGlobalsVariables.value.includes(item.name) &&
          getResultElementByName.value(item.name)?.isShow &&
        !item.excludeFromCalculations;

      if (nameIsNotExist) {
        return item;
      } else if (isReserveVariable) {
        return item.cost;
      } else if (isAllowReturnLocalCost) {
        return localResultData.value[item.name].cost;
      } else if (isAllowReturnGlobalCost) {
        return getResultElementByName.value(item.name)?.cost;
      } else {
        return "null";
      }
    })
    .join(" ")
    ?.replace(/[\+\-\*\/] *\( *\)|\( *\) *[\+\-\*\/]/g, "");
});

/**
 *
 * @returns {any|null}
 */
const localCost = computed(() => {
  const localCostIsNull =
    typeof compileFormulaWitchData.value === "string" &&
    compileFormulaWitchData.value?.includes("null");

  if (localCostIsNull) {
    return null;
  }
  try {
    const result = eval(compileFormulaWitchData.value);
    const formulaIsComputed =
      typeof result === "number" && !isNaN(result) && isFinite(result);
    if (formulaIsComputed) {
      return decimalAdjust(result, props.signAfterDot, props.roundOffType);
    } else {
      throw new Error();
    }
  } catch (e) {
    errorMessage( "Рассчитываемая формула в дупликаторе: " + compileFormulaWitchData.value, "error")
  }
});

/**
 *
 * @returns {unknown[]}
 */
const returnsLocalResultData = computed(() => {
  return Object.values(localResultData.value).sort(
    (itemA, itemB) => itemA.position - itemB.position
  );
});

/**
 *
 * @returns {boolean}
 */
const isExistLabel = computed(() => {
  return Boolean(mutationsInputData.value?.label?.toString()?.length)
});

const buttonDupleTitle = computed(() => {
  const inputTitleIsExist = Boolean(props.duplicatorData?.buttonName?.length)
  return inputTitleIsExist ? props.duplicatorData?.buttonName : 'Дублировать'
});

watch(localCost, (newValue, oldValue) => {
  if (newValue !== oldValue) {
    const event = isMounted.value ? 'dependencyCost' : 'mounted'
    const data = {};
    data.eventType = event
    changeValue(data)
  }
});

watch(
  summaFreeVariables,
  (newValue) => {
    const isShow = Boolean(newValue !== null)
    const name = LOCAL_NAME_RESERVED_VARIABLE_SUM

    innerStore.addInnerVariable({
      name,
      value: newValue,
      cost: newValue,
      isShow,
      type: typeElement,
    })
    nameStore.addNameInList({name, label: name, position: props.positionElement})
    displayStore.addDisplayComponent({isShow, name, type: name})
  },
  {
    immediate: true,
  }
);

function changeValue(data) {
  if (data?.name) {
    const mutationData = data;
    mutationData.isDuplicator = true;
    mutationData.parentName = localParentName;
    resultStore.addResultElement(mutationData);
    localResultData.value[data.name] = data;
  }
  emits("changedValue", {
    name: mutationsInputData.value.elementName,
    type: "UiDuplicator",
    label: mutationsInputData.value.label,
    cost: localCost.value,
    value: null,
    displayValue: localCost.value,
    formOutputMethod: mutationsInputData.value?.formOutputMethod,
    resultOutputMethod: mutationsInputData.value?.resultOutputMethod,
    eventType: data.eventType,
    unit: props.unit?.length ? props.unit : "",
    isShow: props.parentIsShow,
    excludeFromCalculations: mutationsInputData.value.excludeFromCalculations,
    insertedTemplates: returnsLocalResultData.value,
    position: props.positionElement,
    formulaProcessingLogic: props.originData?.formulaProcessingLogic,
  });
}

function tryDuplicate() {
  counterDuplicate.value++;
  const returnData = updateInputData(props.originData, counterDuplicate.value);
  emits("duplicate", returnData);
}

function deleteDuplicate() {
  emits("deleteDuplicator", props.duplicatorData.elementName);
}

/**
 * @param data
 * @param index
 * @returns {*}
 */
function updateInputData(data, index) {
  let mutationsData = JSON.parse(JSON.stringify(data));
  mutationsData.parentDuplicator = localParentName;
  mutationsData.isDuplicate = true;
  mutationsData.formula = mutationFormulaResult.value;
  mutationsData.index = props.index + index;
  mutationsData = updateIndexElementsInDuple(mutationsData, index);
  return mutationsData;
}

/**
 * @param object
 * @param index
 * @returns {*}
 */
function updateIndexElementsInDuple(object, index) {
  for (let prop in object) {
    const propIsElementNameField = prop === "elementName";
    const propIsDependencyField =
      (prop === "dependencyFormulaDisplay" ||
        prop === "dependencyFormulaCost" ||
        prop === "dependencyFormulaItem" ||
        prop === "dependencyFormulaHtmlText" ||
        prop === "cost") &&
      object[prop].length;
    const propsIsLabel = prop === "labelSecond" || prop === "label" || prop === "buttonText" || prop === "buttonTextChecked"
    const propIsObject = typeof object[prop] === "object";

    if (propIsObject) {
      object[prop] = updateIndexElementsInDuple(object[prop], index);
    } else if (propIsElementNameField) {
      object[prop] = updateNameItem(object, index);
    } else if (propsIsLabel) {
      object[prop] =
        object[prop]?.length && index > 0
          ? object[prop] + " ( " + index + " )"
          : object[prop];
    } else if (propIsDependencyField) {
      object[prop] = addIndexIndexInFormulaElements(object[prop], index).join(
        ""
      );
    }
  }
  return object;
}

/**
 * @param item
 * @param index
 * @returns {string}
 */
function updateNameItem(item, index) {
  item.elementName = item?.elementName?.length
    ? item?.elementName + "_" + index
    : item?.json_id + "_" + index;
  return item.elementName;
}

/**
 * в формулу добавляем префиксы для переменных дупликатора
 * @param formulaString
 * @param index
 * @returns {*}
 */
function addIndexIndexInFormulaElements(formulaString, index) {
  return getArrayElementsFromFormula(formulaString).map((item) => {
    if (isLocalVariable(item)) {
      item = item + "_" + index;
    }
    return item;
  });
}

/**
 *
 * @param item
 * @returns {boolean}
 */
function isLocalVariable(item) {
  const isVariable = Boolean(item.match(REGEXP_VARIABLE));
  const isSpecVariable = Boolean(item.match(NAME_RESERVED_VARIABLE_SUM));
  const isGlobalVariable = isResultElement.value(item);
  const isStandardName = BANNED_STANDARD_NAME.includes(item)
  return (isVariable || isSpecVariable) && !isGlobalVariable && !isStandardName;
}

onMounted(() => {
  if (props.isDuplicate) {
    mutationsInputData.value = props.duplicatorData;
  } else {
    mutationsInputData.value = updateInputData(props.duplicatorData, 0);
  }
  setTimeout(() => {
    isMounted.value = true
  }, 1000)
});

onUnmounted(() => {
  dependencyStore.deleteDependencyElementInList(LOCAL_NAME_RESERVED_VARIABLE_SUM);
  innerStore.deleteInnerVariable(LOCAL_NAME_RESERVED_VARIABLE_SUM)
  nameStore.deleteNameInList(LOCAL_NAME_RESERVED_VARIABLE_SUM)
  displayStore.deleteDisplayInList(LOCAL_NAME_RESERVED_VARIABLE_SUM)
});
</script>

<template>
  <div
    class="calc__duplicator-wrapper"
    v-if="mutationsInputData?.templates.length"
  >
    <icon-element-wrapper
      :icon-settings="iconSettingsDuplicatorLabel"
      :alt="isExistLabel ? mutationsInputData.label : ''"
      :is-exist-label="isExistLabel"
    >
      <div class="calc__duplicator-label" v-if="isExistLabel">
        {{ mutationsInputData.label }}
      </div>
      <slot name="prompt" />
    </icon-element-wrapper>
    <template
      v-for="(template, inx) in mutationsInputData?.templates"
      :key="index + '_' + inx"
    >
      <templates-wrapper-structural
        v-if="checkedIsStructureTemplate(template?.template)"
        :parent-is-show="parentIsShow"
        :template="template"
        :index="index + '_' + inx"
        :options="{isDuplicator: true, index: index ? index : 0}"
        @changedValue="changeValue"
      />
      <templates-wrapper-column
        v-if="template?.template === 'UiColumns'"
        :parent-is-show="parentIsShow"
        :template="template"
        :index="index + '_' + inx"
        :parent-name="mutationsInputData.elementName"
        :options="{isDuplicator: true, index: index ? index : 0}"
        @changedValue="changeValue"
      />
      <templates-wrapper
        v-else
        :parent-is-show="parentIsShow"
        :template="template"
        :index="index + '_' + inx"
        :parent-name="mutationsInputData.elementName"
        :options="{isDuplicator: true, index: index ? index : 0}"
        @changedValue="changeValue"
      />
    </template>
    <button
      v-if="!isDuplicate && showDuplicateButton"
      class="calc__duplicator-duplicate"
      @click="tryDuplicate"
    >
      {{ buttonDupleTitle }}
    </button>
    <button
      v-if="isDuplicate"
      class="calc__duplicator-delete"
      @click="deleteDuplicate"
    >
      X
    </button>
  </div>
  <dev-block
    :type-element="typeElement"
    :element-name="mutationsInputData?.elementName"
    :local-cost="localCost"
    :calculated-formula="mutationFormulaResult"
    hidden-value
  />
</template>
