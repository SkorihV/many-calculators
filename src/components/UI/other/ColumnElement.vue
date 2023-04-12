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
  <div
    class="calc__columns-column-elements-wrapper"
    :class="{ horizontal: isHorizontal }"
  >
    <templates-wrapper
      v-for="(template, index_in) in column?.templates"
      :parent-is-show="showColumn"
      :template="template"
      :index="parentName + '_' + idColumn + '_' + index_in"
      :parent-name="parentName"
      @changedValue="changeValue"
    />
  </div>
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
      "elementPosition",
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
    isHorizontal() {
      return this.elementPosition === "horizontal";
    },
  },
};
</script>

<style scoped></style>
