<template>
  <div class="calc__error-wrapper" v-if="isShow" :class="{isShow:isShow }" v-cloak>
    <div class="calc__error-toggle" @click="displayAlert = !displayAlert">X</div>
    <template v-if="displayAlert">
      <template v-if="Object.keys(recurringTemplateNames).length">
        <div class="calc__error-label">Обнаружены дубли имен:</div>
        <div class="calc__error-item" v-for="(error, key) in recurringTemplateNames" :key="key">
          <div class="calc__error-item-name">Имя элемента '{{key}}' обнаружено у следующих элементов:</div>
          <div class="calc__error-item-label" v-for="label in error">Заголовок: {{label.length ? label : 'Отсутствует'}}</div>
        </div>
        <p class="calc__error-alert">Имена должны быть уникальными!</p>
      </template>


      <template  v-if="notExistDependencyNames.length">
        <div class="calc__error-label">Обнаружены не существующие имена в зависимостях:</div>
        <div class="calc__error-item" v-for="(error, key) in notExistDependencyNames" :key="key">
          <div class="calc__error-item-name">Имя элемента: '{{error?.label?.length ? error?.label : 'Отсутствует'}}' Значение: '{{error.dependencyName}}' - не существует.</div>
        </div>
        <p class="calc__error-alert">Измените существующие имена или добавьте недостающие.</p>
      </template>

      <template  v-if="notExistNamesInMainFormula.length">
        <div class="calc__error-label">В результирующей формуле есть не существующие переменные.</div>
        <div class="calc__error-item" v-for="(error, key) in notExistNamesInMainFormula" :key="key">
          {{error}}
        </div>
      </template>
      <p>В случае наличия ошибок, калькулятор может вести расчет некорректно!</p>
    </template>
  </div>
</template>

<script>
export default {
  name: "ErrorUniqueNamesTemplates",
  props: {
    templates: {
      type: Array,
      default: () => []
    },
    initTemplate: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      }
    },
    formula: {
      type: String,
      default: null
    }
  },
  mounted() {
    setTimeout(() => {
      this.processingAllTemplatesForDependencyNames();
      this.checkInShowing();
    },2000)
  },
  data() {
    return {
      existsNamesDependency: [],  // Список всех имен элементов которые могут участвовать в расчетах
      usedNamesDependencyList: [], //список используемых имен для создания зависимостей
      displayAlert: false,
      exceptionVariablesFormula: ["-", "+", "/", "*", "(", ")", "_otherSumma_"],
      isShow: false
    };
  },
  methods: {
    /**
     * рекурсивная функция обходящая все шаблоны
     * и собирающая имена переменных участвующих в формулах
     * @param template
     * @returns {boolean}
     */
    recursivelyTraverseAllTemplateElements(template) {
      this.isElementNameExist(template) ? this.existsNamesDependency.push({label: template.label, elementName:  template.elementName }) : false;
      this.isDependencyNameExist(template) ? this.usedNamesDependencyList.push({label: template.label, dependencyName:  template.dependencyName }) : false;
      for (let prop in template) {
        if (typeof template[prop] === 'object' && !Array.isArray(template[prop])) {
          this.recursivelyTraverseAllTemplateElements(template[prop])
        } else if (Array.isArray(template[prop]) && template[prop].length) {
          template[prop].forEach(item => this.recursivelyTraverseAllTemplateElements(item))
        }
      }
      return false;
    },
    processingAllTemplatesForDependencyNames() {
      if (!this.templates?.length) {
        return [];
      }
      const length = this.templates.length;
      for (let i = 0; i < length; i++) {
        const currentTemplate = this.templates[i];
        this.recursivelyTraverseAllTemplateElements(currentTemplate)
      }
    },

    isElementNameExist(template) {
      return Boolean(template?.elementName?.length)
    },
    isDependencyNameExist(template) {
      return Boolean(template?.dependencyName?.length)
    },
    /**
     *
     */
    checkInShowing() {
      this.isShow =  Boolean((Object.keys(this.recurringTemplateNames)?.length || this.notExistDependencyNames?.length || this.notExistNamesInMainFormula?.length) && this.initTemplate);
    }
  },
  computed: {
    existsNames() {
      return this.existsNamesDependency;
    },

    recurringTemplateNames() {
      let recurring = {};
      let resultrecurring = {};
      this.existsNames.forEach(item => {
        if (item.elementName in recurring) {
          recurring[item.elementName].push(item.label)
        } else {
          recurring[item.elementName] = [];
          recurring[item.elementName].push(item.label)
        }
      })
      for (let key in recurring) {
        recurring[key].length > 1 ? resultrecurring[key] = recurring[key] : false;
      }
      return resultrecurring;
    },

    /**
     * Не существующие переменные указанные в формулах зависимостей
     * @returns {*[]}
     */
    notExistDependencyNames() {
      let resultList = []
      let lengthList = this.usedNamesDependencyList.length

      for (let i = 0; i < lengthList; i++) {
        let isExist = false;
        this.existsNames.forEach(item => {
          if (item.elementName === this.usedNamesDependencyList[i].dependencyName) {
            isExist = true;
          }
        })

        if (!isExist) {
          resultList.push(this.usedNamesDependencyList[i])
        }

      }
      return resultList;

    },
    /**
     * Не существующие переменные указанные в основной формуле
     * @returns {*[]}
     */
    notExistNamesInMainFormula() {
      if (this.formula?.length) {
        let outputDataFormula = [];
        let innerFormula = this.formula
                    .split(" ")
                    .filter(item => item.length && !this.exceptionVariablesFormula.includes(item));
        const lengthFormula = innerFormula.length;

        for(let i = 0; i < lengthFormula; i++) {
          const length = this.existsNamesDependency.length
          let isEmpty = true;
          for (let j = 0; j < length; j++) {
            if (this.existsNamesDependency[j].elementName === innerFormula[i]) {
              isEmpty = false;
              break
            }
          }
          if (isEmpty) {
            outputDataFormula.push(innerFormula[i])
          }
        }

        return outputDataFormula
      }
      return [];
    },
  },
};
</script>

<style lang="scss">
</style>
