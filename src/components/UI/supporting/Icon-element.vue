<script setup>
import { computed, defineProps, ref } from "vue";
import { propsTemplate } from "@/servises/UsePropsTemplatesSingle";

import { getBaseStoreGetters } from "@/composables/useBaseStore";

const { getImageDir } = getBaseStoreGetters();
const props = defineProps({
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
});

const imageDir = computed(() => getImageDir.value);
const baseSizeIcon = ref(32);

const width = computed(() => {
  const value = props.iconSettings?.maxWidth
    ? props.iconSettings?.maxWidth
    : props.globalMaxWidth
    ? props.globalMaxWidth
    : baseSizeIcon.value;
  return "width:" + value + "px;";
});

const height = computed(() => {
  const value = props.iconSettings?.maxHeight
    ? props.iconSettings?.maxHeight
    : props.globalMaxHeight
    ? props.globalMaxHeight
    : baseSizeIcon.value;
  return "height:" + value + "px;";
});
const behaviorImage = computed(() => {
  const behaviorImage = props.iconSettings?.behaviorImage
    ? props.iconSettings.behaviorImage
    : "contain";

  return "object-fit:" + behaviorImage + ";";
});

const isIconFilenameExist = computed(() => {
  return Boolean(props.iconSettings?.image?.filename);
});

const showIcon = computed(() => {
  return isIconFilenameExist.value && !showHoverIcon.value && !showSelectedIcon.value;
});
const urlIcon = computed(() => {
  return imageDir.value + props.iconSettings.image?.filename;
});
const isIconHoverFilenameExist = computed(() => {
  return Boolean(props.iconSettings?.imageHover?.filename);
});
const showHoverIcon = computed(() => {
  return props.isParentHover && !showSelectedIcon.value && isIconHoverFilenameExist.value;
});
const urlIconHover = computed(() => {
  return imageDir.value + props.iconSettings.imageHover?.filename;
});
const isIconSelectedFilenameExist = computed(() => {
  return Boolean(props.iconSettings?.imageSelected?.filename);
});
const showSelectedIcon = computed(() => {
  return props.isParentSelected && isIconSelectedFilenameExist.value;
});
const urlIconSelected = computed(() => {
  return imageDir.value + props.iconSettings.imageSelected?.filename;
});
</script>

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
