<template>
  <div class="calc__accordion-wrapper" :class="[classes]" v-if="showBlock">
      <div class="calc__accordion-main-label" v-if="accordionData?.label?.length">{{accordionData.label}}</div>
      <div class="calc__accordion-item-label-wrapper" v-if="accordionData?.items?.length" v-for="(item, key) in accordionData.items" :key="key">
        <div class="calc__accordion-item-label" @click="openItem(key)" :class="{isOpen: key === itemOpenId}">{{item.title}}</div>
        <div class="calc__accordion-item-content" v-show="key === itemOpenId" v-for="(template, key_in) in item?.templates" :key="key_in">
            <templates-wrapper
              :template="template"
              :index="elementName + '_' + key_in"
              @changedValue="changeValue"
              @changeValid="changeValid"
            />
        </div>
      </div>
  </div>
</template>

<script>
import TemplatesWrapper from "@/components/UI/TemplatesWrapper";

export default {
  name: "UiAccordion",
  components: {TemplatesWrapper},
  emits: ["changedValue", "changeValid"],
  props: {
    accordionData: {
      type: Object,
      default: () => {}
    },
    elementName: {
      type: String,
      default: Math.random().toString(),
    },
    classes: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      itemOpenId: null,
      errorsElements: new Set(),
    };
  },
  methods: {
    openItem(index) {
      this.itemOpenId = this.itemOpenId !== index ? index : null;
    },
    changeValue(data){
      this.$emit("changedValue", data);
    },
    changeValid(data) {
      this.$emit("changeValid", data);
      if (data.error) {
        this.errorsElements.add(data.name);
      } else {
        if (this.errorsElements.has(data.name)) {
          this.errorsElements.delete(data.name);
        }
      }
    }
  },
  computed: {
    showBlock() {
      let result = [];
      if (this.accordionData?.items.length) {
        result = this.accordionData?.items.map(item => {
          if (item?.templates?.length) {
            return Boolean(item.templates.length)
          }
          return false;
        })
      }
      return result.some(item => item);
    }
  },
  isErrors() {
    return Boolean(this.errorsElements.size)
  },
  showTooltip() {
    return this.isErrors
  }
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
