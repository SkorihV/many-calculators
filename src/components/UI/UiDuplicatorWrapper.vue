<template>
  <div
    class="calc__duplicator-wrapper"
    v-if="mutationsInputData?.templates.length"
  >
    <div class="calc__duplicator-label">{{ mutationsInputData.label }}</div>
    <template
      v-for="(template, inx) in mutationsInputData.templates"
      :key="index + '_' + inx"
    >
      <templates-wrapper
        :parent-is-show="parentIsShow"
        :template="template"
        :index="index + '_' + inx"
        :parent-name="mutationsInputData.elementName"
        @changedValue="changeValue"
      />
    </template>
    <button
      v-if="!isDuplicate"
      class="calc__duplicator-duplicate"
      @click="tryDuplicate"
    >
      Дублировать
    </button>
    <button
      v-if="isDuplicate"
      class="calc__duplicator-delete"
      @click="deleteDuplicate"
    >
      X
    </button>
  </div>
  <div class="dev-block" v-if="devMode" v-html="devModeData"></div>
</template>

<script>
import TemplatesWrapper from "@/components/UI/TemplatesWrapper";
import { MixinsForProcessingFormula } from "@/components/UI/MixinsForProcessingFormula";
import { mapGetters, mapActions } from "vuex";

export default {
  name: "UiDuplicatorWrapper",
  emits: ["changedValue", "duplicate", "deleteDuplicator"],
  components: { TemplatesWrapper },
  mixins: [MixinsForProcessingFormula],
  props: {
    duplicatorData: {
      type: Object,
      default: null,
    },
    index: {
      type: [Number, String],
      default: null,
    },
    parentIsShow: {
      type: Boolean,
      default: true,
    },
    isDuplicate: {
      type: Boolean,
      default: false,
    },
    parentName: {
      type: String,
      default: "",
    },
    formula: {
      type: String,
      default: "",
    },
    originVariables: {
      type: Array,
      default: () => [],
    },
  },
  mounted() {
    if (this.isDuplicate) {
      this.mutationsInputData = this.duplicatorData;
    } else {
      this.mutationsInputData = this.updateInputData(this.duplicatorData, 0);
    }
  },
  data() {
    return {
      counterDuplicate: 0,
      localResultData: {},
      mutationsInputData: null,
    };
  },
  methods: {
    ...mapActions(["tryDeleteDependencyElementOnName"]),
    changeValue(data) {
      this.localResultData[data.name] = data;
      this.$emit("changedValue", {
        name: this.mutationsInputData.elementName,
        type: "duplicator",
        label: this.mutationsInputData.label,
        cost: this.localCost,
        value: null,
        displayValue: this.localCost,
        formOutputMethod: this.mutationsInputData.formOutputMethod,
        eventType: data.eventType,
        unit: "",
        isShow: this.parentIsShow,
        excludeFromCalculations:
          this.mutationsInputData.excludeFromCalculations,
        insertedTemplates: this.localResultData,
      });
    },
    tryDuplicate() {
      this.counterDuplicate++;
      const returnData = this.updateInputData(
        this.duplicatorData,
        this.counterDuplicate
      );
      this.$emit("duplicate", returnData);
    },
    deleteDuplicate() {
      this.mutationsInputData?.templates.map((item) => {
        this.tryDeleteDependencyElementOnName(item.elementName);
      });
      this.$emit("deleteDuplicator", this.duplicatorData.elementName);
    },
    updateInputData(data, index) {
      const mutationsData = JSON.parse(JSON.stringify(data));
      mutationsData.parentDuplicator = data.elementName;
      mutationsData.label =
        data.label.length && index > 0 ? data.label + " " + index : data.label;
      mutationsData.elementName = data?.elementName?.length
        ? data?.elementName + "_" + index
        : data?.json_id + "_" + index;
      mutationsData.elementName = data.elementName + "_" + index;
      mutationsData.index = this.index + index;
      mutationsData.formula = this.mutationFormulaResult;
      mutationsData.templates = mutationsData.templates.map((template) => {
        template.elementName = template?.elementName?.length
          ? template?.elementName + "_" + index
          : template?.json_id + "_" + index;
        template.json_id = template.json_id + "_" + index;
        return template;
      });
      return mutationsData;
    },
  },
  watch: {
    localResultData: {
      handler() {
        // this.attachIndexForFormulaElements.map(item => {
        //   if ( Object.keys(this.localResultData).includes(item)) {
        //     return this.localResultData[item]
        //   } else {
        //     return item;
        //   }
        // })
      },
      deep: true,
    },
  },
  computed: {
    ...mapGetters([
      "getAllResultsElements",
      "getNameReserveVariable",
      "getResultElementOnName",
      "devMode"
    ]),
    /**
     * Разбиваем полученную формулу на массив с переменными и знаками.
     * Избавляемся от пустых элементов.
     * @returns {*}
     */
    variablesInFormula() {
      return this.getArrayElementsFromFormula(this.formula);
    },

    /**
     * Список переменных в формуле из глобального окружения
     * @returns {*}
     */
    listGlobalsVariables() {
      return this.variablesInFormula.filter((item) => {
        return (
          !this.originVariables.includes(item) &&
          !Boolean(
            item.match(
              /(\)|\(|>=|<=|<|>|!==|===|&&|\|\||\+|-|\/|\*)|([0-9]+(\.[0-9]+)?)/
            )
          ) &&
          item !== this.getNameReserveVariable
        );
      });
    },
    /**
     * Список локальных переменных используемых в формуле
     * @returns {*}
     */
    listLocalVariablesUsedInFormula() {
      return this.variablesInFormula
        .filter(
          (item) =>
            !Boolean(
              item.match(
                /(\)|\(|>=|<=|<|>|!==|===|&&|\|\||\+|-|\/|\*)|([0-9]+(\.[0-9]+)?)/
              )
            ) && item !== this.getNameReserveVariable
        )
        .filter((item) => !this.listGlobalsVariables.includes(item));
    },
    /**
     * Список локальных переменных используемых в формуле c префиксом
     * @returns {*}
     */
    listLocalVariablesUsedInFormulaForPrefix() {
      return this.listLocalVariablesUsedInFormula.map(
        (item) => item + "_" + this.index
      );
    },

    /**
     * Список локальных переменных не используемых в формуле
     * @returns {*[]}
     */
    arrayFreeVariablesOutsideFormula() {
      return this.originVariables
        .filter((item) => !this.listLocalVariablesUsedInFormula.includes(item))
        .map((item) => item + "_" + this.index);
    },
    /**
     * Список переменных не используемых в формуле
     * @returns {[]}
     */
    dataFreeVariablesOutsideFormula() {
      let localData = [];
      this.arrayFreeVariablesOutsideFormula.forEach((elementName) => {
        if (this.localResultData[elementName]) {
          localData.push(this.localResultData[elementName]);
        }
      });
      return localData;
    },

    /**
     * Сумма всех элементов не вошедших в формулу
     * @returns {unknown}
     */
    resultSummaDataFriVariablesOutsideFormula() {
      return this.dataFreeVariablesOutsideFormula?.reduce(
        (reduceSumma, item) => {
          if (item.cost !== null && !item.excludeFromCalculations) {
            return reduceSumma + parseFloat(item.cost);
          }
          return reduceSumma + 0;
        },
        0
      );
    },

    /**
     * в формулу добавляем префиксы для переменных дупликатора
     * @returns {*}
     */
    attachIndexForFormulaElements() {
      return this.variablesInFormula.map((item) => {
        const isFind = !Boolean(
          item.match(
            /(\)|\(|>=|<=|<|>|!==|===|&&|\|\||\+|-|\/|\*)|([0-9]+(\.[0-9]+)?)/
          )
        );
        if (isFind && this.originVariables.includes(item)) {
          item = item + "_" + this.index;
        }
        return item;
      });
    },

    /**
     * Список переменных из формулы вместе с данными
     * @returns {*}
     */
    dataListVariablesOnFormula() {
      return this.attachIndexForFormulaElements?.map((item) => {
        if (item === this.getNameReserveVariable) {
          return this.getProxyFreeVariables(
            this.resultSummaDataFriVariablesOutsideFormula
          );
        } else if (this.listGlobalsVariables.includes(item)) {
          return this.getResultElementOnName(item);
        } else {
          const data = Object.values(this.localResultData).filter(
            (itemInner) => itemInner.name === item
          );
          return data.length ? data[0] : item;
        }
      });
    },

    /**
     * конечная формула после обработки в виде строки с переменными
     * @returns {*}
     */
    mutationFormulaResult() {
      return this.attachIndexForFormulaElements.join(" ");
    },
    /**
     * формула со всеми конечными данными и обработанными переменными
     * @returns {*}
     */
    compileFormulaWitchData() {
      return this.dataListVariablesOnFormula
        .map((item) => {
          if (!item?.name?.length) {
            return item;
          } else if (item.name === this.getNameReserveVariable) {
            return item.cost;
          } else if (
            this.listLocalVariablesUsedInFormulaForPrefix.includes(item.name) &&
            this.localResultData[item.name]?.isShow
          ) {
            return this.localResultData[item.name].cost;
          } else if (
            this.listGlobalsVariables.includes(item.name) &&
            this.getResultElementOnName(item.name)?.isShow
          ) {
            return this.getResultElementOnName(item.name)?.cost;
          } else {
            return false;
          }
        })
        .join(" ");
    },

    localCost() {
      try {
        return eval(this.compileFormulaWitchData);
      } catch (e) {
        return null;
      }
    },
    devModeData() {
      const textLabel = `<div>Название группы элементов в дупликаторе: ${this.mutationsInputData?.label}</div>`
      const textFormula = `<div>Базовая формула: ${this.formula?.length ? this.getArrayElementsFromFormula(this.formula).join(' '): 'Нет'}</div>`
      const textFormulaOnData = `<div>Формула с данными: ${this.compileFormulaWitchData?.length ? this.compileFormulaWitchData : 'Нет'}</div>`

      return `
      <hr/>
      ${textLabel}
      ${textFormula}
      ${textFormulaOnData}
      `;
    }
  },
};
</script>

<style scoped></style>
