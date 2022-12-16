<template>
  <div
    class="calc__accordion-wrapper"
    :class="[classes]"
    v-show="isVisibilityFromDependency"
  >
    <div class="calc__accordion-main-label" v-if="accordionData?.label?.length">
      {{ accordionData.label }}
    </div>
    <template v-if="accordionData?.items?.length">
      <template
        v-for="(item, key) in accordionData.items"
        :key="key"
      >
        <div
          class="calc__accordion-item-label-wrapper"
          v-show="itemsIsShow[key]"
        >
          <ui-accordion-item
            :parent-is-show="isVisibilityFromDependency"
            :accordionItem="item"
            :accordion-name="elementName"
            :accordion-item-id="key"
            :element-name="elementName + '_' + key"
            @changedValue="changeValue"
          />
        </div>
      </template>
    </template>
  </div>
</template>

<script>
import UiAccordionItem from "@/components/UI/UiAccordionItem";
import { MixinsForProcessingFormula } from "@/components/UI/MixinsForProcessingFormula";
import UsePropsTemplates from "@/components/UI/UsePropsTemplates";
import { ref, computed, reactive } from "vue";
import { useBaseStore } from "@/store/piniaStore";

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
    ...UsePropsTemplates(["label", "elementName", "classes"]),
  },
  setup(props, { emit }) {
    const itemOpenId = ref(null);
    const accordionData = reactive(props.accordionData);
    const elementName = props.elementName;
    const classes = props.classes;
    const itemsIsShow = ref([])

    function openItem(index){
      itemOpenId.value = itemOpenId.value !== index ? index : null;
    }

    const changeValue = ({ data, itemIsShow, index }) => {
      itemsIsShow.value[index] = itemIsShow?.value ?? true;
      emit("changedValue", data);
    };

    return {
      changeValue,
      openItem,
      accordionData,
      elementName,
      classes,
      itemsIsShow
    };
  },
};
</script>
