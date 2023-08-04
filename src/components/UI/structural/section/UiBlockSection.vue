<script>
const typeElement = "BlockSection";
</script>

<script setup>
import TemplatesWrapper from "@/components/UI/supporting/TemplatesWrapper.vue";
import TemplatesWrapperColumn from "@/components/UI/supporting/TemplatesWrapperColumn.vue";
import devBlock from "@/components/UI/devMode/devBlock/devBlock.vue";
import BackgroundImageElement from "@/components/UI/supporting/background-image-element.vue";
import IconElementWrapper from "@/components/UI/supporting/icon-element-wrapper.vue";

import { computed, reactive, ref, toRef, watch, onMounted } from "vue";
import {storeToRefs} from "pinia";
import {useBaseStore} from "@/store/piniaStore";

import {useDisplayComponents} from "@/composables/useDisplayComponents";

import { propsTemplate } from "@/servises/UsePropsTemplatesSingle";
import { getCurrentWidthElement } from "@/composables/useWidthElement";
import { useLocalDependencyList } from "@/composables/useLocalDependencyList";
import { useProcessingFormula } from "@/composables/useProcessingFormula";
import {useHighlightElement} from '@/composables/useHighlightElement'

const baseStore = useBaseStore()
const { devMode } = storeToRefs(baseStore);
const emits = defineEmits(["changedValue"]);
const props = defineProps({
  templatesData: {
    type: Array,
    default: () => [],
  },
  visualSeparate: {
    type: [Number, Boolean],
    default: false,
  },
  iconSettingsSectionLabel: {
    type: Object,
    default: () => {},
  },
  ...propsTemplate.getProps([
    "label",
    "labelSub",
    "elementName",
    "classes",
    "parentIsShow",
    "dependencyFormulaDisplay",
    "backgroundImageSettings",
    "maxWidthSide",
    "elementPosition",
  ]),
});
const parentRef = ref(null);

const { localDependencyList, constructLocalListElementDependencyInFormula } =
  useLocalDependencyList();
const { isVisibilityFromDependency, formulaAfterProcessingVariables } =
  useProcessingFormula(
    reactive({
      parentIsShow: toRef(props, "parentIsShow"),
      formula: toRef(props, "dependencyFormulaDisplay"),
      localDependencyList: localDependencyList,
      constructLocalListElementDependencyInFormula,
    })
  );
const {isHighlightElement} = useHighlightElement(props.elementName)
useDisplayComponents(props.elementName, isVisibilityFromDependency, typeElement)

function changeValue(data) {
  emits("changedValue", data);
}

const isExistLabel = computed(() => {
  return Boolean(props.label?.toString()?.length);
});

const isExistTemplatesData = computed(() => {
  return Boolean(props.templatesData.length);
});

const isExistLabelSub = computed(() => {
  return Boolean(props.labelSub?.length);
});

const isVisualSeparate = computed(() => {
  return Boolean(props.visualSeparate);
});

const showSection = computed(() => {
  return Boolean(
    isExistTemplatesData.value &&
      props.parentIsShow &&
      isVisibilityFromDependency.value
  );
});

const { currentWidthElement } = getCurrentWidthElement(showSection, parentRef);

const maxWidth = computed(() => {
  return currentWidthElement.value > 600 ? props.maxWidthSide + "%" : "100%";
});

const isHorizontal = computed(() => {
  return props.elementPosition === "horizontal";
});

</script>

<template>
  <div
    class="calc__wrapper-group-data"
    :class="{ indent: isVisualSeparate, 'is-highlight': isHighlightElement }"
    v-show="showSection"
    :id="elementName"
    ref="parentRef"
  >
    <div
      class="calc__block-section-wrapper"
      :class="[classes, { isVisualSeparate: isVisualSeparate }]"
    >
      <background-image-element
        v-if="backgroundImageSettings"
        :image-settings-data="backgroundImageSettings"
      />
      <div class="calc__block-section-label-wrapper" v-if="isExistLabel">
        <icon-element-wrapper
          :icon-settings="iconSettingsSectionLabel"
          :alt="isExistLabel ? label : ''"
          :is-exist-label="isExistLabel"
        >
          <div class="calc__block-section-label-text">
            <div class="calc__block-section-label_main" v-if="isExistLabel">
              {{ label }}
            </div>
            <div class="calc__block-section-label_sub" v-if="isExistLabelSub">
              {{ labelSub }}
            </div>
          </div>
        </icon-element-wrapper>
      </div>
      <div
        class="calc__block-section-content-wrapper"
        :style="{ maxWidth: maxWidth }"
        :class="{ horizontal: isHorizontal }"
      >
        <template v-for="(item, inx) in templatesData" :key="inx">
          <templates-wrapper-column
            v-if="item?.template === 'UiColumns'"
            :parent-is-show="showSection"
            :template="item"
            :index="elementName + '_' + 'block-section' + '_' + inx"
            :parent-name="elementName"
            @changedValue="changeValue"
          />
          <templates-wrapper
            v-else
            :parent-is-show="showSection"
            :template="item"
            :index="elementName + '_' + 'block-section' + '_' + inx"
            :parent-name="elementName"
            @changedValue="changeValue"
          />
        </template>
      </div>
    </div>
  </div>
  <dev-block
    :label="label || elementName"
    :type-element="typeElement"
    :element-name="elementName"
    :is-visibility-from-dependency="showSection"
    :dependency-formula-display="dependencyFormulaDisplay"
    hidden-cost
    hidden-value
  />
</template>
