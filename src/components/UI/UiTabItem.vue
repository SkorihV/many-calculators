<template>
  <div class="calc__tab-item-content-wrapper" v-show="isShowItem">
    <background-image-element
      v-if="this.tabItem?.backgroundImageSettings"
      :image-settings-data="this.tabItem?.backgroundImageSettings"
    />
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
import BackgroundImageElement from "@/components/UI/background-image-element";

import { useBaseStore } from "@/store/piniaStore";
import { mapState } from "pinia";
import UsePropsTemplates from "@/components/UI/UsePropsTemplates";

export default {
  name: "UiTabItem",
  components: { BackgroundImageElement, TemplatesWrapper },
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
  },
};
</script>
