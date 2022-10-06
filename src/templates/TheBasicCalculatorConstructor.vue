<template>
  <div id="app-base-constructor-calculator">
    <div class="calc calc__wrapper" id="custom-stile">
      <div
        class="calc__wrapper-group-data"
        v-for="(template, inx) in calculatorTemplates"
        :key="inx"
      >
        <ui-accordion
          v-if="template.template === 'UiAccordion'"
          :accordion-data="template"
          :classes="template?.classes"
          :element-name="template?.elementName?.length ? template?.elementName : template?.json_id || 'UiAccordion' + inx"
          @changedValue="changeValue"
          @changeValid="changeValid"
        />
        <ui-tab
          v-if="template.template === 'UiTab'"
          :tab-data="template"
          :classes="template?.classes"
          :element-name="template?.elementName?.length ? template?.elementName : template?.json_id || 'UiTab' + inx"
          @changedValue="changeValue"
          @changeValid="changeValid"/>
        <templates-wrapper
          v-else
          :template="template"
          :index="inx"
          @changedValue="changeValue"
          @changeValid="changeValid"
        />
      </div>
    </div>
    <div v-if="isErrorCalc">
      Есть ошибка при заполнении!
    </div>
<pre>
  {{formula}}
  {{processingFormulaOnVariables}}
  +++ {{findDataForVariablesOnFormula}} +++
  --- {{putTogetherFormulaWithData}} ---
<!--  {{resultDataFilter}}-->
</pre>

    <teleport to="#teleport-element">
      {{ resultForForm }}
    </teleport>

  </div>
</template>

<script>
import UiAccordion from "@/components/UI/UiAccordion";
import UiTab from "@/components/UI/UiTab";
import TemplatesWrapper from "@/components/UI/TemplatesWrapper";

export default {
  name: "TheBasicCalculatorConstructor",
  components: {TemplatesWrapper, UiAccordion, UiTab},
  async mounted() {
    const isGlobal = window.location.hostname !== "localhost";
    const localPath = "http://localhost:3000/test-data";
    if (!isGlobal) {
      await fetch(localPath)
        .then((response) => response.json())
        .then((data) => {
          this.outData = data;
        });
      await fetch("http://localhost:3000/test-data-formula")
        .then((response) => response.json())
        .then((data) => {
          this.formula = data?.formula?.length ? data.formula : null;
          this.methodProcessingVariablesOnFormula = data?.processingOtherVariables ? data.processingOtherVariables : 'use';
        });
    } else {
      this.outData.calculatorTemplates = JSON.parse(
        JSON.stringify(window?.calculatorTemplates)
      );
      this.formula = window?.dataFormula?.formula?.length ? window.dataFormula.formula : null;
      this.methodProcessingVariablesOnFormula = window?.dataFormula?.processingOtherVariables ? window.dataFormula.processingOtherVariables : 'use';
    }
    this.calculatorTemplates = this.outData?.calculatorTemplates
      ? this.outData?.calculatorTemplates
      : [];
    delete(window?.calculatorTemplates)
    delete(window?.dataFormula)
  },
  data() {
    return {
      outData: {},
      calculatorTemplates: [],
      resultsElements: {},
      errorsElements: new Set(),
      formula: null,
      methodProcessingVariablesOnFormula: 'use'
    };
  },
  methods: {
    changeValueSquare(data) {
      this.square = data.value;
    },
    changeValue(data) {
      // console.log("Данные по событию -  ", data);
      if (data.type === "radio") {
        this.resultsElements[data.name] = {
          name: data.name,
          type: data.type,
          label: data.label,
          value: data.value.radioName,
          summ: data.cost,
          inOutput: data.cost !== null || data.alwaysOutput,
        };
      } else if (data.type === "select") {
        this.resultsElements[data.name] = {
          name: data.name,
          type: data.type,
          label: data.label,
          value: data.value.selectName,
          summ: data.cost,
          inOutput: data.cost !== null || data.alwaysOutput,
        }
      } else {
        this.resultsElements[data.name] = {
          name: data.name,
          type: data.type,
          label: data.label,
          value: data.value,
          summ: data.cost,
          inOutput: data.cost !== null || data.alwaysOutput,
        }
      }
    },
    changeValid(data) {
      if (data.error) {
        this.errorsElements.add(data.name);
      } else {
        if (this.errorsElements.has(data.name)) {
          this.errorsElements.delete(data.name);
        }
      }
    },

  },
  computed: {
    /**
     * Данные которые подходят для вывода или расчета
     * @returns {unknown[]}
     */
    resultDataFilter() {
      return Object.values(this.resultsElements).filter((item) => item.inOutput || item.summ !== null)
    },

    /**
     * Разбиваем полученную формулу на массив с переменными и знаками. Избавляемся от лишнего.
     * @returns {*}
     */
    processingFormulaOnVariables() {
      return this.formula?.split(' ').filter(item => item.length);
    },
    /**
     * Преобразуем переменные в данные полученные с калькулятора
     * @returns {*}
     */
    findDataForVariablesOnFormula() {
      return this.processingFormulaOnVariables?.map(item => {
        let data = this.resultDataFilter.filter(itemInner => itemInner.name === item)
        return  data.length ? data[0] : item;
      });
    },
    putTogetherFormulaWithData() {
     let test =  this.findDataForVariablesOnFormula?.reduce((resultText, item )=> {
        return resultText += item?.summ ? item.summ : item;
      }, '');


      try {
        return eval(test);
      } catch (e) {
        console.error(e.message );
        return false;
      }
    },


    /**
     * Данные нужные только для вывода в форму
     * @returns {*[]}
     */
    resultDataFilterInOutput() {
      return this.resultDataFilter.filter(item => item.inOutput)
    },
    resultTextDataForForm() {
      let result = '';
      this.resultDataFilterInOutput.forEach(item => {
        if (item.inOutput) {
          result += '\n' + item.label;

          if(item.type === 'select' || item.type === 'radio') {
            result += ' - ' + item.value;
          }
          if (item.summ !== null ) {
            let sum = item.summ.toString();
            result += ' - ' + sum;
          }
          result += '\n'

        }
      })
      return result;
    },
    /**
     * Общая сумма расчета
     * @returns {number}
     */
    resultSummForForm() {
      return this.resultDataFilter.reduce((sum, item) => {
          if (item.summ !== null) {
            return sum + item.summ;
          }
          return sum + 0;
        }, 0)
    },
    /**
     * Текст для вывода в форму
     * @returns {string}
     */
    resultForForm () {
      let result = this.resultTextDataForForm;
      result += 'Общая сумма составляет = ' + this.resultSummForForm;
      return result;
    },
    isErrorCalc() {
      return Boolean(this.errorsElements.size);
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

.button {
  @include style-button;
}

.calc__wrapper-group-data {
  margin-bottom: 20px;
  padding-left: 20px;
  border-left: 3px solid $color-orange-normal;
  &:hover {
    background-color: $color-gray-middle;
  }
}

#app-base-constructor-calculator {
  .calc {
    &__wrapper {
    }
  }
}
</style>
