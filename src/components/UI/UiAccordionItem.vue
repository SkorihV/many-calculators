<template>
  <div
    ref="parent"
    class="calc__accordion-item-label"
    @click="isOpen = !isOpen"
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
import { ref, computed, watch, reactive, toRef } from "vue";

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
    showItem: {
      type: Boolean,
      default: false
    },
    ...UsePropsTemplates(["elementName", "parentIsShow"]),
  },
  setup(props, { emit }) {
    const store = useBaseStore();
    const isOpen = ref(false);
    const accordionItem = reactive(props.accordionItem)
    const shownItems = reactive({});
    const elementName = props.elementName;
    const index = props.accordionItemId

    const itemIsShow = computed(() => {
      return Object.values(shownItems).some(item => item)
    })

    function changeValue(data){
      shownItems[data.name] = data.isShow;
      emit("changedValue", { data, itemIsShow, index });
    }



    const localListValidationError = computed(() => {
      return store.getValidationListOnParentName(elementName);
    });
    const isShowError = computed(() => {
      return localListValidationError.value.some(
        (item) => item.error && item.isShow && store.isCanShowAllTooltips
      );
    });

    const itemIdName = computed(() => {
      return (
        elementName +
        "_" +
        props.accordionItemId
      );
    });

    const parentIsShow = toRef(props, 'parentIsShow')


    return {
      isShowError,
      itemIdName,
      changeValue,
      isOpen,
      parentIsShow,
      elementName,
      accordionItem,
      shownItems,
      showCurrentItem: itemIsShow

    };
  },
};
</script>

<style scoped></style>
