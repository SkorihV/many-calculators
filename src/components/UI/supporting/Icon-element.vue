<template>
  <div class="calc__icon-wrapper" :style="[width, height]">
    <img
      class="calc__icon_normal"
      v-show="showIcon"
      :src="urlIcon"
      :alt="alt"
    />
    <img
      class="calc__icon_hover"
      v-show="showHoverIcon"
      :src="urlIconHover"
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
  },
  data() {
    return {
      baseSizeIcon: 32,
    }
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
    showIcon() {
      return !this.showHoverIcon;
    },
    showHoverIcon() {
      return (
        Boolean(this.iconSettings?.imageHover?.filename) && this.isParentHover
      );
    },
    urlIcon() {
      return this.imageDir + this.iconSettings?.image?.filename;
    },
    urlIconHover() {
      return this.imageDir + this.iconSettings?.imageHover?.filename;
    },
  },
};
</script>

<style scoped></style>
