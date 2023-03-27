<template>
  <div class="calc__icon-wrapper" :style="[width, height]">
    <img
      class="calc__icon_normal"
      :style="[behaviorImage]"
      v-if="showIcon"
      :src="urlIcon"
      :alt="alt"
    />
    <img
      class="calc__icon_hover"
      :style="[behaviorImage]"
      v-if="showHoverIcon"
      :src="urlIconHover"
      :alt="alt"
    />
    <img
      class="calc__icon_selected"
      :style="[behaviorImage]"
      v-if="showSelectedIcon"
      :src="urlIconSelected"
      :alt="alt"
    />
  </div>
</template>

<script>
import { mapState } from "pinia";
import { useBaseStore } from "@/store/piniaStore";

export default {
  name: "Icon-element",
  props: {
    iconSettings: {
      type: Object,
      default: () => {},
      require: true,
    },
    alt: {
      type: [String, Number],
      default: "",
    },
    isParentHover: {
      type: Boolean,
      default: false,
    },
    isParentSelected: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      baseSizeIcon: 32,
    };
  },
  computed: {
    ...mapState(useBaseStore, ["getImageDir"]),
    imageDir() {
      return this.getImageDir;
    },
    width() {
      const localValue = this.iconSettings?.maxWidth
        ? this.iconSettings?.maxWidth
        : this.baseSizeIcon;
      return "width:" + localValue + "px;";
    },
    height() {
      const localValue = this.iconSettings?.maxHeight
        ? this.iconSettings?.maxHeight
        : this.baseSizeIcon;
      return "height:" + localValue + "px;";
    },
    behaviorImage() {
      const behaviorImage = this.iconSettings?.behaviorImage
        ? this.iconSettings.behaviorImage
        : "contain";

      return "object-fit:" + behaviorImage + ";";
    },
    showIcon() {
      return !this.showHoverIcon && !this.showSelectedIcon;
    },
    showHoverIcon() {
      return (
        Boolean(this.iconSettings?.imageHover?.filename) &&
        this.isParentHover &&
        !this.isParentSelected
      );
    },
    showSelectedIcon() {
      return (
        Boolean(this.iconSettings?.imageSelected?.filename) &&
        this.isParentSelected
      );
    },
    urlIcon() {
      return this.imageDir + this.iconSettings?.image?.filename;
    },
    urlIconHover() {
      return this.imageDir + this.iconSettings?.imageHover?.filename;
    },
    urlIconSelected() {
      return this.imageDir + this.iconSettings?.imageSelected?.filename;
    },
  },
};
</script>

<style scoped></style>
