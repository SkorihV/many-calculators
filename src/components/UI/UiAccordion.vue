<template>
  <div
    class="calc__accordion-wrapper"
    :class="[classes]"
    v-show="showBlock && isVisibilityFromDependency"
  >
    <div class="calc__accordion-main-label" v-if="accordionData?.label?.length">
      {{ accordionData.label }}
    </div>
    <template v-if="accordionData?.items?.length">
      <ui-accordion-item
        v-for="(item, key) in accordionData.items"
        :key="key"
        :parent-is-show="isVisibilityFromDependency"
        :accordionItem="item"
        :accordion-name="elementName"
        :accordion-item-id="key"
        :element-name="elementName + item?.json_id + '_' + key"
        @changedValue="changeValue"
      />
    </template>
  </div>
</template>

<script>
import UiAccordionItem from "@/components/UI/UiAccordionItem";
import { MixinsForProcessingFormula } from "@/components/UI/MixinsForProcessingFormula";
import UsePropsTemplates from "@/components/UI/UsePropsTemplates";

export default {
  name: "UiAccordion",
  components: { UiAccordionItem },
  emits: ["changedValue"],
  mixins: [MixinsForProcessingFormula],
  props: {
    accordionData: {
      type: Object,
      default: () => {},
    },
    maxWidth: {
      type: [String, Number],
      default: 100,
    },
    ...UsePropsTemplates([
      "label",
      "elementName",
      "classes",
      "parentIsShow",
      "dependencyFormulaDisplay"
    ]),
  },
  data() {
    return {
      itemOpenId: null,
    };
  },
  methods: {
    openItem(index) {
      this.itemOpenId = this.itemOpenId !== index ? index : null;
    },
    changeValue(data) {
      this.$emit("changedValue", data);
    },
  },
  computed: {
    /**
     *
     * @returns {boolean}
     */
    showBlock() {
      let result = [];
      if (this.accordionData?.items.length) {
        result = this.accordionData?.items.map((item) => {
          if (item?.templates?.length) {
            return Boolean(item.templates.length);
          }
          return false;
        });
      }
      return result.some((item) => item);
    },
  },
};
</script>
