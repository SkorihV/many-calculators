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
      <div
        class="calc__accordion-item-label-wrapper"
        v-for="(item, key) in accordionData.items"
        :key="key"
      >
        <ui-accordion-item
          :parent-is-show="isVisibilityFromDependency"
          :accordionItem="item"
          :accordion-name="elementName"
          :accordion-item-id="key"
          :element-name="elementName + item?.json_id + '_' + key"
          @changedValue="changeValue"
        />
      </div>
    </template>
  </div>
</template>

<script>
import UiAccordionItem from "@/components/UI/UiAccordionItem";
import { MixinsForProcessingFormula } from "@/components/UI/MixinsForProcessingFormula";

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
    /**
     * заголовок
     */
    label: {
      type: String,
      default: "",
    },
    /**
     * имя необходимое для корректной работы Label
     */
    elementName: {
      type: String,
      default: "",
    },
    /**
     * Список классов для переопределения стилей на обертке
     */
    classes: {
      type: String,
      default: null,
    },
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
