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
          <icon-element
            v-if="
              item?.iconSettings?.image?.filename &&
              item?.iconSettings?.location === 'leftSide'
            "
            :alt="item.label"
            :icon-settings="item?.iconSettings"
          />
          <div class="calc__tab-item-label-text">
            <div class="calc__tab-item-label-main">{{ item.label }}</div>
            <div class="calc__tab-item-label-sub">{{ item?.sublabel }}</div>
          </div>
          <icon-element
            v-if="
              item?.iconSettings?.image?.filename &&
              item?.iconSettings?.location === 'rightSide'
            "
            :alt="item.label"
            :icon-settings="item?.iconSettings"
          />
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
        @changedValue="changeValue"
      />
    </template>
  </div>
</template>

<script>
import UiTooltip from "@/components/UI/UiTooltip";
import UiPrompt from "@/components/UI/UiPrompt";
import UiTabItem from "@/components/UI/UiTabItem";
import IconElement from "@/components/UI/Icon-element.vue";
import { MixinsForProcessingFormula } from "@/components/UI/MixinsForProcessingFormula";
import SpinnerBlock from "@/components/UI/Spinner-element.vue";

import { useBaseStore } from "@/store/piniaStore";
import { mapState } from "pinia";
import UsePropsTemplates from "@/components/UI/UsePropsTemplates";

export default {
  name: "UiTab",
  components: { IconElement, UiTooltip, UiPrompt, UiTabItem, SpinnerBlock },
  emits: ["changedValue"],
  mixins: [MixinsForProcessingFormula],
  props: {
    tabData: {
      type: Object,
      default: () => {},
    },
    maxWidth: {
      type: [String, Number],
      default: 100,
    },
    ...UsePropsTemplates([
      "label",
      "classes",
      "elementName",
      "parentIsShow",
      "dependencyFormulaDisplay",
    ]),
  },
  data() {
    return {
      itemOpenId: null,
      errorsElements: {},
      visibilityListTabs: new Map(),
      shownIdTab: null,
   };
  },
  methods: {
    openItem(index) {
      this.shownIdTab = index;
    },
    changeValue(data) {
      this.$emit("changedValue", data);
    },
    checkIsShowError(parentName, key) {
      const isError = this.isValidationErrorOnParentName(parentName);
      return key !== this.shownIdTab && isError && this.isCanShowAllTooltips;
    },
  },
  computed: {
    ...mapState(useBaseStore, [
      "isCanShowAllTooltips",
      "isValidationShowOnParentName",
      "isValidationErrorOnParentName",
    ]),
    showBlock() {
      let result = [];
      if (this.tabData?.items.length) {
        result = this.tabData?.items.map((item) => {
          if (item?.templates?.length) {
            return Boolean(item.templates.length);
          }
          return false;
        });
      }
      return result.some((item) => item);
    },
  },
};
</script>
