<template>
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
    <div class="calc__columns-column-wrapper">
      <div class="calc__columns-column-item" :style="getMaxLengthColumn(index)" v-for="(column, index) in columnListBeforeLimiting" :key="index">
        <column-element
          :parent-is-show="showElementColumns"
          :column="column"
          :id-column="index"
          :parent-name="elementName"
          @changedValue="changeValue"
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

    this.columnList.forEach(item => {
      this.stateColumns.push({maxWidth: item.maxWidth});
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
      default: "first",
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
      stateColumns: [],
      timerName: null,
    }
  },
  methods: {
    changeValue(data) {
      this.$emit("changedValue", data);
    },
    getMaxLengthColumn(index) {
      if (!this.stateColumns[index]?.maxWidth) {
        return null;
      }
      return `max-width: ${this.stateColumns[index]?.maxWidth}%;`
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
    },
    currentWidthElement: {
      handler(width) {
        if (width > 880) {
          this.stateColumns = Object.values(this.stateColumns).map((item, index) => {
            item.maxWidth = this.columnList[index].maxWidth;
            return item;
          })
        }

        if (width <= 880) {
          if (this.countColumns === 4 ) {
            if (['free','first','center'].includes(this.adaptationMethod)) {
              this.stateColumns[0].maxWidth = 33;
              this.stateColumns[1].maxWidth = 33;
              this.stateColumns[2].maxWidth = 33;
              this.stateColumns[3].maxWidth = 100;
            } else if (['last'].includes(this.adaptationMethod)) {
              this.stateColumns[0].maxWidth = 50;
              this.stateColumns[1].maxWidth = 50;
              this.stateColumns[2].maxWidth = 50;
              this.stateColumns[3].maxWidth = 50;
            }
          }

          if (this.countColumns === 3 || this.countColumns === 2) {
            this.stateColumns = Object.values(this.stateColumns).map(item => {
              item.maxWidth = this.countColumns === 3 ? 33 : 50;
              return item;
            })
          }
        }

        if (width <= 660) {
          if (this.countColumns === 4 ) {
            if (['free','first','last'].includes(this.adaptationMethod)) {
              this.stateColumns[0].maxWidth = 50;
              this.stateColumns[1].maxWidth = 50;
              this.stateColumns[2].maxWidth = 50;
              this.stateColumns[3].maxWidth = 50;
            } else if (['center'].includes(this.adaptationMethod)) {
              this.stateColumns[0].maxWidth = 100;
              this.stateColumns[1].maxWidth = 50;
              this.stateColumns[2].maxWidth = 50;
              this.stateColumns[3].maxWidth = 100;
            }
          }

          if (this.countColumns === 3 ) {
            if (['free','first'].includes(this.adaptationMethod)) {
              this.stateColumns[0].maxWidth = 50;
              this.stateColumns[1].maxWidth = 50;
              this.stateColumns[2].maxWidth = 100;
            } else if (['center','last'].includes(this.adaptationMethod)) {
              this.stateColumns[0].maxWidth = 100;
              this.stateColumns[1].maxWidth = 50;
              this.stateColumns[2].maxWidth = 50;
            }
          }

          if (this.countColumns === 2 ) {
            this.stateColumns[0].maxWidth = 50;
            this.stateColumns[1].maxWidth = 50;
          }
        }
        if (width <= 440) {
          this.stateColumns = Object.values(this.stateColumns).map(item => {
            item.maxWidth = 100;
            return item;
          })
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
  }

};
</script>

<style scoped>

</style>
