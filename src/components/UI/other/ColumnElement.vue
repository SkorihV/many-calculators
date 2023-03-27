<template>
  <div class="calc__wrapper-group-data" ref="parent">
    <icon-element-wrapper
      :icon-settings="column.iconSettings"
      :alt="isExistLabel ? column.label : ''"
    >
      <div class="calc__columns-column-label"  v-if="isExistLabel">
        {{ column.label }}
      </div>
    </icon-element-wrapper>
  </div>
  <template v-for="(template, index_in) in column?.templates">
    <templates-wrapper
      :parent-is-show="parentIsShow"
      :template="template"
      :index="parentName + '_' + idColumn + '_' + index_in"
      :parent-name="parentName"
      @changedValue="changeValue"
    />
  </template>
</template>

<script>
import TemplatesWrapper from "@/components/UI/supporting/TemplatesWrapper.vue";
import IconElementWrapper from "@/components/UI/supporting/icon-element-wrapper.vue";
import {propsTemplate} from "@/servises/UsePropsTemplatesSingle";

export default {
  name: "ColumnElement",
  components:{TemplatesWrapper, IconElementWrapper},
  emits: ['changedValue'],
  props: {
    idColumn:{
      type: Number,
      require: true
    },
    column: {
      type: Object,
      default: () => {},
    },
    ...propsTemplate.getProps(['parentIsShow', 'parentName', 'template'])
  },
  methods: {
    changeValue(data) {
      this.$emit("changedValue", data);
    },
  },
  computed: {
    isExistLabel() {
      return this.column?.label?.length
    }
  },
};
</script>

<style scoped>

</style>
