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
import UsePropsTemplates from "@/components/UI/UsePropsTemplates";
import { ref, computed, reactive } from "vue";

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
    ...UsePropsTemplates(['label', 'elementName', 'classes'])
  },
  setup(props, {emit}) {
    const itemOpenId = ref(null);
    const accordionData = reactive(props.accordionData);

    const openItem = (index) => {
      itemOpenId.value = itemOpenId.value !== index ? index : null;
    }

    const changeValue = (data) => {
      emit("changedValue", data);
    }

    const showBlock = computed(() => {
      let result = [];
      if (accordionData?.items.length) {
        result = accordionData?.items.map((item) => {
          if (item?.templates?.length) {
            return Boolean(item.templates.length);
          }
          return false;
        });
      }
      return result.some((item) => item);
    })

    return {
      showBlock,
      changeValue,
      openItem,
    }
  },
};
</script>
