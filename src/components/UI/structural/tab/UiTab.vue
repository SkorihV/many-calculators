<script>
const typeElement = "Tab";
</script>

<script setup>
import { computed, reactive, ref, toRef } from "vue";
import {useBaseStore} from "@/store/baseStore";
import {storeToRefs} from "pinia";

import UiTooltip from "@/components/UI/other/UiTooltip.vue";
import UiPrompt from "@/components/UI/other/UiPrompt.vue";
import UiTabItem from "@/components/UI/structural/tab/UiTabItem.vue";
import devBlock from "@/components/UI/devMode/devBlock.vue";
import IconElementWrapper from "@/components/supporting/icon-element-wrapper.vue";
import { propsTemplate } from "@/servises/UsePropsTemplatesSingle";

import { useLocalDependencyList } from "@/composables/useLocalDependencyList";
import { useProcessingFormula } from "@/composables/useProcessingFormula";
import {useDisplayComponents} from "@/composables/useDisplayComponents";
import {useValidationListStore} from "@/store/validationListStore";

const emits = defineEmits(["changedValue"]);
const props = defineProps({
  tabData: {
    type: Object,
    default: () => {},
  },
  maxWidth: {
    type: [String, Number],
    default: 100,
  },
  iconSettingsTabsLabel: {
    type: Object,
    default: () => {},
  },
  ...propsTemplate.getProps([
    "label",
    "classes",
    "elementName",
    "parentIsShow",
    "dependencyFormulaDisplay",
    "options",
  ]),
});
const parent = ref(null);

const baseStore = useBaseStore()
const { isCanShowAllTooltips } = storeToRefs(baseStore)
const { isValidationErrorByParentName, isValidationShowByParentName } = storeToRefs(useValidationListStore())

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
const shownIdTab = ref(null);
const hoverElementIndex = ref(null);

function openItem(index) {
  shownIdTab.value = index;
}

function changeValue(data) {
  emits("changedValue", data);
}

function checkIsShowError(parentName, key) {
  const isError = isValidationErrorByParentName.value(parentName);
  return key !== shownIdTab.value && isError && isCanShowAllTooltips.value;
}

const showBlock = computed(() => {
  let result = [];
  if (props.tabData?.items.length) {
    result = props.tabData?.items.map((item) => {
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
    <div class="calc__tab-wrapper" :class="[classes]">
      <icon-element-wrapper
        :icon-settings="iconSettingsTabsLabel"
        :alt="isExistLabel ? label : ''"
        :is-exist-label="isExistLabel"
      >
        <div class="calc__tab-main-label" v-if="isExistLabel">
          {{ label }}
        </div>
      </icon-element-wrapper>
      <div class="calc__tab-item-label-wrapper">
        <template v-for="(item, idx) in tabData?.items">
          <div
            class="calc__tab-item-label"
            :class="{
              isOpen: shownIdTab === idx,
              isError: checkIsShowError(
                elementName + item?.json_id + '_' + idx ||
                  elementName + 'tabItem' + '_' + idx,
                idx
              ),
            }"
            v-if="
              isValidationShowByParentName(
                elementName + item?.json_id + '_' + idx ||
                  elementName + 'tabItem' + '_' + idx
              )
            "
            :key="idx"
            @click="openItem(idx)"
            @mouseover="hoverElementIndex = idx"
            @mouseleave="hoverElementIndex = null"
          >
            <icon-element-wrapper
              :alt="item.label"
              :icon-settings="item?.iconSettingsTabsItemLabel"
              :is-parent-hover="hoverElementIndex === idx"
              :is-parent-selected="shownIdTab === idx"
              :is-exist-label="Boolean(item.label?.length)"
            >
              <div class="calc__tab-item-label-text">
                <div class="calc__tab-item-label-main">{{ item.label }}</div>
                <div class="calc__tab-item-label-sub">{{ item?.sublabel }}</div>
              </div>
            </icon-element-wrapper>
            <ui-prompt
              v-if="item?.prompt?.length"
              :prompt-text="item.prompt"
              classes="decor"
            />
            <ui-tooltip
              :is-show="
                checkIsShowError(
                  elementName + item?.json_id + '_' + idx ||
                    elementName + 'tabItem' + '_' + idx,
                  idx
                )
              "
              tooltip-text="Во вкладке есть не корректно заполненные поля."
            />
          </div>
        </template>
      </div>
      <template
        v-if="tabData?.items?.length"
        v-for="(item, key) in tabData.items"
        :key="key"
      >
        <ui-tab-item
          :parent-is-show="isVisibilityFromDependency"
          :tab-item="item"
          :tab-name="elementName + '_' + key"
          :tab-item-id="key"
          :element-name="
            elementName + item?.json_id + '_' + key ||
            elementName + 'tabItem' + '_' + key
          "
          :shown-id-tab="shownIdTab"
          :options="options"
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
  />
</template>
