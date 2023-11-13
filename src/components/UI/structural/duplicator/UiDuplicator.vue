<script>
const typeElement = "DuplicatorMain";
</script>

<script setup>
import { onMounted, reactive, ref, toRef, watch, computed } from "vue";
import {useBaseStore} from "@/store/baseStore";
import {useDependencyListStore} from "@/store/dependencyListStore";
import { useElementNamesStore } from "@/store/elementNamesStore";

import UiDuplicatorItem from "@/components/UI/structural/duplicator/UiDuplicatorItem.vue";
import devBlock from "@/components/UI/devMode/devBlock/devBlock.vue";
import UiPrompt from "@/components/UI/other/UiPrompt.vue";

import { useProcessingFormula } from "@/composables/useProcessingFormula";
import { useLocalDependencyList } from "@/composables/useLocalDependencyList";

import { propsTemplate } from "@/servises/UsePropsTemplatesSingle";
import {
  decimalAdjust,
  getNameElementsRecursive,
} from "@/servises/UtilityServices";
import { useDisplaySpinner } from "@/composables/useDisplaySpinner";
import { useReportInitialStatusForElement } from "@/composables/useReportInitialStatusForElement";
import {useDisplayComponents} from "@/composables/useDisplayComponents";


const baseStore = useBaseStore()
const dependencyStore = useDependencyListStore()
const nameStore = useElementNamesStore()

const emits = defineEmits(["changedValue"]);
const props = defineProps({
  duplicateTemplate: {
    type: Object,
    default: () => {},
  },
  maximumDuple: {
    type: [Number, String],
    default: 5,
    validator(value) {
      return !isNaN(Number(value));
    },
  },
  ...propsTemplate.getProps([
    "formOutputMethod",
    "resultOutputMethod",
    "label",
    "dependencyFormulaDisplay",
    "excludeFromCalculations",
    "elementName",
    "formulaProcessingLogic",
    "classes",
    "templateName",
    "parentIsShow",
    "positionElement",
    "zeroValueDisplayIgnore",
    "unit",
    "roundOffType",
    "signAfterDot"
  ]),
});

let originData = ref({});
const localResultsElements = reactive({});
const localTemplates = ref([]);
const localCost = ref(0);

const { localDependencyList, constructLocalListElementDependencyInFormula } =
  useLocalDependencyList();
const {
  isVisibilityFromDependency,
  formulaAfterProcessingVariables,
} = useProcessingFormula(
  reactive({
    localDependencyList: localDependencyList,
    constructLocalListElementDependencyInFormula,
    formula: toRef(props, "dependencyFormulaDisplay"),
    parentIsShow: toRef(props, "parentIsShow"),
  })
);

useDisplaySpinner(props.elementName);
useReportInitialStatusForElement(props.parentIsShow, changeValue, changeValid);
useDisplayComponents(props.elementName, isVisibilityFromDependency, typeElement)

const returnsLocalResultsElements = computed(() => {
  return Object.values(localResultsElements).sort(
    (itemA, itemB) => itemA?.position - itemB?.position
  );
});

const originVariablesInDuplicator = computed(() => {
  let result = getNameElementsRecursive(originData.value?.templates);
  return result.filter((item) => item?.length > 0);
});

const countElementsDuple = computed(() => {
  return localTemplates.value?.length ? localTemplates.value?.length : 0;
});

const IsExistPrompt = computed(() => {
  return Boolean(originData.value.prompt?.length);
});

watch(isVisibilityFromDependency, (newValue) => {
  if (newValue === false) {
    emitChangeValue("deleteDuplicate");
  }
});

function changeValid() {
  return null;
}
function changeValue(data) {
  if (data === "dependency") {
    data = { eventType: "dependency" };
  }
  if (typeof data !== "object") {
    return false;
  }
  if (data?.name) {
    localResultsElements[data.name] = data;
  }
  updateLocalCost();
  emitChangeValue(data.eventType);
}

function duplicate(duplicateElement) {
  localTemplates.value.push(duplicateElement);
}
function deleteDuplicator(elementName) {
  let index = localTemplates.value.findIndex(
    (item) => item.elementName === elementName
  );
  localTemplates.value.splice(index, 1);

  delete localResultsElements[elementName];
  updateLocalCost();
  emitChangeValue("deleteDuplicate");
}
function updateLocalCost() {
  if (!isVisibilityFromDependency.value) {
    localCost.value = null;
    return false;
  }

  let resultCost = returnsLocalResultsElements.value.reduce((result, item) => {
    if (item.cost !== null) {
      return result + parseFloat(item.cost);
    }
    return result;
  }, 0);
  resultCost = decimalAdjust(
    resultCost,
    props.signAfterDot,
    props.roundOffType
  );
  localCost.value = resultCost;
}

function emitChangeValue(eventType) {
  emits("changedValue", {
    name: props.elementName,
    type: "duplicator",
    label: props.duplicateTemplate.label,
    cost: localCost.value,
    value: localCost.value,
    displayValue: localCost.value,
    formOutputMethod: props.duplicateTemplate.formOutputMethod,
    resultOutputMethod: props.duplicateTemplate.resultOutputMethod,
    eventType: eventType,
    unit: props.unit?.length ? props.unit : "",
    isShow: isVisibilityFromDependency.value,
    excludeFromCalculations: props.duplicateTemplate.excludeFromCalculations,
    insertedTemplates: returnsLocalResultsElements.value,
    formulaProcessingLogic: props.formulaProcessingLogic,
    position: props.positionElement,
    zeroValueDisplayIgnore: props.zeroValueDisplayIgnore,
  });
  tryPassDependency();
  nameStore.addNameInList({name: props.elementName, label: props.duplicateTemplate.label, position: props.positionElement})
}

function tryPassDependency() {
  dependencyStore.addDependencyElement({
    name: props.elementName,
    value: localCost.value,
    isShow: isVisibilityFromDependency.value,
    displayValue: localCost.value,
    type: "duplicator",
  });
}

onMounted(() => {
  originData.value = JSON.parse(JSON.stringify(props.duplicateTemplate));
  localTemplates.value.push(
    JSON.parse(JSON.stringify(props.duplicateTemplate))
  );
  changeValue({ eventType: "mounted" });
});
</script>

<template>
  <div
    class="calc__wrapper-group-data"
    :class="classes"
    v-show="isVisibilityFromDependency"
    :id="elementName"
  >
    <div class="calc__duplicator">
      <UiDuplicatorItem
        v-for="(duplicator, idx) in localTemplates"
        :origin-data="originData"
        :key="duplicator?.index ? duplicator?.index : 0"
        :index="duplicator?.index ? duplicator?.index : 0"
        :duplicator-data="duplicator"
        :is-duplicate="duplicator?.isDuplicate"
        :formula="originData?.formula"
        :parent-name="duplicator?.elementName"
        :parent-is-show="isVisibilityFromDependency"
        :origin-variables="originVariablesInDuplicator"
        :position-element="idx"
        :show-duplicate-button="countElementsDuple < maximumDuple"
        :icon-settings-duplicator-label="
          originData?.iconSettingsDuplicatorLabel
        "
        :prompt="originData?.prompt"
        :unit="originData?.unit"
        :round-off-type="roundOffType"
        :sign-after-dot="signAfterDot"
        @duplicate="duplicate"
        @deleteDuplicator="deleteDuplicator"
        @changedValue="changeValue"
      >
        <template v-slot:prompt v-if="IsExistPrompt">
          <ui-prompt :prompt-text="originData.prompt" :options="{isDuplicator: true, index: duplicator?.index ? duplicator?.index : 0}"/>
        </template>
      </UiDuplicatorItem>
    </div>
  </div>
  <dev-block
    :label="label || elementName"
    :type-element="typeElement"
    :dependency-formula-display="dependencyFormulaDisplay"
    :element-name="elementName"
    :local-cost="localCost"
    :value="localCost"
    :is-visibility-from-dependency="isVisibilityFromDependency"
  />
</template>
