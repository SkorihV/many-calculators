<template>
  <div
    ref="parent"
    class="calc__accordion-item-label"
    @click="isOpen = !isOpen"
    v-show="isShowAccordionItem"
    :class="{ isOpen: isOpen, isError: isShowError && !isOpen }"
  >
    <div class="calc__accordion-item-label-wrapper">
      <icon-element
        v-if="accordionItem?.iconSettings?.image?.filename && accordionItem?.iconSettings?.location === 'leftSide'"
        :alt="accordionItem.label"
        :icon-settings="accordionItem.iconSettings"
      />
      <div class="calc__accordion-item-label-text">
        <div class="calc__accordion-item-label-main">{{ accordionItem.label }}</div>
        <div class="calc__accordion-item-label-sub">{{ accordionItem?.sublabel }}</div>
      </div>
      <icon-element
        v-if="accordionItem?.iconSettings?.image?.filename && accordionItem?.iconSettings?.location === 'rightSide'"
        :alt="accordionItem.label"
        :icon-settings="accordionItem.iconSettings"
      />
      <ui-prompt
        v-if="accordionItem?.prompt?.length"
        :prompt-text="accordionItem.prompt"
      />
    </div>
    <div class="calc__accordion-item-plus" v-if="!isOpen"></div>
    <div class="calc__accordion-item-minus" v-if="isOpen"></div>
    <ui-tooltip
      :is-show="isShowError"
      tooltip-text="Во вкладке есть не корректно заполненные поля."
    />
  </div>

  <div
    class="calc__accordion-item-content"
    v-show="isOpen">
    <div class="calc__background-image-wrapper" v-if="accordionItem?.backgroundImageSettings?.image?.finame">
      <img
        class="calc__background-image-img"
        :src="getImageDir + accordionItem?.backgroundImageSettings?.image?.finame"
        :style="{ maxWidth: accordionItem?.backgroundImageSettings.maxWidth + 'px', maxHeight: accordionItem?.backgroundImageSettings.maxHeight }"
            >
    </div>
    <div class="calc__accordion-item-content-wrapper"
      :style="{ maxWidth: accordionItem?.maxWidthSide + '%' }"
    >
      <templates-wrapper
        v-for="(template, key_in) in accordionItem?.templates"
        :key="key_in"
        :parent-is-show="parentIsShow"
        :template="template"
        :index="itemIdName + '_' + key_in"
        :parent-name="elementName"
        @changedValue="changeValue"
      />
    </div>

  </div>
</template>

<script>
import UiTooltip from "@/components/UI/UiTooltip";
import UiPrompt from "@/components/UI/UiPrompt";
import TemplatesWrapper from "@/components/UI/TemplatesWrapper";

import { useBaseStore } from "@/store/piniaStore";
import { mapState } from "pinia";
import UsePropsTemplates from "@/components/UI/UsePropsTemplates";
import IconElement from "@/components/UI/Icon-element.vue";

export default {
  name: "UiAccordionItem",
  components: { IconElement, UiTooltip, UiPrompt, TemplatesWrapper },
  emits: ["changedValue"],
  props: {
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
    ...UsePropsTemplates(["elementName", "parentIsShow", "maxWidth", "maxHeight"]),
  },
  data() {
    return {
      isOpen: false,
      errorsElements: new Set(),
      visibilityList: new Set(),
    };
  },
  methods: {
    changeValue(data) {
      this.$emit("changedValue", data);
    },
  },
  computed: {
    ...mapState(useBaseStore, [
      "isCanShowAllTooltips",
      "getValidationListOnParentName",
      "getImageDir"
    ]),
    /**
     *
     * @returns {*}
     */
    isShowError() {
      return this.localListValidationError.some(
        (item) => item.error && item.isShow && this.isCanShowAllTooltips
      );
    },
    /**
     *
     * @returns {boolean}
     */
    isShowAccordionItem() {
      return this.currentChildrenItem !== this.currentHiddenItem;
    },
    /**
     *
     * @returns {string}
     */
    itemIdName() {
      return (
        this.accordionName + "_" + this.elementName + "_" + this.accordionItemId
      );
    },
    /**
     *
     * @returns {function(*): *[]}
     */
    localListValidationError() {
      return this.getValidationListOnParentName(this.elementName);
    },
    /**
     *
     * @returns {*|number}
     */
    currentChildrenItem() {
      return this.accordionItem?.templates.length
        ? this.accordionItem?.templates.length
        : 0;
    },
    /**
     *
     * @returns {*}
     */
    currentHiddenItem() {
      return this.localListValidationError?.filter((item) => !item.isShow)
        .length;
    },
  },
};
</script>

<style scoped></style>
