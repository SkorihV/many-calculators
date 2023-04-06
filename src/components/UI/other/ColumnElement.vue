<template>
  <div class="calc__columns-column-label-wrapper" ref="parent">
    <icon-element-wrapper
      :icon-settings="column.iconSettings"
      :alt="isExistLabel ? column.label : ''"
      :isExistLabel="isExistLabel"
    >
      <div class="calc__columns-column-label" v-if="isExistLabel">
        {{ column.label }}
      </div>
    </icon-element-wrapper>
  </div>
  <template v-for="(template, index_in) in column?.templates">
    <templates-wrapper
      :parent-is-show="showColumn"
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
import { propsTemplate } from "@/servises/UsePropsTemplatesSingle";

import { MixinsForProcessingFormula } from "@/mixins/MixinsForProcessingFormula";

export default {
  name: "ColumnElement",
  components: { TemplatesWrapper, IconElementWrapper },
  mixins: [MixinsForProcessingFormula],
  emits: ["changedValue"],
  props: {
    idColumn: {
      type: Number,
      require: true,
    },
    column: {
      type: Object,
      default: () => {},
    },
    ...propsTemplate.getProps([
      "parentIsShow",
      "parentName",
      "template",
      "dependencyFormulaDisplay",
    ]),
  },
  methods: {
    changeValue(data) {
      this.$emit("changedValue", data);
    },
  },
  computed: {
    isExistLabel() {
      return Boolean(this.column?.label?.toString()?.length);
    },
    showColumn() {
      return Boolean(this.isVisibilityFromDependency && this.parentIsShow);
    },
  },
};
</script>

<style scoped></style>
