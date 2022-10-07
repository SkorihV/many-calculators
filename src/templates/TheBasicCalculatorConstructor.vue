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
      <div v-if="isErrorCalc && shownAllTooltips" class="calc__error-block">
        Возможно, не все поля заполнены или заполнены не корректно!
      </div>
      <div class="calc__show-result-btn" @click="calculateResult">Рассчитать</div>
    </div>
    <teleport v-if="initTeleport && !isErrorCalc" to="#teleport-element">
      {{ resultTextForForm }}
    </teleport>
  </div>
</template>

<script>
import {computed} from 'vue'
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
          this.isUseFormula = data?.useFormula;
        });
    } else {
      this.outData.calculatorTemplates = JSON.parse(
        JSON.stringify(window?.calculatorTemplates)
      );
      this.formula = window?.dataFormula?.formula?.length ? window.dataFormula.formula : null;
      this.isUseFormula = window?.dataFormula?.useFormula ? window?.dataFormula?.useFormula : false;
    }
    this.calculatorTemplates = this.outData?.calculatorTemplates
      ? this.outData?.calculatorTemplates
      : [];
    delete(window?.calculatorTemplates)
    delete(window?.dataFormula)

    this.submitResult = document.querySelector('#send-result');

  },
  data() {
    return {
      outData: {},
      calculatorTemplates: [],
      resultsElements: {},
      errorsElements: new Set(),
      formula: null,
      isUseFormula: false,
      shownAllTooltips: false,
      reserveVariableForOther: '_otherSumm_',
      initTeleport: false,
      submitResult: null
    };
  },
  provide() {
    return {
      globalCanBeShownTooltip: computed(() => this.shownAllTooltips) ,
    }
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
      } else if (data.type === "checkbox") {
        if (data.value) {
          this.resultsElements[data.name] = {
            name: data.name,
            type: data.type,
            label: data.label,
            value: data.value.selectName,
            summ: data.cost,
            inOutput: data.cost !== null || data.alwaysOutput,
          }
        } else {
         if(this.resultsElements[data.name] ) {
           delete this.resultsElements[data.name];
         }
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
      // console.log("Данные по ошибке -  ", data);
      if (data.error) {
        this.errorsElements.add(data.name);
      } else {
        if (this.errorsElements.has(data.name)) {
          this.errorsElements.delete(data.name);
        }
      }
      this.enabledResultButton();
    },
    calculateResult() {
      this.shownAllTooltips = true;
      this.initTeleport = true;
      this.enabledResultButton();
    },
    enabledResultButton() {
      this.submitResult.disabled = !(this.initTeleport && !this.isErrorCalc)
    },
  },
  computed: {
    /**
     * Данные которые подходят для вывода или расчета
     * @returns {unknown[]}
     */
    resultDataFilter() {
      return Object.values(this.resultsElements).filter((item) => item.inOutput || item.summ !== null || (item.type === "checkbox" && !item.value))
    },

    /**
     * Разбиваем полученную формулу на массив с переменными и знаками. Избавляемся от лишнего.
     * @returns {*}
     */
    listVariablesOnFormula() {
      if (this.formula?.length) {
        return this.formula?.split(' ').filter(item => item.length);
      }
      return [];
    },
    /**
     * Массив переменных не используеммых в формуле
     * @returns {*}
     */
    otherVariables() {
      return this.resultDataFilter?.map(dataOnCalcComponent => {
        let isFormula = this.listVariablesOnFormula.filter(varOnFormula => varOnFormula === dataOnCalcComponent.name);
        return  Boolean(isFormula.length) ? false : dataOnCalcComponent
      }).filter(item => item);
    },

    /**
     * сумма всех не используемых в формуле переменных
     * @returns {*}
     */
    otherResultSumm() {
      return this.otherVariables.reduce((sum, item) => {
        if (item?.summ !== null) {
          return sum + item.summ;
        }
        return sum + 0;
      }, 0)
    },
    /**
     * Список переменных из формулы вместе с данными
     * @returns {*}
     */
    dataListVariablesOnFormula() {
      return this.listVariablesOnFormula?.map(item => {
        if (item === this.reserveVariableForOther) {
          return new Proxy(
            {
              name: this.reserveVariableForOther,
              summ: this.otherResultSumm
            },
            {
              get: (target, name) => {
                return name in target ? target[name] : null;
              }
            }
          )
        } else {
          let data = this.resultDataFilter.filter(itemInner => itemInner.name === item)
          return  data.length ? data[0] : item;
        }
      });
    },

    putTogetherFormulaWithData() {
     let resultTextForComputed =  this.dataListVariablesOnFormula?.reduce((resultText, item )=> {
       return resultText += typeof item.summ === 'number'  ? item.summ : item;
      }, '');
      try {
        return eval(resultTextForComputed);
      } catch (e) {
        return false;
      }
    },

    /**
     * Данные нужные только для вывода в форму
     * @returns {*[]}
     */
    resultDataFilterInOutputText() {
      return this.resultDataFilter.filter(item => item.inOutput)
    },
    resultTextDataForForm() {
      let result = '';
      this.resultDataFilterInOutputText.forEach(item => {
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

      if (this.isUseFormula) {
        return this.putTogetherFormulaWithData;
      } else {
        return this.resultDataFilter.reduce((sum, item) => {
          if (item.summ !== null) {
            return sum + item.summ;
          }
          return sum + 0;
        }, 0)
      }
    },
    /**
     * Текст для вывода в форму
     * @returns {string}
     */
    resultTextForForm () {
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
  width: 100%;
  &:hover {
    background-color: $color-gray-middle;
  }
}

#app-base-constructor-calculator {
  .calc {
    box-sizing: border-box;
    &__wrapper {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }
    &__error-block {
      width: 100%;
      @include style-flex-center;
      margin: 10px 0;
      padding: 20px;
      background-color: $color-danger;
      color: $color-white;

    }
    &__show-result-btn {
      @include style-button;
      padding: 20px;
      align-self: center;
      &:hover {
        @include style-button-hover;
        background-color: $color-orange-normal;
      }
    }
  }
}
</style>
