<script>
const typeElement = "AccordionItem";
</script>

<script setup>
import { computed, reactive, ref, toRef } from "vue";
import UiAccordionItem from "@/components/UI/structural/accordion/UiAccordionItem.vue";
import devBlock from "@/components/UI/devMode/devBlock/devBlock.vue";
import IconElementWrapper from "@/components/UI/supporting/icon-element-wrapper.vue";
import { propsTemplate } from "@/servises/UsePropsTemplatesSingle";
import { useProcessingFormula } from "@/composables/useProcessingFormula";
import { useLocalDependencyList } from "@/composables/useLocalDependencyList";
import {useDisplayComponents} from "@/composables/useDisplayComponents";

const emits = defineEmits(["changedValue"]);
const props = defineProps({
  accordionData: {
    type: Object,
    default: () => {},
  },
  maxWidth: {
    type: [String, Number],
    default: 100,
  },
  iconSettingsAccordionLabel: {
    type: Object,
    default: () => {},
  },
  ...propsTemplate.getProps([
    "label",
    "elementName",
    "classes",
    "parentIsShow",
    "dependencyFormulaDisplay",
  ]),
});
const parent = ref(null);

const { localDependencyList, constructLocalListElementDependencyInFormula } =
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
function changeValue(data) {
  emits("changedValue", data);
}

const showBlock = computed(() => {
  let result = [];
  if (props.accordionData?.items.length) {
    result = props.accordionData?.items.map((item) => {
      if (item?.templates?.length) {
        return Boolean(item.templates.length);
      }
      return false;
    });
  }
  return result.some((item) => item);
});

const isExistLabel = computed(() => {
  return Boolean(props.label?.toString()?.length);
});
</script>

<template>
  <div
    class="calc__wrapper-group-data"
    v-show="showBlock && isVisibilityFromDependency"
    :id="elementName"
    ref="parent"
  >
    <div class="calc__accordion-wrapper" :class="[classes]">
      <icon-element-wrapper
        :icon-settings="iconSettingsAccordionLabel"
        :alt="isExistLabel ? accordionData?.label : ''"
        :is-exist-label="isExistLabel"
      >
        <div class="calc__accordion-main-label" v-if="isExistLabel">
          {{ label }}
        </div>
      </icon-element-wrapper>

      <template v-if="accordionData?.items?.length">
        <ui-accordion-item
          v-for="(item, key) in accordionData.items"
          :key="key"
          :parent-is-show="isVisibilityFromDependency"
          :accordionItem="item"
          :accordion-name="elementName"
          :accordion-item-id="key"
          :element-name="elementName + item?.json_id + '_' + key"
          @changedValue="changeValue"
        />
      </template>
    </div>
  </div>
  <dev-block
    :label="label || elementName"
    :type-element="typeElement"
    :element-name="elementName"
    :is-visibility-from-dependency="showBlock && isVisibilityFromDependency"
    :dependency-formula-display="dependencyFormulaDisplay"
    hidden-cost
    hidden-value
  />
</template>
