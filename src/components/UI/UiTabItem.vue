<template>
  <div
    class="calc__tab-item-content"
    v-show="isShowItem"
    v-for="(template, key_in) in tabItem?.templates"
    :key="key_in"
  >
    <templates-wrapper
      :parent-is-show="parentIsShow"
      :template="template"
      :index="itemName + key_in"
      :parent-name="elementName"
      @changedValue="changeValue"
    />
  </div>
</template>

<script>
import TemplatesWrapper from "@/components/UI/TemplatesWrapper";

import {computed, toRef} from "vue";
import { useBaseStore } from "@/store/piniaStore";

export default {
  name: "UiTabItem",
  components: { TemplatesWrapper },
  emits: ["changedValue"],
  props: {
    tabItem: {
      type: Object,
      default: () => {},
    },
    tabName: {
      type: String,
      default: "",
    },
    tabItemId: {
      type: Number,
    },
    elementName: {
      type: String,
      default: Math.random().toString(),
    },
    shownIdTab: {
      type: Number,
      default: null,
    },
    parentIsShow: {
      type: Boolean,
      default: true,
    },
  },

  setup(props, {emit}) {
    const store = useBaseStore();
    const getValidationListOnParentName = toRef(store, 'getValidationListOnParentName')

    const changeValue = (data) => {
      emit("changedValue", data);
    }

    const isShowItem = computed(() => {
      return props.tabItemId === props.shownIdTab;
    })

    const itemName = computed(() => {
      return props.tabName + "_" + props.elementName;
    })

    return {
      changeValue,
      getValidationListOnParentName,
      isShowItem,
      itemName
    }
  },
};
</script>

<style scoped></style>
