<template>
  <icon-element
    v-if="showLeftIcon"
    :alt="alt"
    :icon-settings="iconSettings"
    :is-parent-hover="isParentHover"
  />
  <slot />
  <icon-element
    v-if="showRightIcon"
    :alt="alt"
    :icon-settings="iconSettings"
    :is-parent-hover="isParentHover"
  />
</template>

<script>
import IconElement from "@/components/UI/Icon-element.vue";
export default {
  name: "icon-element-wrapper",
  components: {
    IconElement,
  },
  props: {
    iconSettings: {
      type: Object,
      default: () => {},
    },
    isParentHover: {
      type: Boolean,
      default: false,
    },
    alt: {
      type: [String, Number],
      default: "",
    },
  },
  computed: {
    isImage() {
      return !!this.iconSettings?.image?.filename;
    },
    showLeftIcon() {
      return this.isImage && this.iconSettings?.location === "leftSide";
    },
    showRightIcon() {
      return this.isImage && this.iconSettings?.location === "rightSide";
    },
  },
};
</script>

<style scoped></style>
