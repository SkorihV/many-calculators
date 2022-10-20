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
      @changedValue="changeValue"
      @changeValid="changeValid"
    />
  </div>
</template>

<script>
import TemplatesWrapper from "@/components/UI/TemplatesWrapper";

export default {
  name: "UiTabItem",
  components: {TemplatesWrapper},
  emits: ["changedValue", "changeValid"],
  props: {
    tabItem: {
      type: Object,
      default: () => {}
    },
    tabName: {
      type: String,
      default: ''
    },
    tabItemId: {
      type: Number
    },
    elementName: {
      type: String,
      default: Math.random().toString(),
    },
    shownIdTab: {
      type: Number,
      default: null
    },
    parentIsShow: {
      type: Boolean,
      default: true
    }
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
    changeValid(data) {

      if (data.isShow) {
        this.visibilityList.add(data.name);
      } else {
        if (this.visibilityList.has(data.name)) {
          this.visibilityList.delete(data.name);
        }
      }

      let infoOnTab = {
        index: this.tabItemId,
        isShown: this.isShowTabsItem
      }
      this.$emit("changeValid", { data, infoOnTab});
    },
  },
  computed: {
    isShowItem(){
      return this.tabItemId === this.shownIdTab && this.isShowTabsItem;
    },
    isShowTabsItem(){
      return Boolean(this.visibilityList.size);
    },
    itemName() {
      return this.tabName + '_' + this.elementName;
    }
  },
};
</script>

<style scoped>

</style>
