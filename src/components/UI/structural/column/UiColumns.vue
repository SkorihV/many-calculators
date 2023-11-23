<script>
const typeElement = "Columns";
</script>

<script setup>
import DevBlock from "@/components/UI/devMode/devBlock/devBlock.vue";
import IconElementWrapper from "@/components/UI/supporting/icon-element-wrapper.vue";
import ColumnElement from "@/components/UI/structural/column/ColumnElement.vue";

import { propsTemplate } from "@/servises/UsePropsTemplatesSingle";
import { computed, onMounted, reactive, ref, toRef, watch } from "vue";

import { useProcessingFormula } from "@/composables/useProcessingFormula";
import { useLocalDependencyList } from "@/composables/useLocalDependencyList";
import { useDisplayComponents } from "@/composables/useDisplayComponents";
import { getCurrentWidthElement } from "@/composables/useWidthElement";

const emits = defineEmits(["changedValue"]);
const props = defineProps({
  columnList: {
    type: Array,
    default: () => [],
  },
  /**
   * free, first, center, last
   */
  adaptationMethod: {
    type: String,
    default: "first",
  },
  iconSettingsColumnsLabel: {
    type: Object,
    default: () => {},
  },
  classes: {
    type: String,
    default: "",
  },
  ...propsTemplate.getProps([
    "label",
    "elementName",
    "classes",
    "parentIsShow",
    "dependencyFormulaDisplay",
    "parentName",
    "options"
  ]),
});

const maximumColumns = 4
const stateColumns = ref([])
const parentRef = ref(null)

const { constructLocalListElementDependencyInFormula, localDependencyList } =
  useLocalDependencyList();

const { isVisibilityFromDependency, formulaAfterProcessingVariables } =
  useProcessingFormula(
    reactive({
      parentIsShow: toRef(props, "parentIsShow"),
      formula: toRef(props, "dependencyFormulaDisplay"),
      constructLocalListElementDependencyInFormula,
      localDependencyList: localDependencyList,
    })
  );
useDisplayComponents(props.elementName, isVisibilityFromDependency, typeElement)
const {currentWidthElement} = getCurrentWidthElement(
  isVisibilityFromDependency,
  parentRef
)
onMounted(() => {
  props.columnList.forEach((item) => {
    stateColumns.value.push({ maxWidth: item.maxWidth });
  });
});

function changeValue(data) {
  emits("changedValue", data);
}

function getMaxLengthColumn(index) {
  if (!stateColumns.value[index]?.maxWidth) {
    return null;
  }
  return `max-width: ${stateColumns.value[index]?.maxWidth}%;`;
}

const columnListBeforeLimiting = computed(() => {
  return props.columnList?.filter((column, index) => index < maximumColumns);
});

const countColumns = computed(() => {
  return columnListBeforeLimiting.value?.length;
});

watch(currentWidthElement, (width) => {
  if (width > 850) {
    stateColumns.value = Object.values(stateColumns.value).map(
      (item, index) => {
        item.maxWidth = props.columnList[index].maxWidth;
        return item;
      }
    );
  }
  const methodName = props.adaptationMethod;

  if (width <= 850) {
    if (countColumns.value === 4) {
      if (["free", "first", "center"].includes(methodName)) {
        stateColumns.value[0].maxWidth = 33;
        stateColumns.value[1].maxWidth = 33;
        stateColumns.value[2].maxWidth = 33;
        stateColumns.value[3].maxWidth = 100;
      } else if (["last"].includes(methodName)) {
        stateColumns.value[0].maxWidth = 50;
        stateColumns.value[1].maxWidth = 50;
        stateColumns.value[2].maxWidth = 50;
        stateColumns.value[3].maxWidth = 50;
      }
    }

    if (countColumns.value === 3 || countColumns.value === 2) {
      stateColumns.value = Object.values(stateColumns.value).map((item) => {
        item.maxWidth = countColumns.value === 3 ? 33 : 50;
        return item;
      });
    }
  }

  if (width <= 700) {
    if (countColumns.value === 4) {
      if (["free", "first", "last"].includes(methodName)) {
        stateColumns.value[0].maxWidth = 50;
        stateColumns.value[1].maxWidth = 50;
        stateColumns.value[2].maxWidth = 50;
        stateColumns.value[3].maxWidth = 50;
      } else if (["center"].includes(methodName)) {
        stateColumns.value[0].maxWidth = 100;
        stateColumns.value[1].maxWidth = 50;
        stateColumns.value[2].maxWidth = 50;
        stateColumns.value[3].maxWidth = 100;
      }
    }

    if (countColumns.value === 3) {
      if (["free", "first"].includes(methodName)) {
        stateColumns.value[0].maxWidth = 50;
        stateColumns.value[1].maxWidth = 50;
        stateColumns.value[2].maxWidth = 100;
      } else if (["center", "last"].includes(methodName)) {
        stateColumns.value[0].maxWidth = 100;
        stateColumns.value[1].maxWidth = 50;
        stateColumns.value[2].maxWidth = 50;
      }
    }

    if (countColumns.value === 2) {
      stateColumns.value[0].maxWidth = 50;
      stateColumns.value[1].maxWidth = 50;
    }
  }
  if (width <= 440) {
    stateColumns.value = Object.values(stateColumns.value).map((item) => {
      item.maxWidth = 100;
      return item;
    });
  }
});

const showElementColumns = computed(() => {
  return Boolean(
    isVisibilityFromDependency.value && props.parentIsShow && countColumns.value
  );
});

const isExistLabel = computed(() => Boolean(props.label?.toString()?.length));
</script>

<template>
  <div
    class="calc__columns-wrapper"
    :class="[classes]"
    ref="parentRef"
    v-show="showElementColumns"
    :id="elementName"
  >
    <icon-element-wrapper
      :icon-settings="iconSettingsColumnsLabel"
      :alt="isExistLabel ? label : ''"
      :is-exist-label="isExistLabel"
    >
      <div class="calc__columns-label-text" v-if="isExistLabel">
        {{ label }}
      </div>
    </icon-element-wrapper>
    <div class="calc__columns-column-wrapper">
      <div
        class="calc__columns-column-item"
        :style="getMaxLengthColumn(index)"
        v-for="(column, index) in columnListBeforeLimiting"
        :key="index"
      >
        <column-element
          :parent-is-show="showElementColumns"
          :column="column"
          :id-column="index"
          :parent-name="elementName"
          :dependency-formula-display="column?.dependencyFormulaDisplay"
          :element-position="column?.elementPosition"
          :options="options"
          @changedValue="changeValue"
        />
      </div>
    </div>
  </div>
  <dev-block
    :label="label || elementName"
    :type-element="typeElement"
    :element-name="elementName"
    :is-visibility-from-dependency="showElementColumns"
    :dependency-formula-display="dependencyFormulaDisplay"
    hidden-cost
    hidden-value
  />
</template>

<style scoped></style>
