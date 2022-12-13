<template>
  <div
    ref="parent"
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

import { useBaseStore } from "@/store/piniaStore";
import UsePropsTemplates from "@/components/UI/UsePropsTemplates";
import { ref, computed } from "vue";

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
    ...UsePropsTemplates(["elementName", "parentIsShow"]),
  },
  setup(props, { emit }) {
    const store = useBaseStore();
    const isOpen = ref(false);

    const changeValue = (data) => {
      emit("changedValue", data);
    };

    const localListValidationError = computed(() => {
      return store.getValidationListOnParentName(props.elementName);
    });
    const isShowError = computed(() => {
      return localListValidationError.value.some(
        (item) => item.error && item.isShow && store.isCanShowAllTooltips
      );
    });

    const isShowAccordionItem = computed(() => {
      return currentChildrenItem.value !== currentHiddenItem.value;
    });

    const currentChildrenItem = computed(() => {
      return props.accordionItem?.templates.length
        ? props.accordionItem?.templates.length
        : 0;
    });

    const currentHiddenItem = computed(() => {
      return localListValidationError.value.filter((item) => !item.isShow)
        .length;
    });

    const itemIdName = computed(() => {
      return (
        props.accordionName +
        "_" +
        props.elementName +
        "_" +
        props.accordionItemId
      );
    });

    return {
      isShowAccordionItem,
      isShowError,
      itemIdName,
      changeValue,
      isOpen,
    };
  },
};
</script>

<style scoped></style>
