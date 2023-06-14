<template>
  <div class="calc__icon-wrapper" :style="[width, height]">
    <template v-if="isIconFilenameExist">
      <img
        class="calc__icon_normal"
        :style="[behaviorImage]"
        v-show="showIcon"
        :src="urlIcon"
        :alt="alt"
      />
    </template>
    <template v-if="isIconHoverFilenameExist">
      <img
        class="calc__icon_hover"
        :style="[behaviorImage]"
        v-show="showHoverIcon"
        :src="urlIconHover"
        :alt="alt"
      />
    </template>
    <template v-if="isIconSelectedFilenameExist">
      <img
        class="calc__icon_selected"
        :style="[behaviorImage]"
        v-show="showSelectedIcon"
        :src="urlIconSelected"
        :alt="alt"
      />
    </template>
  </div>
</template>

<script>
import { mapState } from "pinia";
import { useBaseStore } from "@/store/piniaStore";
import { propsTemplate } from "@/servises/UsePropsTemplatesSingle";

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
    ...propsTemplate.getProps(["globalMaxWidth", "globalMaxHeight"]),
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
      const value = this.iconSettings?.maxWidth
        ? this.iconSettings?.maxWidth
        : this.globalMaxWidth
        ? this.globalMaxWidth
        : this.baseSizeIcon;
      return "width:" + value + "px;";
    },
    height() {
      const value = this.iconSettings?.maxHeight
        ? this.iconSettings?.maxHeight
        : this.globalMaxHeight
        ? this.globalMaxHeight
        : this.baseSizeIcon;
      return "height:" + value + "px;";
    },
    behaviorImage() {
      const behaviorImage = this.iconSettings?.behaviorImage
        ? this.iconSettings.behaviorImage
        : "contain";

      return "object-fit:" + behaviorImage + ";";
    },
    showIcon() {
      return this.isIconFilenameExist && !this.showHoverIcon && !this.showSelectedIcon;
    },
    showHoverIcon() {
      return this.isIconHoverFilenameExist && this.isParentHover && !this.showSelectedIcon;
    },
    showSelectedIcon() {
      return this.isParentSelected && this.isIconSelectedFilenameExist;
    },
    isIconFilenameExist() {
      return Boolean(this.iconSettings?.image?.filename);
    },
    urlIcon() {
      return this.imageDir + this.iconSettings.image?.filename;
    },
    isIconHoverFilenameExist() {
      return Boolean(this.iconSettings?.imageHover?.filename);
    },
    urlIconHover() {
      return this.imageDir + this.iconSettings.imageHover?.filename;
    },
    isIconSelectedFilenameExist() {
      return Boolean(this.iconSettings?.imageSelected?.filename);
    },
    urlIconSelected() {
      return this.imageDir + this.iconSettings.imageSelected?.filename;
    },
  },
};
</script>

<style scoped></style>
