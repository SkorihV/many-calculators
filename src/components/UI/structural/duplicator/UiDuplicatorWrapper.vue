<script setup>
import TemplatesWrapper from "@/components/UI/supporting/TemplatesWrapper.vue";
import TemplatesWrapperColumn from "@/components/UI/supporting/TemplatesWrapperColumn.vue";
import devBlock from "@/components/UI/devMode/c_devBlock.vue";
import TemplatesWrapperStructural from "@/components/UI/supporting/TemplatesWrapperStructural.vue";
import IconElementWrapper from "@/components/UI/supporting/icon-element-wrapper.vue";

import { ref, onMounted, watch, computed, reactive, toRef } from "vue";
import {getBaseStoreGetters, getBaseStoreAction} from "@/composables/useBaseStore";
import { propsTemplate } from "@/servises/UsePropsTemplatesSingle";
import {useProcessingFormula} from "@/composables/useProcessingFormula";
import {useLocalDependencyList} from "@/composables/useLocalDependencyList";
import {useUtilityServices} from "@/composables/useUtilityServices";
import {getProxyFreeVariables} from "@/composables/getProxyFreeVariables";
import {
  decimalAdjust,
  processingArrayOnFormulaProcessingLogic,
} from "@/servises/UtilityServices";
import { processingVariablesOnFormula } from "@/servises/ProcessingFormula";


const {devMode, checkedIsStructureTemplate, getNameReserveVariable, getResultElementOnName,} = getBaseStoreGetters()
const {tryAddResultElement} = getBaseStoreAction(['tryAddResultElement'])

const emits = defineEmits(["changedValue", "duplicate", "deleteDuplicator"])
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
  ]),
})


const counterDuplicate = ref(0)
const localResultData = ref({})
const mutationsInputData = ref(null)
const regExpStringSplitFormula =  /(\)|\(|>=|<=|<|>|!==|===|&&|\|\||\+|-|\/|\*)|(^[0-9]+(\.[0-9]+)?)/

const {localDependencyList, constructLocalListElementDependencyInFormula} = useLocalDependencyList()
const {isVisibilityFromDependency, costAfterProcessingDependencyPrice, formulaAfterProcessingVariables} = useProcessingFormula(  reactive({
  localDependencyList: localDependencyList,
  constructLocalListElementDependencyInFormula,
  formula: toRef(props,"dependencyFormulaDisplay"),
  parentIsShow: toRef(props, "parentIsShow")
}))
const {getArrayElementsFromFormula} = useUtilityServices()

/**
 *
 * @returns {boolean}
 */
const isExistDependencyMainFormula = computed(() => {
  return Boolean(props.originData?.dependencyMainFormula?.length);
})
/**
 *
 * @returns {*|{length}|T|(function(): {default: string, type: String | StringConstructor})|string}
 */
const mainFormulaResult = computed(() => {
  if (!isExistDependencyMainFormula.value) {
    return props.formula?.length ? props.formula : "";
  }
  const formulaAfterDependency =
    props.originData.dependencyMainFormula?.reduce((resultFormula, item) => {
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
        if (devMode.value) {
          console.error(
            "Формула зависимости для смены главной формулы дупликатора: " +
            e.message
          );
        }
      }
      return resultFormula;
    }, "");

  const isFormulaAfterDependency = Boolean(formulaAfterDependency?.length);
  if (isFormulaAfterDependency) {
    return formulaAfterDependency;
  }

  return props.formula?.length ? props.formula : "";
})
/**
 *
 * @returns {boolean}
 */
const mainFormulaIsExist = computed(() => {
  return Boolean(mainFormulaResult.value?.length);
})
/**
 * Разбиваем полученную формулу на массив с переменными и знаками.
 * Избавляемся от пустых элементов.
 * @returns {*}
 */
const variablesInFormula = computed(() => {
  return getArrayElementsFromFormula(mainFormulaResult.value);
})
/**
 * Список переменных в формуле из глобального окружения
 * @returns {*}
 */
const listGlobalsVariables = computed(() => {
  return variablesInFormula.value.filter(
    (item) =>
      !props.originVariables.includes(item) &&
      !Boolean(item?.match(regExpStringSplitFormula)) &&
      item !== getNameReserveVariable.value
  );
})
/**
 * Список локальных переменных используемых в формуле
 * @returns {*}
 */
const listLocalVariablesUsedInFormula = computed(() => {
  return variablesInFormula.value.filter((item) =>
    isLocalVariable(item)
  );
})
/**
 * Список локальных переменных используемых в формуле c префиксом
 * @returns {*}
 */
const listLocalVariablesUsedInFormulaForPrefix = computed(() => {
  return assignThePrefixArrayItems(
    listLocalVariablesUsedInFormula.value
  );
})
/**
 * Список локальных переменных не используемых в формуле
 * @returns {*[]}
 */
const arrayFreeVariablesOutsideFormula = computed(() => {
  let variablesListUnusedInFormula = props.originVariables.filter(
    (item) => !listLocalVariablesUsedInFormula.value.includes(item)
  );

  return assignThePrefixArrayItems(variablesListUnusedInFormula);
})
/**
 * Список переменных не используемых в формуле
 * @returns {[]}
 */
const dataFreeVariablesOutsideFormula = computed(() => {
  let localData = [];
  arrayFreeVariablesOutsideFormula.value.forEach((elementName) => {
    if (localResultData.value[elementName]) {
      localData.push(localResultData.value[elementName]);
    }
  });
  return localData;
})
/**
 * Сумма всех элементов не вошедших в формулу
 * @returns {unknown}
 */
const resultSummaDataFriVariablesOutsideFormula = computed(() => {
  return dataFreeVariablesOutsideFormula.value?.reduce(
    (reduceSumma, item) => {
      const isAllowedSummation =
        item.cost !== null && !item.excludeFromCalculations && item.isShow;

      if (isAllowedSummation) {
        return reduceSumma + parseFloat(item.cost);
      }
      return reduceSumma + 0;
    },
    0
  );
})

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
})

/**
 * Список переменных из формулы вместе с данными
 * @returns {*}
 */
const dataListVariablesOnFormula = computed(() => {
  return attachIndexForFormulaElements.value?.map((item) => {
    const isReserveVariable = item === getNameReserveVariable.value;
    const isGlobalVariable = listGlobalsVariables.value.includes(item);

    if (isReserveVariable) {
      return getProxyFreeVariables(
        resultSummaDataFriVariablesOutsideFormula.value
      );
    } else if (isGlobalVariable) {
      return getResultElementOnName.value(item);
    } else {
      const data = Object.values(localResultData.value).filter(
        (itemInner) => itemInner.name === item
      );
      return data.length ? data[0] : item;
    }
  });
})

/**
 * конечная формула после обработки в виде строки с переменными
 * @returns {*}
 */
const mutationFormulaResult = computed(() => {
  return attachIndexForFormulaElements.value.join(" ");
})
/**
 * формула со всеми конечными данными и обработанными переменными
 * @returns {*}
 */
const compileFormulaWitchData = computed(() => {
  if (!variablesInFormula.value.length) {
    return resultSummaDataFriVariablesOutsideFormula.value;
  }
  return processingArrayOnFormulaProcessingLogic(
    dataListVariablesOnFormula.value
  )
    .map((item) => {
      const nameIsNotExist = !item?.name?.length;
      const isReserveVariable = item?.name === getNameReserveVariable.value;
      const isAllowReturnLocalCost =
        listLocalVariablesUsedInFormulaForPrefix.value.includes(item.name) &&
        localResultData.value[item.name]?.isShow &&
        !item.excludeFromCalculations;
      const isAllowReturnGlobalCost =
        listGlobalsVariables.value.includes(item.name) &&
        getResultElementOnName.value(item.name)?.isShow &&
        !item.excludeFromCalculations;

      if (nameIsNotExist) {
        return item;
      } else if (isReserveVariable) {
        return item.cost;
      } else if (isAllowReturnLocalCost) {
        return localResultData.value[item.name].cost;
      } else if (isAllowReturnGlobalCost) {
        return getResultElementOnName.value(item.name)?.cost;
      } else {
        return "null";
      }
    })
    .join(" ")
    ?.replace(/[\+\-\*\/] *\( *\)|\( *\) *[\+\-\*\/]/g, "");
})
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
      return decimalAdjust(
        result,
        props.signAfterDot,
        props.roundOffType
      );
    } else {
      throw new Error();
    }
  } catch (e) {
    if (devMode.value) {
      console.warn(
        "Рассчитываемая формула в дупликаторе: ",
        compileFormulaWitchData.value
      );
    }
    return null;
  }
})
/**
 *
 * @returns {unknown[]}
 */
const returnsLocalResultData = computed(() => {
  return Object.values(localResultData.value).sort(
    (itemA, itemB) => itemA.position - itemB.position
  );
})
/**
 *
 * @returns {boolean}
 */
const isExistLabel = computed(() => {
  return Boolean(mutationsInputData.value?.label?.toString()?.length);
})
const buttonDupleTitle = computed(() => {
  const inputTitleIsExist = Boolean(
    props.duplicatorData?.buttonName?.length
  );
  return inputTitleIsExist
    ? props.duplicatorData?.buttonName
    : "Дублировать";
})


watch(localCost, (newValue, oldValue) => {
  if (newValue !== oldValue) {
    const data = {};
    data.eventType = "dependencyCost";
    changeValue(data);
  }
})


function changeValue(data) {
      if (data?.name) {
        const mutationData = data;
        mutationData.isDuplicator = true;
        tryAddResultElement(mutationData);
        localResultData.value[data.name] = data;
      }
      emits("changedValue", {
        name: mutationsInputData.value.elementName,
        type: "duplicator",
        label: mutationsInputData.value.label,
        cost: localCost.value,
        value: null,
        displayValue: localCost.value,
        formOutputMethod: mutationsInputData.value?.formOutputMethod,
        resultOutputMethod: mutationsInputData.value?.resultOutputMethod,
        eventType: data.eventType,
        unit: props.unit?.length ? props.unit : "",
        isShow: props.parentIsShow,
        excludeFromCalculations:
        mutationsInputData.value.excludeFromCalculations,
        insertedTemplates: returnsLocalResultData.value,
        position: props.positionElement,
        formulaProcessingLogic: props.originData?.formulaProcessingLogic,
      });
    }
function tryDuplicate() {
      counterDuplicate.value++;
      const returnData = updateInputData(
        props.originData,
        counterDuplicate.value
      );
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

  mutationsData.parentDuplicator = props.parentName;
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
    const propIsSecondField = prop === "labelSecond";
    const propIsLabelField = prop === "label";
    const propIsButtonText = prop === "buttonText";
    const propIsButtonTextChecked = prop === "buttonTextChecked";
    const propIsObject = typeof object[prop] === "object";

    if (propIsObject) {
      object[prop] = updateIndexElementsInDuple(object[prop], index);
    } else if (propIsElementNameField) {
      object[prop] = updateNameItem(object, index);
    } else if (
      propIsLabelField ||
      propIsSecondField ||
      propIsButtonText ||
      propIsButtonTextChecked
    ) {
      object[prop] =
        object[prop]?.length && index > 0
          ? object[prop] + " ( " + index + " )"
          : object[prop];
    } else if (propIsDependencyField) {
      object[prop] = addIndexIndexInFormulaElements(
        object[prop],
        index
      ).join("");
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
function assignThePrefixArrayItems(arr) {
      let newArr = [];
      for (let i = 0; i < arr.length; i++) {
        newArr.push(arr[i] + "_" + props.index);
      }
      return newArr;
    }

/**
 * в формулу добавляем префиксы для переменных дупликатора
 * @param formulaString
 * @param index
 * @returns {*}
 */
function  addIndexIndexInFormulaElements(formulaString, index) {
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
 */function  isLocalVariable(item) {
  const isFound = !Boolean(item.match(regExpStringSplitFormula));
  const isFoundVariableInOriginVariables =
    props.originVariables.includes(item);
  return isFound && isFoundVariableInOriginVariables;
}


onMounted(() => {
  if (props.isDuplicate) {
    mutationsInputData.value = props.duplicatorData;
  } else {
    mutationsInputData.value = updateInputData(props.duplicatorData, 0);
  }
})


</script>

<template>
  <div
    class="calc__duplicator-wrapper"
    v-if="mutationsInputData?.templates.length"
  >
    <icon-element-wrapper
      :icon-settings="iconSettingsDuplicatorLabel"
      :alt="isExistLabel ? mutationsInputData.label : ''"
    >
      <template>
        <div class="calc__duplicator-label" v-if="isExistLabel">
          {{ mutationsInputData.label }}
        </div>
        <slot name="prompt" />
      </template>
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
        @changedValue="changeValue"
      />
      <templates-wrapper-column
        v-if="template?.template === 'UiColumns'"
        :parent-is-show="parentIsShow"
        :template="template"
        :index="index + '_' + inx"
        :parent-name="mutationsInputData.elementName"
        @changedValue="changeValue"
      />
      <templates-wrapper
        v-else
        :parent-is-show="parentIsShow"
        :template="template"
        :index="index + '_' + inx"
        :parent-name="mutationsInputData.elementName"
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
    :element-name="mutationsInputData?.elementName"
    :local-cost="localCost"
    :formula="mainFormulaResult"
    :formula-variables="compileFormulaWitchData"
    hidden-value
  />
</template>
