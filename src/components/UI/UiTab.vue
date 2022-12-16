<template>
  <div
    ref="parent"
    class="calc__tab-wrapper"
    :class="[classes]"
    v-show="showBlock && isVisibilityFromDependency"
  >
    <div class="calc__tab-main-label" v-if="tabData?.label?.length">
      {{ tabData.label }}
    </div>
    <div class="calc__tab-item-label-wrapper">
      <template v-for="(item, key) in tabData?.items">
        <div
          class="calc__tab-item-label"
          :class="{
            isOpen: key === shownIdTab,
            isError: checkIsShowError(
              elementName + item?.json_id + '_' + key ||
                elementName + 'tabItem' + '_' + key,
              key
            ),
          }"
          v-if="
            isValidationShowOnParentName(
              elementName + item?.json_id + '_' + key ||
                elementName + 'tabItem' + '_' + key
            )
          "
          :key="key"
          @click="openItem(key)"
        >
          {{ item.label }}
          <ui-prompt v-if="item?.prompt?.length" :prompt-text="item.prompt" />
          <ui-tooltip
            :is-show="
              checkIsShowError(
                elementName + item?.json_id + '_' + key ||
                  elementName + 'tabItem' + '_' + key,
                key
              )
            "
            tooltip-text="Во вкладке есть не корректно заполненные поля."
          ></ui-tooltip>
        </div>
      </template>
    </div>
    <div
      class="calc__tab-item-content-wrapper"
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
        @changedValue="changeValue"
      />
    </div>
  </div>
</template>

<script>
import UiTooltip from "@/components/UI/UiTooltip";
import UiPrompt from "@/components/UI/UiPrompt";
import UiTabItem from "@/components/UI/UiTabItem";
import UseForProcessingFormula from "@/components/UI/UseForProcessingFormula";

import { ref, toRef, computed, watch } from "vue";
import { useBaseStore } from "@/store/piniaStore";
import UsePropsTemplates from "@/components/UI/UsePropsTemplates";

export default {
  name: "UiTab",
  components: { UiTooltip, UiPrompt, UiTabItem },
  emits: ["changedValue"],
  props: {
    tabData: {
      type: Object,
      default: () => {},
    },
    ...UsePropsTemplates([
      "label",
      "classes",
      "elementName",
      "parentIsShow",
      "dependencyFormulaDisplay",
    ]),
  },
  setup(props, { emit }) {
    const store = useBaseStore();
    const isValidationShowOnParentName = ref(
      store.isValidationShowOnParentName
    );

    const classes = toRef(props, "classes");
    const elementName = toRef(props, "elementName");
    const dependencyFormulaDisplay = toRef(props, "dependencyFormulaDisplay");
    const parentIsShow = toRef(props, "parentIsShow");

    const shownIdTab = ref(null);

    const changeValue = (data) => {
      emit("changedValue", data);
    };

    const openItem = (index) => {
      shownIdTab.value = index;
    };

    const { isVisibilityFromDependency: isVisibilityFromDependencyLocal } =
      UseForProcessingFormula({
        dependencyFormulaDisplay,
        parentIsShow,
        changeValue,
      });
    const isVisibilityFromDependency = ref(
      isVisibilityFromDependencyLocal.value
    );
    watch(
      () => isVisibilityFromDependencyLocal.value,
      () => {
        isVisibilityFromDependency.value =
          isVisibilityFromDependencyLocal.value;
      }
    );

    const checkIsShowError = (parentName, key) => {
      const isError = store.isValidationErrorOnParentName(parentName);
      return key !== shownIdTab.value && isError && store.isCanShowAllTooltips;
    };

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

    return {
      classes,
      showBlock,
      elementName,
      shownIdTab,
      openItem,
      checkIsShowError,
      isValidationShowOnParentName,
      changeValue,
      isVisibilityFromDependency,
    };
  },
};
</script>

<style scoped lang="scss"></style>
