<script setup>
import { computed, ref, toRef } from "vue";
import {useBaseStore} from "@/store/baseStore";
import {useValidationListStore} from "@/store/validationListStore";
import {storeToRefs} from "pinia";
import TemplatesWrapper from "@/components/templates/calculator/TemplatesWrapper.vue";
import TemplatesWrapperColumn from "@/components/templates/columns/TemplatesWrapperColumn.vue";
import UiTooltip from "@/components/UI/other/UiTooltip.vue";
import UiPrompt from "@/components/UI/other/UiPrompt.vue";
import BackgroundImageElement from "@/components/supporting/background-image-element.vue";
import IconElementWrapper from "@/components/supporting/icon-element-wrapper.vue";

import { propsTemplate } from "@/servises/UsePropsTemplatesSingle";
import { getCurrentWidthElement } from "@/composables/useWidthElement";

const baseStore = useBaseStore()
const { isCanShowAllTooltips } = storeToRefs(baseStore);
const {getValidationListByParentName} = storeToRefs(useValidationListStore())

const emits = defineEmits(["changedValue"]);
const props = defineProps({
  accordionItem: {
    type: Object,
    default: () => {},
  },
  accordionName: {
    type: String,
    default: "",
  },
  accordionItemId: {
    type: Number,
  },
  ...propsTemplate.getProps(["elementName", "parentIsShow", "options"]),
});

const parentRef = ref(null);
const isOpen = ref(false);
const hoverElement = ref(null);
const { currentWidthElement } = getCurrentWidthElement(
  toRef(props, "parentIsShow"),
  parentRef
);
function changeValue(data) {
  emits("changedValue", data);
}

/**
 *
 * @returns {function(*): *[]}
 */
const localListValidationError = computed(() => {
  return getValidationListByParentName.value(props.elementName);
});

const isShowError = computed(() => {
  return localListValidationError.value.some(
    (item) => item.error && item.isShow && isCanShowAllTooltips.value
  );
});

/**
 *
 * @returns {*|number}
 */
const currentChildrenItem = computed(() => {
  return props.accordionItem?.templates?.length
    ? props.accordionItem?.templates?.length
    : 0;
});

/**
 *
 * @returns {*}
 */
const currentHiddenItem = computed(() => {
  return localListValidationError.value?.filter((item) => !item.isShow).length;
});

const isShowAccordionItem = computed(() => {
  return currentChildrenItem.value !== currentHiddenItem.value;
});

const itemIdName = computed(() => {
  return (
    props.accordionName + "_" + props.elementName + "_" + props.accordionItemId
  );
});

const maxWidth = computed(() => {
  return currentWidthElement.value > 600
    ? `${props.accordionItem?.maxWidthSide}%`
    : "100%";
});
</script>

<template>
  <div
    ref="parentRef"
    class="calc__accordion-item-label"
    @click="isOpen = !isOpen"
    v-show="isShowAccordionItem"
    :class="{ open: isOpen, error: isShowError && !isOpen }"
    @mouseover="hoverElement = true"
    @mouseleave="hoverElement = false"
  >
    <div class="calc__accordion-item-label-wrapper">
      <icon-element-wrapper
        :alt="accordionItem.label"
        :icon-settings="accordionItem.iconSettingsAccordionItemLabel"
        :is-parent-hover="hoverElement"
        :is-parent-selected="isOpen"
      >
        <div class="calc__accordion-item-label-text">
          <div class="calc__accordion-item-label-main">
            {{ accordionItem.label }}
          </div>
          <div class="calc__accordion-item-label-sub">
            {{ accordionItem?.sublabel }}
          </div>
        </div>
      </icon-element-wrapper>
      <ui-prompt
        v-if="accordionItem?.prompt?.length"
        :prompt-text="accordionItem.prompt"
        classes="decor"
      />
    </div>
    <div class="calc__accordion-item-plus" v-if="!isOpen"></div>
    <div class="calc__accordion-item-minus" v-if="isOpen"></div>
    <ui-tooltip
      :is-show="isShowError"
      tooltip-text="Во вкладке есть не корректно заполненные поля."
    />
  </div>

  <div class="calc__accordion-item-content" v-show="isOpen">
    <background-image-element
      v-if="accordionItem?.backgroundImageSettings"
      :image-settings-data="accordionItem?.backgroundImageSettings"
    />
    <div
      class="calc__accordion-item-content-wrapper"
      :style="{ maxWidth: maxWidth }"
    >
      <template
        v-for="(template, key_in) in accordionItem?.templates"
        :key="key_in"
      >
        <templates-wrapper-column
          v-if="template?.template === 'UiColumns'"
          :parent-is-show="parentIsShow"
          :template="template"
          :index="itemIdName + '_' + key_in"
          :parent-name="elementName"
          :change-state-parent="isOpen"
          :options="options"
          @changedValue="changeValue"
        />
        <templates-wrapper
          v-else
          :parent-is-show="parentIsShow"
          :template="template"
          :index="itemIdName + '_' + key_in"
          :parent-name="elementName"
          :options="options"
          @changedValue="changeValue"
        />
      </template>
    </div>
  </div>
</template>
