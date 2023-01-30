<template>
  <div class="calc__icon-wrapper" :style="[width, height]">
      <img
        :src="iconsData?.filename"
        :alt="alt"
      />
  </div>
</template>

<script>

import {mapState} from "pinia";
import { useBaseStore } from "@/store/piniaStore";

export default {
  name: "Icon-element",
  props: {
    iconsData: {
      type: Object,
      default: () => {},
      require: true
    },
    alt: {
      type: String,
      default: ""
    },
    maxWidth: {
      type: Number,
      default: 32
    },
    maxHeight: {
      type: Number,
      default: 32
    }
  },
  computed: {
    ...mapState(useBaseStore,[
      'getImageDir'
    ]),
    imageDir() {
      return this.getImageDir;
    },
    width() {
      return "max-width:" + this.maxWidth + "px;";
    },
    height() {
      return "max-height:" + this.maxHeight + "px;";
    }

  }
};
</script>

<style scoped>

</style>
