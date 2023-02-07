<template>
  <div class="calc__icon-wrapper" :style="[width, height]">
    <img :src="imageDir + iconSettings?.image?.filename" :alt="alt" />
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
      type: String,
      default: "",
    },
  },
  computed: {
    ...mapState(useBaseStore, ["getImageDir"]),
    imageDir() {
      return this.getImageDir;
    },
    width() {
      let localValue = this.iconSettings?.maxWidth
        ? this.iconSettings?.maxWidth
        : 32;
      return "max-width:" + localValue + "px;";
    },
    height() {
      let localValue = this.iconSettings?.maxWidth
        ? this.iconSettings?.maxWidth
        : 32;
      return "max-height:" + localValue + "px;";
    },
  },
};
</script>

<style scoped></style>
