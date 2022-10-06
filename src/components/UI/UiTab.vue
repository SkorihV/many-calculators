<template>
  <div class="calc__tab-wrapper" :class="[classes]" v-if="showBlock">
      <div class="calc__tab-main-label" v-if="tabData?.label?.length">{{ tabData.label }}</div>
      <div class="calc__tab-item-label-wrapper">
        <template v-for="(item, key) in tabData?.items" >
          <div class="calc__tab-item-label" :class="{isOpen: key === itemOpenId}" v-if="item?.templates?.length" :key="key" @click="openItem(key)">{{item.title}}</div>
        </template>
      </div>
      <div class="calc__tab-item-content-wrapper" v-if="tabData?.items?.length" v-for="(item, key) in tabData.items" :key="key">
          <div class="calc__tab-item-content" v-show="key === itemOpenId" v-for="(template, key_in) in item?.templates" :key="key_in">
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
  name: "UiTab",
  components: {TemplatesWrapper},
  emits: ["changedValue", "changeValid"],
  props: {
    tabData: {
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
    changeValue(data){
      this.$emit("changedValue", data);
    },
    changeValid(data) {
      this.$emit("changeValid", data);
    }
  },
  computed: {
    showBlock() {
      let result = [];
      if (this.tabData?.items.length) {
        result = this.tabData?.items.map(item => {
          if (item?.templates?.length) {
            return Boolean(item.templates.length)
          }
          return false;
        })
      }
      return result.some(item => item);
    }
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
