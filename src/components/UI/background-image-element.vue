<template>
  <div
    class="calc__background-image-wrapper"
    v-if="isBackgroundImage"
    :style="[...styleBackground]"
  >
    <div v-if="isSubstrate" :style="[colorSubstrate, opacitySubstrate]" class="calc__background-image-substrate"></div>
  </div>
</template>

<script>
import { mapState } from "pinia";
import { useBaseStore } from "@/store/piniaStore";

export default {
  name: "background-image-element",
  props:{
    imageSettingsData: {
      type: Object,
      default: () => {}
    }
  },
  computed: {
  ...mapState(useBaseStore, ["getImageDir"]),
    isBackgroundImage() {
      return !!this.imageSettingsData?.image?.filename;
    },
    isSubstrate() {
      return !!this.imageSettingsData?.isSubstrate;
    },
    colorSubstrate() {
      return this?.imageSettingsData?.colorSubstrate ? "background-color:" + this?.imageSettingsData?.colorSubstrate + ";" : '';
    },
    opacitySubstrate() {
      return "opacity:" + Number(this?.imageSettingsData?.opacitySubstrate) / 100 + ";";
    },
    styleBackgroundImageUrl() {
      return (
        'background-image : url("' +
        this.getImageDir +
        this.imageSettingsData?.image?.filename +
        '");'
      );
    },
    styleBackgroundRepeat() {
      return (
        "background-repeat:" +
        this.imageSettingsData?.backgroundRepeat +
        ";"
      );
    },
    styleBackgroundPosition() {
      return (
        "background-position:" +
        this.imageSettingsData?.backgroundHorizontalPosition +
          " " +
          this.imageSettingsData?.backgroundVerticalPosition +
        ";"
      );
    },
    styleBackgroundBehaviorImage() {
      let size = this.imageSettingsData?.fixedSize
        ? (this.imageSettingsData?.maxWidth || 250) +
        this.imageSettingsData?.unitSize +
        " " +
        (this.imageSettingsData?.maxHeight || 250) +
        this.imageSettingsData?.unitSize
        : this.imageSettingsData?.behaviorImage;

      return "background-size:" + size + ";";
    },
    styleBackground() {
      if (this.isBackgroundImage) {
        return [
          this.styleBackgroundImageUrl,
          this.styleBackgroundRepeat,
          this.styleBackgroundPosition,
          this.styleBackgroundBehaviorImage,
        ];
      }
      return [];
    },
  },
};
</script>

<style scoped>

</style>
