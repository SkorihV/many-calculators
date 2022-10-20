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
    <ui-prompt v-if="accordionItem?.prompt?.length" :prompt-text="accordionItem.prompt" />
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
      @changedValue="changeValue"
      @changeValid="changeValid"
    />
  </div>
</template>

<script>
import UiTooltip from "@/components/UI/UiTooltip";
import UiPrompt from "@/components/UI/UiPrompt";
import TemplatesWrapper from "@/components/UI/TemplatesWrapper";

export default {
  name: "UiAccordionItem",
  components: {UiTooltip, UiPrompt, TemplatesWrapper},
  emits: ["changedValue", "changeValid"],
  inject: ["globalCanBeShownTooltip"],
  props: {
    accordionItem: {
      type: Object,
      default: () => {}
    },
    accordionName: {
      type: String,
      default: ''
    },
    accordionItemId: {
      type: Number
    },
    elementName: {
      type: String,
      default: Math.random().toString(),
    },
    parentIsShow: {
      type: Boolean,
      default: true
    }
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
      return (data.error &&
        data.eventType !== "delete" &&
        data.isShow &&
        this.globalCanBeShownTooltip);
    },
  },
  computed: {
    isShowError() {
      return Boolean(this.errorsElements.size)
    },
    isShowAccordionItem( ){
      return Boolean(this.visibilityList.size);
    },
    itemIdName() {
      return this.accordionName + '_' + this.elementName + '_' + this.accordionItemId;
    }
  },
};
</script>

<style scoped>

</style>
