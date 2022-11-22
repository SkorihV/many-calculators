<template>
  <div
    class="calc__accordion-item-label"
    @click="isOpen = !isOpen"
    v-show="isShowAccordionItem"
    :class="{ isOpen: isOpen, isError: isShowError && !isOpen }"
  >
    <div class="calc__accordion-item-plus" v-if="!isOpen"></div>
    <div class="calc__accordion-item-minus" v-if="isOpen"></div>
    {{ accordionItem.label }}
    <ui-prompt
      v-if="accordionItem?.prompt?.length"
      :prompt-text="accordionItem.prompt"
    />
    <ui-tooltip
      :is-show="isShowError"
      tooltip-text="Во вкладке есть не корректно заполненные поля."
    ></ui-tooltip>
  </div>

  <div
    class="calc__accordion-item-content"
    v-show="isOpen"
    v-for="(template, key_in) in accordionItem?.templates"
    :key="key_in"
  >
    <templates-wrapper
      :parent-is-show="parentIsShow"
      :template="template"
      :index="itemIdName + '_' + key_in"
      :parent-name="elementName"
      @changedValue="changeValue"
    />
  </div>
</template>

<script>
import UiTooltip from "@/components/UI/UiTooltip";
import UiPrompt from "@/components/UI/UiPrompt";
import TemplatesWrapper from "@/components/UI/TemplatesWrapper";
import { mapGetters } from "vuex";

export default {
  name: "UiAccordionItem",
  components: { UiTooltip, UiPrompt, TemplatesWrapper },
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
    elementName: {
      type: String,
      default: Math.random().toString(),
    },
    parentIsShow: {
      type: Boolean,
      default: true,
    },
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
    changeValid(data) {
      if (this.checkAllowedErrors(data)) {
        this.errorsElements.add(data.name);
      } else {
        if (this.errorsElements.has(data.name)) {
          this.errorsElements.delete(data.name);
        }
      }
      if (data.isShow) {
        this.visibilityList.add(data.name);
      } else {
        if (this.visibilityList.has(data.name)) {
          this.visibilityList.delete(data.name);
        }
      }

      if (!this.parentIsShow) {
        return false;
      }

      this.$emit("changeValid", data);
    },

    /**
     * Проверяем можно ли собрать ошибки вложенных элементов
     *
     * @param data
     * @returns {boolean}
     */
    checkAllowedErrors(data) {
      return (
        data.error &&
        data.eventType !== "delete" &&
        data.isShow &&
        this.isCanShowAllTooltips
      );
    },
  },
  computed: {
    ...mapGetters(["isCanShowAllTooltips", "getValidationListOnParentName"]),
    isShowError() {
      return this.localListValidationError.some(
        (item) => item.error && item.isShow && this.isCanShowAllTooltips
      );
      //
      // return Boolean(this.errorsElements.size);
    },
    isShowAccordionItem() {
      return this.currentChildrenItem !== this.currentHiddenItem;
      // return Boolean(this.visibilityList.size);
    },
    itemIdName() {
      return (
        this.accordionName + "_" + this.elementName + "_" + this.accordionItemId
      );
    },
    localListValidationError() {
      return this.getValidationListOnParentName(this.elementName);
    },
    currentChildrenItem() {
      return this.accordionItem?.templates.length
        ? this.accordionItem?.templates.length
        : 0;
    },
    currentHiddenItem() {
      return this.localListValidationError.filter((item) => !item.isShow)
        .length;
    },
  },
};
</script>

<style scoped></style>
