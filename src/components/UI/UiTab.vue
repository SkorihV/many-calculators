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
import { MixinsForProcessingFormula } from "@/components/UI/MixinsForProcessingFormula";

import { useBaseStore } from "@/store/piniaStore";
import { mapState } from "pinia";

export default {
  name: "UiTab",
  components: { UiTooltip, UiPrompt, UiTabItem },
  emits: ["changedValue"],
  mixins: [MixinsForProcessingFormula],
  props: {
    tabData: {
      type: Object,
      default: () => {},
    },
    /**
     * заголовок
     */
    label: {
      type: String,
      default: "",
    },
    elementName: {
      type: String,
      default: Math.random().toString(),
    },
    classes: {
      type: String,
      default: null,
    },
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

<style scoped lang="scss"></style>
