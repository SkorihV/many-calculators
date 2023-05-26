<script setup>
import DevBlock from "@/components/UI/devMode/c_devBlock.vue";
import IconElementWrapper from "@/components/UI/supporting/c_icon-element-wrapper.vue";
import ColumnElement from "@/components/UI/structural/ColumnElement.vue";

import { propsTemplate } from "@/servises/UsePropsTemplatesSingle";
import { useEventListener } from "@/composables/useEventsListener";
import { computed, onMounted, reactive, ref, unref, watch } from "vue";
import { getParent } from "@/composables/useInstance";

import { useProcessingFormula } from "@/composables/useProcessingFormula";
import { useLocalDependencyList } from "@/composables/useLocalDependencyList";

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
  changedStateParent: {
    type: Boolean,
    default: false,
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
  ]),
});

const maximumColumns = 4;
const currentWidthElement = ref(null);
const stateColumns = ref([]);
const timerName = ref(null);

const { constructLocalListElementDependencyInFormula, localDependencyList } =
  useLocalDependencyList();

const { isVisibilityFromDependency, formulaAfterProcessingVariables } =
  useProcessingFormula(
    reactive({
      parentIsShow: props.parentIsShow,
      dependencyFormulaDisplay: props.dependencyFormulaDisplay,
      constructLocalListElementDependencyInFormula,
      localDependencyList: localDependencyList,
    })
  );

useEventListener(window, "resize", resize);
onMounted(() => {
  updatedCurrentWidth();

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
function updatedCurrentWidth() {
  const parent = getParent();
  if (parent && parent?.offsetWidth !== 0) {
    currentWidthElement.value = parent.offsetWidth;
    clearInterval(timerName.value);
  }
}
function resize() {
  updatedCurrentWidth();
}

watch(
  () => props.parentIsShow,
  () => {
    let step = 0;
    timerName.value = setInterval(() => {
      updatedCurrentWidth();
      if (step > 10) {
        clearInterval(timerName.value);
      }
    }, 500);
  }
);

watch(
  () => props.changedStateParent,
  () => {
    let step = 0;
    timerName.value = setInterval(() => {
      updatedCurrentWidth();
      if (step > 10) {
        clearInterval(timerName.value);
      }
    }, 100);
  }
);

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
    unref(isVisibilityFromDependency) &&
      props.parentIsShow &&
      unref(countColumns)
  );
});

const isExistLabel = computed(() => {
  return Boolean(props.label?.toString()?.length);
});
</script>

<template>
  <div
    class="calc__columns-wrapper"
    :class="[classes]"
    ref="parent"
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
          @changedValue="changeValue"
        />
      </div>
    </div>
  </div>
  <dev-block
    :label="label"
    :element-name="elementName"
    :is-visibility-from-dependency="showElementColumns"
    :dependency-formula-display="dependencyFormulaDisplay"
    :parsing-formula-variables="formulaAfterProcessingVariables"
    hidden-cost
    hidden-value
  />
</template>

<style scoped></style>
