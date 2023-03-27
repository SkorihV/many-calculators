<template>
  <div class="calc__icon-element-label-wrapper" v-if="isExistLabel || isImage">
    <icon-element
      v-if="showLeftIcon"
      :alt="alt"
      :icon-settings="iconSettings"
      :is-parent-hover="isParentHover"
      :is-parent-selected="isParentSelected"
    />
    <slot />
    <icon-element
      v-if="showRightIcon"
      :alt="alt"
      :icon-settings="iconSettings"
      :is-parent-hover="isParentHover"
      :is-parent-selected="isParentSelected"
    />
  </div>
</template>

<script>
import IconElement from "@/components/UI/supporting/Icon-element.vue";
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
  },
  computed: {
    isImage() {
      return Boolean(this.iconSettings?.image?.filename);
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
