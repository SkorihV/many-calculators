<template>
  <div class="calc__accordion-wrapper" :class="[classes]" v-if="showBlock">
    <div class="calc__accordion-main-label" v-if="accordionData?.label?.length">
      {{ accordionData.label }}
    </div>
    <div
      class="calc__accordion-item-label-wrapper"
      v-if="accordionData?.items?.length"
      v-for="(item, key) in accordionData.items"
      :key="key"
    >
      <ui-accordion-item
        :accordionItem="item"
        :accordion-name="elementName"
        :accordion-item-id="key"
        :element-name="item?.json_id || 'accordionItem' + key"
        @changedValue="changedValue"
        @changeValid="changeValid"
      />
    </div>
  </div>
</template>

<script>
import UiAccordionItem from "@/components/UI/UiAccordionItem";

export default {
  name: "UiAccordion",
  components: { UiAccordionItem },
  emits: ["changedValue", "changeValid"],
  inject: ["globalCanBeShownTooltip"],
  props: {
    accordionData: {
      type: Object,
      default: () => {},
    },
    elementName: {
      type: String,
      default: Math.random().toString(),
    },
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
    changedValue(data) {
      this.$emit("changedValue", data);
    },
    changeValid(data) {
      this.$emit("changeValid", data);
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

<style scoped lang="scss">
//normal orange - FF5D2B
//normal dark- 464657
//hover orange - FF7044
//hover dark- 5A5A70
//font - 00000
//серый - CCCCCC
// border - E6E6E6 -
// background - F2F2F2

$color-dark-normal: #464657;
$color-orange-normal: #ff5d2b;

$color-dark-hover: #5a5a70;
$color-orange-hover: #ff7044;

$color-danger: #ff4444;

$color-black: #000000;
$color-white: #ffffff;

$color-gray-light: #f2f2f2;
$color-gray-middle: #e6e6e6;
$color-gray-dark: #cccccc;

$border-radius: 4px;

@mixin style-border {
  border: 1px solid $color-gray-middle;
  border-radius: $border-radius;
}

@mixin style-border-hover {
  border: 1px solid $color-gray-dark;
}

@mixin style-button {
  color: $color-white;
  cursor: pointer;
  background-color: $color-dark-normal;
  @include style-flex-center;
  @include style-border;
}

@mixin style-button-hover {
  background-color: $color-dark-hover;
  box-shadow: 0 0 3px 1px $color-gray-dark;
}

@mixin style-flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

@mixin style-flex-start {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

@mixin style-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.calc {
}
</style>
