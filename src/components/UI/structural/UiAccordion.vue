<template>
  <div
    class="calc__accordion-wrapper"
    :class="[classes]"
    v-show="showBlock && isVisibilityFromDependency"
    :id="elementName"
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
    <dev-block
      :label="label"
      :element-name="elementName"
      :is-visibility-from-dependency="showBlock && isVisibilityFromDependency"
      :dependency-formula-display="dependencyFormulaDisplay"
      :parsing-formula-variables="formulaAfterProcessingVariables"
      hidden-cost
    ></dev-block>
  </div>
</template>

<script>
import UiAccordionItem from "@/components/UI/structural/UiAccordionItem.vue";
import devBlock from "@/components/UI/devMode/devBlock.vue";
import { MixinsForProcessingFormula } from "@/mixins/MixinsForProcessingFormula";
import UsePropsTemplates from "@/servises/UsePropsTemplates";
import DevBlock from "@/components/UI/devMode/devBlock.vue";

export default {
  name: "UiAccordion",
  components: { DevBlock, UiAccordionItem, devBlock },
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
      "dependencyFormulaDisplay",
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
