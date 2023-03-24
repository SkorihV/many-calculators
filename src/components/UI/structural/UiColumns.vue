<template>
    <div class="calc__columns-wrapper"
      v-show="showElementColumns"
         :id="elementName"
    >
      <icon-element-wrapper
        :icon-settings="iconSettings"
        :alt="isExistLabel ? label : ''"
      >
        <div class="calc__columns-label-text"  v-if="isExistLabel">
          {{ label }}
        </div>
      </icon-element-wrapper>
      <div class="calc__columns-column-wrapper">
        <div class="calc__columns-column-item" :style="'max-width:' + column.maxWidth + '%;'" v-for="(column, index) in columnListBeforeLimiting" :key="index">
          <div class="calc__wrapper-group-data">
            <icon-element-wrapper
              :icon-settings="column.iconSettings"
              :alt="isExistLabel ? column.label : ''"
            >
              <div class="calc__columns-column-label"  v-if="Boolean(column.label?.length)">
                {{ column.label }}
              </div>
            </icon-element-wrapper>
          </div>
          <template v-for="(template, index_in) in column?.templates">
            <templates-wrapper
              :parent-is-show="showElementColumns"
              :template="template"
              :index="elementName + '_' + index_in + '_' + index"
              :parent-name="elementName"
              @changedValue="changeValue"
            />
          </template>
        </div>
      </div>
    </div>
  <dev-block
    :label="label"
    :element-name="elementName"
    :is-visibility-from-dependency="showElementColumns"
    :dependency-formula-display="dependencyFormulaDisplay"
    :parsing-formula-variables="formulaAfterProcessingVariables"
    hidden-cost
    hidden-value
  />
</template>

<script>
import {propsTemplate} from "@/servises/UsePropsTemplatesSingle";
import { MixinsForProcessingFormula } from "@/mixins/MixinsForProcessingFormula";
import DevBlock from "@/components/UI/devMode/devBlock.vue";

import TemplatesWrapper from "@/components/UI/supporting/TemplatesWrapper.vue";
import devBlock from "@/components/UI/devMode/devBlock.vue";
import IconElementWrapper from "@/components/UI/supporting/icon-element-wrapper.vue";
export default {
  name: "UiColumns",
  components: { TemplatesWrapper, DevBlock, IconElementWrapper },
  mixins:[MixinsForProcessingFormula],
  emits: ["changedValue"],
  props: {
    columnList: {
        type: Array,
        default: () => [],
    },
    ...propsTemplate.getProps([
      "label",
      "elementName",
      "classes",
      "parentIsShow",
      "dependencyFormulaDisplay",
      "iconSettings",
      "parentName"
    ]),
  },
  data() {
    return {
      maximumColumns: 4
    }
  },
  methods: {
    changeValue() {
      this.$emit('changedValue');
    },
  },
  computed: {
    columnListBeforeLimiting() {
      return this.columnList?.filter((column, index) => index < this.maximumColumns);
    },
    showElementColumns() {
      return Boolean(this.isVisibilityFromDependency && this.parentIsShow && this.columnList?.length);
    },
    isExistLabel() {
      return Boolean(this.label?.length)
    }
  }

};
</script>

<style scoped>

</style>
