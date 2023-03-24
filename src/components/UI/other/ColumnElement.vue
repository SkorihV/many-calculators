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
  emits: ['changedValue', 'giveWidthColumn'],
  mounted() {
    this.updatedCurrentWidth();
    window.addEventListener('resize', ()=> {
        this.updatedCurrentWidth();
    })
  },
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
  data() {
    return {
      currentWidthElement: null,
      timerName: null,
    }
  },
  methods: {
    changeValue(data) {
      this.$emit("changedValue", data);
    },
    sizeWidthColumn() {
      this.$emit('giveWidthColumn',{width: this.currentWidthElement, idColumn: this.idColumn})
    },
    updatedCurrentWidth() {
      if (this.$refs.parent && this.$refs.parent?.offsetWidth !== 0) {
        this.currentWidthElement = this.$refs.parent.offsetWidth;
        clearInterval(this.timerName);
      }
    }
  },
  watch: {
    currentWidthElement: {
      handler(newValue) {
        if( newValue !== null) {
          this.sizeWidthColumn()
        }
      }
    },
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
    isExistLabel() {
      return this.column?.label?.length
    }
  },
};
</script>

<style scoped>

</style>
