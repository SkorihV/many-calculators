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
              'isOpen': shownIdTab === idx,
              'isError': checkIsShowError(
                elementName + item?.json_id + '_' + idx ||
                  elementName + 'tabItem' + '_' + idx,
                idx
              ),
            }"
            v-if="
              isValidationShowOnParentName(
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
          @changedValue="changeValue"
        />
      </template>
    </div>
  </div>
  <dev-block
    :label="label"
    :element-name="elementName"
    :is-visibility-from-dependency="showBlock && isVisibilityFromDependency"
    :dependency-formula-display="dependencyFormulaDisplay"
    :parsing-formula-variables="formulaAfterProcessingVariables"
    hidden-cost
  />
</template>

<script>
import UiTooltip from "@/components/UI/other/c_UiTooltip.vue";
import UiPrompt from "@/components/UI/other/UiPrompt.vue";
import UiTabItem from "@/components/UI/structural/UiTabItem.vue";
import devBlock from "@/components/UI/devMode/devBlock.vue";
import { MixinsForProcessingFormula } from "@/mixins/MixinsForProcessingFormula";

import { useBaseStore } from "@/store/piniaStore";
import { mapState } from "pinia";
import { propsTemplate } from "@/servises/UsePropsTemplatesSingle";
import IconElementWrapper from "@/components/UI/supporting/icon-element-wrapper.vue";

export default {
  name: "UiTab",
  components: { IconElementWrapper, UiTooltip, UiPrompt, UiTabItem, devBlock },
  mixins: [MixinsForProcessingFormula],
  emits: ["changedValue"],
  props: {
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
      "dependencyFormulaDisplay"
    ]),
  },
  data() {
    return {
      itemOpenId: null,
      errorsElements: {},
      visibilityListTabs: new Map(),
      shownIdTab: null,
      hoverElementIndex: null,
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
    isExistLabel() {
      return Boolean(this.label?.toString()?.length);
    },
  },
};
</script>
