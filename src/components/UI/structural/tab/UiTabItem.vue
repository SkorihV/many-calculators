<script setup>
import TemplatesWrapper from "@/components/UI/supporting/TemplatesWrapper.vue";
import TemplatesWrapperColumn from "@/components/UI/supporting/TemplatesWrapperColumn.vue";
import BackgroundImageElement from "@/components/UI/supporting/background-image-element.vue";
import {propsTemplate} from "@/servises/UsePropsTemplatesSingle";
import { computed, ref } from "vue";
import {getCurrentWidthElement} from "@/composables/useWidthElement";

const emits = defineEmits(["changedValue"])
const props = defineProps({
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
  shownIdTab: {
    type: Number,
    default: null,
  },
  ...propsTemplate.getProps(["elementName", "parentIsShow"]),
})

const parentRef = ref(null)

function changeValue(data) {
  emits("changedValue", data);
}

const isShowItem = computed(() => {
  return props.tabItemId === props.shownIdTab;
})
const {currentWidthElement} = getCurrentWidthElement(isShowItem, parentRef)

const itemName = computed(() => {
  return props.tabName + "_" + props.elementName;
})
const maxWidth = computed(() => {
  return currentWidthElement.value > 600
      ? props.tabItem?.maxWidthSide + "%"
      : "100%";
})


</script>

<template>
  <div class="calc__tab-item-content-wrapper" v-show="isShowItem" ref="parentRef">
    <background-image-element
      v-if="tabItem?.backgroundImageSettings"
      :image-settings-data="tabItem?.backgroundImageSettings"
    />
    <div
      class="calc__tab-item-content"
      v-for="(template, key_in) in tabItem?.templates"
      :style="{ maxWidth: maxWidth }"
      :key="key_in"
    >
      <templates-wrapper-column
        v-if="template?.template === 'UiColumns'"
        :parent-is-show="parentIsShow"
        :template="template"
        :index="itemName + '_' + key_in"
        :parent-name="elementName"
        :change-state-parent="isShowItem"
        @changedValue="changeValue"
      />
      <templates-wrapper
        v-else
        :parent-is-show="parentIsShow"
        :template="template"
        :index="itemName + key_in"
        :parent-name="elementName"
        @changedValue="changeValue"
      />
    </div>
  </div>
</template>
