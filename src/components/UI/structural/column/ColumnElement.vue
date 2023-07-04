<script>
const typeElement = "Column";
</script>

<script setup>
import TemplatesWrapper from "@/components/UI/supporting/TemplatesWrapper.vue";
import IconElementWrapper from "@/components/UI/supporting/icon-element-wrapper.vue";
import DevBlock from "@/components/UI/devMode/devBlock/devBlock.vue";
import { propsTemplate } from "@/servises/UsePropsTemplatesSingle";
import { computed, reactive, ref, toRef } from "vue";
import { useProcessingFormula } from "@/composables/useProcessingFormula";
import { useLocalDependencyList } from "@/composables/useLocalDependencyList";

const emits = defineEmits(["changedValue"]);
const props = defineProps({
  idColumn: {
    type: Number,
    require: true,
  },
  column: {
    type: Object,
    default: () => {},
  },
  ...propsTemplate.getProps([
    "parentIsShow",
    "parentName",
    "template",
    "dependencyFormulaDisplay",
    "elementPosition",
  ]),
});

const parentRef = ref(null);

const { constructLocalListElementDependencyInFormula, localDependencyList } =
  useLocalDependencyList();

const { isVisibilityFromDependency } = useProcessingFormula(
  reactive({
    parentIsShow: toRef(props, "parentIsShow"),
    formula: toRef(props, "dependencyFormulaDisplay"),
    constructLocalListElementDependencyInFormula,
    localDependencyList: localDependencyList,
  })
);

function changeValue(data) {
  emits("changedValue", data);
}

const isExistLabel = computed(() => {
  return Boolean(props.column?.label?.toString()?.length);
});

const showColumn = computed(() => {
  return Boolean(isVisibilityFromDependency.value && props.parentIsShow);
});

const isHorizontal = computed(() => {
  return props.elementPosition === "horizontal";
});
</script>

<template>
  <div class="calc__columns-column-label-wrapper" ref="parentRef">
    <icon-element-wrapper
      :icon-settings="column.iconSettingsColumnsItemLabel"
      :alt="isExistLabel ? column.label : ''"
      :isExistLabel="isExistLabel"
    >
      <div class="calc__columns-column-label" v-if="isExistLabel">
        {{ column.label }}
      </div>
    </icon-element-wrapper>
  </div>
  <div
    class="calc__columns-column-elements-wrapper"
    :class="{ horizontal: isHorizontal }"
  >
    <templates-wrapper
      v-for="(template, index_in) in column?.templates"
      :parent-is-show="showColumn"
      :template="template"
      :index="parentName + '_' + idColumn + '_' + index_in"
      :parent-name="parentName"
      @changedValue="changeValue"
    />
  </div>
  <dev-block
    :dependency-formula-display="dependencyFormulaDisplay"
    :label="column.label"
    hidden-cost
    hidden-value
    :is-visibility-from-dependency="showColumn"
    :type-element="typeElement"
    :element-name="parentName"
  />
</template>
