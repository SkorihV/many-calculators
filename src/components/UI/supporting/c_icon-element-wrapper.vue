<script setup>
import { defineProps, computed } from "vue";
import { propsTemplate } from "@/servises/UsePropsTemplatesSingle";
import IconElement from "@/components/UI/supporting/c_Icon-element.vue";

const props = defineProps({
  iconSettings: {
    type: Object,
    default: () => {},
  },
  isParentHover: {
    type: Boolean,
    default: false,
  },
  isParentSelected: {
    type: Boolean,
    default: false,
  },
  alt: {
    type: [String, Number],
    default: "",
  },
  isExistLabel: {
    type: Boolean,
    default: true,
  },
  ...propsTemplate.getProps(["isColumn", "globalMaxWidth", "globalMaxHeight"]),
});

const isImage = computed(() => {
  return Boolean(props.iconSettings?.image?.filename);
});
const showLeftIcon = computed(() => {
  return isImage.value && props.iconSettings?.location === "leftSide";
});
const showRightIcon = computed(() => {
  return isImage.value && props.iconSettings?.location === "rightSide";
});
</script>

<template>
  <div
    class="calc__icon-element-label-wrapper"
    v-if="isExistLabel || isImage"
    :class="{ column: isColumn }"
  >
    <icon-element
      v-if="showLeftIcon"
      :alt="alt"
      :icon-settings="iconSettings"
      :is-parent-hover="isParentHover"
      :is-parent-selected="isParentSelected"
      :global-max-width="globalMaxWidth"
      :global-max-height="globalMaxHeight"
    />
    <slot />
    <icon-element
      v-if="showRightIcon"
      :alt="alt"
      :icon-settings="iconSettings"
      :is-parent-hover="isParentHover"
      :is-parent-selected="isParentSelected"
      :global-max-width="globalMaxWidth"
      :global-max-height="globalMaxHeight"
    />
  </div>
</template>
