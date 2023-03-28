<template>
  <div class="calc__tab-item-content-wrapper" v-show="isShowItem">
    <background-image-element
      v-if="this.tabItem?.backgroundImageSettings"
      :image-settings-data="this.tabItem?.backgroundImageSettings"
    />
    <div
      class="calc__tab-item-content"
      v-for="(template, key_in) in tabItem?.templates"
      :style="{ maxWidth: maxWidth }"
      :key="key_in"
    >
      <templates-wrapper-column
        v-if="template?.template === 'UiColumns'"
        :parent-is-show="parentIsShow"
        :template="template"
        :index="itemName + '_' + key_in"
        :parent-name="elementName"
        @changedValue="changeValue"
      />
      <templates-wrapper
        v-else
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
import TemplatesWrapper from "@/components/UI/supporting/TemplatesWrapper.vue";
import TemplatesWrapperColumn from "@/components/UI/supporting/TemplatesWrapperColumn.vue";
import BackgroundImageElement from "@/components/UI/supporting/background-image-element.vue";
import { MixinCurrentWidthElement } from "@/mixins/MixinCurrentWidthElement";

import { useBaseStore } from "@/store/piniaStore";
import { mapState } from "pinia";
import { propsTemplate } from "@/servises/UsePropsTemplatesSingle";

export default {
  name: "UiTabItem",
  components: {
    BackgroundImageElement,
    TemplatesWrapper,
    TemplatesWrapperColumn,
  },
  mixins: [MixinCurrentWidthElement],
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
    ...propsTemplate.getProps(["elementName", "parentIsShow"]),
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
    maxWidth() {
      return this.currentWidthElement > 600
        ? this.tabItem?.maxWidthSide + "%"
        : "100%";
    },
  },
};
</script>
