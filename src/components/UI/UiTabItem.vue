<template>
  <div
    class="calc__tab-item-content"
    v-show="isShowItem"
    v-for="(template, key_in) in tabItem?.templates"
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
</template>

<script>
import TemplatesWrapper from "@/components/UI/TemplatesWrapper";
import { mapGetters } from "vuex";

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
    elementName: {
      type: String,
      default: Math.random().toString(),
    },
    shownIdTab: {
      type: Number,
      default: null,
    },
    parentIsShow: {
      type: Boolean,
      default: true,
    },
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
    ...mapGetters(["getValidationListOnParentName"]),
    isShowItem() {
      return this.tabItemId === this.shownIdTab;
    },
    itemName() {
      return this.tabName + "_" + this.elementName;
    },
  },
};
</script>

<style scoped></style>
