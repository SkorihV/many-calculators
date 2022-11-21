<template>
  <div
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
            isError: checkIsShowError(key),
          }"
          v-if="visibilityListTabs.get(key)"
          :key="key"
          @click="openItem(key)"
        >
          {{ item.label }}
          <ui-prompt v-if="item?.prompt?.length" :prompt-text="item.prompt" />
          <ui-tooltip
            :is-show="checkIsShowError(key)"
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
        :element-name="item?.json_id || 'tabItem' + '_' + key"
        :shown-id-tab="shownIdTab"
        @changedValue="changeValue"
        @changeValid="changeValid"
        @passDependency="tryPassDependency"
      />
    </div>
  </div>
</template>

<script>
import TemplatesWrapper from "@/components/UI/TemplatesWrapper";
import UiTooltip from "@/components/UI/UiTooltip";
import UiPrompt from "@/components/UI/UiPrompt";
import UiTabItem from "@/components/UI/UiTabItem";
import { MixinsForProcessingFormula } from "@/components/UI/MixinsForProcessingFormula";

export default {
  name: "UiTab",
  components: { TemplatesWrapper, UiTooltip, UiPrompt, UiTabItem },
  emits: ["changedValue", "changeValid", "passDependency"],
  inject: ["globalDataForDependencies", "globalCanBeShownTooltip"],
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
    changeValid({ data, infoOnTab }) {
      if (this.checkAllowedErrors(data)) {
        if (!this.errorsElements[infoOnTab.index]) {
          this.errorsElements[infoOnTab.index] = new Set();
        }
        this.errorsElements[infoOnTab.index].add(data.name);
      } else {
        if (this.errorsElements[infoOnTab.index]?.has(data.name)) {
          this.errorsElements[infoOnTab.index].delete(data.name);
        }
      }

      this.visibilityListTabs.set(infoOnTab.index, infoOnTab.isShown);
      this.$emit("changeValid", data);
    },
    tryPassDependency(data) {
      this.$emit("passDependency", data);
    },
    checkIsShowError(key) {
      return (
        key !== this.shownIdTab &&
        this.errorsElements[key]?.size &&
        this.globalCanBeShownTooltip
      );
    },
    /**
     * Проверяем можно ли собрать ошибки вложенных элементов
     * @param data
     * @returns {boolean}
     */
    checkAllowedErrors(data) {
      return (
        data.error &&
        data.eventType !== "mounted" &&
        data.eventType !== "delete" &&
        data.isShow &&
        this.globalCanBeShownTooltip
      );
    },
  },
  computed: {
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
    isShowError() {
      return Boolean(this.errorsElements.size);
    },
  },
};
</script>

<style scoped lang="scss">
//normal orange - FF5D2B
//normal dark- 464657
//hover orange - FF7044
//hover dark- 5A5A70
//font - 00000
//серый - CCCCCC
// border - E6E6E6 -
// background - F2F2F2

$color-dark-normal: #464657;
$color-orange-normal: #ff5d2b;

$color-dark-hover: #5a5a70;
$color-orange-hover: #ff7044;

$color-danger: #ff4444;

$color-black: #000000;
$color-white: #ffffff;

$color-gray-light: #f2f2f2;
$color-gray-middle: #e6e6e6;
$color-gray-dark: #cccccc;

$border-radius: 4px;

@mixin style-border {
  border: 1px solid $color-gray-middle;
  border-radius: $border-radius;
}

@mixin style-border-hover {
  border: 1px solid $color-gray-dark;
}

@mixin style-button {
  color: $color-white;
  cursor: pointer;
  background-color: $color-dark-normal;
  @include style-flex-center;
  @include style-border;
}

@mixin style-button-hover {
  background-color: $color-dark-hover;
  box-shadow: 0 0 3px 1px $color-gray-dark;
}

@mixin style-flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

@mixin style-flex-start {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

@mixin style-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.calc {
}
</style>
