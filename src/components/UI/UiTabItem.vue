<template>
  <div class="calc__tab-item-content-wrapper"
       v-show="isShowItem"
  >
    <div class="calc__background-image-wrapper" v-if="isBackgroundImage" :style="[...styleBackground]">
    </div>
    <div
      class="calc__tab-item-content"
      v-for="(template, key_in) in tabItem?.templates"
      :style="{ maxWidth: tabItem?.maxWidthSide + '%' }"
      :key="key_in"
    >
      <templates-wrapper
        :parent-is-show="parentIsShow"
        :template="template"
        :index="itemName + key_in"
        :parent-name="elementName"
        @changedValue="changeValue"
      />
    </div>
  </div>
</template>

<script>
import TemplatesWrapper from "@/components/UI/TemplatesWrapper";

import { useBaseStore } from "@/store/piniaStore";
import { mapState } from "pinia";
import UsePropsTemplates from "@/components/UI/UsePropsTemplates";

export default {
  name: "UiTabItem",
  components: { TemplatesWrapper },
  emits: ["changedValue"],
  props: {
    tabItem: {
      type: Object,
      default: () => {},
    },
    tabName: {
      type: String,
      default: "",
    },
    tabItemId: {
      type: Number,
    },
    shownIdTab: {
      type: Number,
      default: null,
    },
    ...UsePropsTemplates(["elementName", "parentIsShow"]),
  },
  data() {
    return {
      errorsElements: new Set(),
      visibilityList: new Set(),
    };
  },
  methods: {
    changeValue(data) {
      this.$emit("changedValue", data);
    },
  },
  computed: {
    ...mapState(useBaseStore, ["getValidationListOnParentName", "getImageDir"]),
    isShowItem() {
      return this.tabItemId === this.shownIdTab;
    },
    itemName() {
      return this.tabName + "_" + this.elementName;
    },
    isBackgroundImage() {
      return !!this?.tabItem?.backgroundImageSettings?.image?.filename;
    },
    styleBackgroundImageUrl() {
        return 'background-image : url("' + this.getImageDir + this.tabItem?.backgroundImageSettings?.image?.filename + '");';
    },
    styleBackgroundRepeat() {
      return 'background-repeat:' + this.tabItem?.backgroundImageSettings?.backgroundRepeat + ';';
    },
    styleBackgroundPosition() {
      return 'background-position:' + this.tabItem?.backgroundImageSettings?.backgroundPosition?.replace('-', ' ') + ';';
    },
    styleBackgroundBehaviorImage() {
      let size = this.tabItem?.backgroundImageSettings?.fixedSize ?
        (this.tabItem?.backgroundImageSettings?.maxWidth || 250) + '' + this.tabItem?.backgroundImageSettings?.unitSize + ' ' + (this.tabItem?.backgroundImageSettings?.maxHeight || 250) + '' + this.tabItem?.backgroundImageSettings?.unitSize
        :
        this.tabItem?.backgroundImageSettings?.behaviorImage;
      return 'background-size:' + size + ';';
    },
    styleBackground() {
      if (this.isBackgroundImage) {
        return [
          this.styleBackgroundImageUrl,
          this.styleBackgroundRepeat,
          this.styleBackgroundPosition,
          this.styleBackgroundBehaviorImage
        ]
      }
      return [];
    }
  },
};
</script>
