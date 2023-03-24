<template>
  <pre>
    {{stateColumns}}

  </pre>
  <div class="calc__columns-wrapper"
    ref="parent"
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
    <div class="calc__columns-column-wrapper" :class="{'column': isColumn}">
      <div class="calc__columns-column-item" :style="getMaxLengthColumn(index)" v-for="(column, index) in columnListBeforeLimiting" :key="index">
        <column-element
          :parent-is-show="showElementColumns"
          :column="column"
          :id-column="index"
          :parent-name="elementName"
          @changedValue="changeValue"
          @giveWidthColumn="updateWidthColumn"
        />
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
import TemplatesWrapper from "@/components/UI/supporting/TemplatesWrapper.vue";
import IconElementWrapper from "@/components/UI/supporting/icon-element-wrapper.vue";
import ColumnElement from "@/components/UI/other/ColumnElement.vue";
import DevBlock from "@/components/UI/devMode/devBlock.vue";


import {propsTemplate} from "@/servises/UsePropsTemplatesSingle";
import { MixinsForProcessingFormula } from "@/mixins/MixinsForProcessingFormula";
import { watch } from "vue";
export default {
  name: "UiColumns",
  components: { TemplatesWrapper, DevBlock, IconElementWrapper, ColumnElement },
  mixins:[MixinsForProcessingFormula],
  emits: ["changedValue"],
  mounted() {
    this.updatedCurrentWidth();
    window.addEventListener('resize', ()=> {
      this.updatedCurrentWidth();
    })
  },
  props: {
    columnList: {
        type: Array,
        default: () => [],
    },
    /**
     * free, first, center, last
     */
    adaptationMethod: {
      type: String,
      default: "last",
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
      maximumColumns: 4,
      currentWidthElement: null,
      stateColumns: {},
      timerName: null,
    }
  },
  methods: {
    changeValue(data) {
      this.$emit("changedValue", data);
    },
    getMaxLengthColumn(index) {
      let columnData = this.stateColumns[index];
      if (!this.columnListBeforeLimiting[index]?.maxWidth || columnData?.change) {
        return null;
      }

      // if (this.stateColumns.get(index) && this.adaptationMethod !== 'free'){

        if (columnData?.width < 230) {

          if (this.adaptationMethod === 'first' && (index === 3 || index === 2)) {
            columnData.change = true;
            return null;
          }
          if (this.adaptationMethod === 'last' && (index === 0 || index === 1)) {
            columnData.change = true;
            return null;
          }
          if (this.adaptationMethod === 'center' && (index === 0 || index === 3)) {
            columnData.change = true;
            return null;
          }
        }
      // }


      return `max-width: ${this.columnListBeforeLimiting[index]?.maxWidth}%;`
    },
    updateWidthColumn({ width,  idColumn}) {
      if (idColumn in this.stateColumns) {
        this.stateColumns[idColumn].width = width;
      } else {
        this.stateColumns[idColumn] = {width, change: false}
      }
    },
    updatedCurrentWidth() {
      if (this.$refs.parent && this.$refs.parent?.offsetWidth !== 0) {
        this.currentWidthElement = this.$refs.parent.offsetWidth;
        clearInterval(this.timerName);
      }
    }
  },
  watch: {
    parentIsShow: {
      handler(newValue) {
        if (newValue) {
          let step = 0;
          this.timerName = setInterval(() => {
            this.updatedCurrentWidth();
            if (step > 10) {
              clearInterval(this.timerName);
            }
          },500)

        }
      }
    }
  },
  computed: {
    columnListBeforeLimiting() {
      return this.columnList?.filter((column, index) => index < this.maximumColumns);
    },
    showElementColumns() {
      return Boolean(this.isVisibilityFromDependency && this.parentIsShow && this.countColumns);
    },
    isExistLabel() {
      return Boolean(this.label?.length)
    },
    countColumns() {
      return this.columnList?.length
    },
    isColumn() {
      // if (this.countColumns === 1 && this.currentWidthElement <= 480) {
      //   return true;
      // } else if (this.countColumns === 2 && this.currentWidthElement <= 520) {
      //   return true;
      // } else if (this.countColumns === 3 && this.currentWidthElement <= 720) {
      //   return true;
      // } else if (this.countColumns === 4 && this.currentWidthElement <= 900) {
      //   return true;
      // }
      return false;
    }
  }

};
</script>

<style scoped>

</style>
