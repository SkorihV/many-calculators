<template>
  <div class="calc__error-wrapper" v-if="isShow">
    <div class="calc__error-toggle" @click="displayAlert = !displayAlert">X</div>
    <template v-if="displayAlert">
      <div class="calc__error-label">Обнаружены дубли имен:</div>
      <div class="calc__error-item" v-for="(error, key) in recurringTemplateNames" :key="key">
        <div class="calc__error-item-name">Имя элемента '{{key}}' обнаружено у следующих элементов:</div>
        <div class="calc__error-item-label" v-for="label in error">Заголовок: {{label.length ? label : 'Отсутствует'}}</div>
      </div>
      <p class="calc__error-alert" v-if="Object.keys(recurringTemplateNames).length">Имена должны быть уникальными!</p>
      <div class="calc__error-label">Обнаружены не существующие имена в зависимостях:</div>
      <div class="calc__error-item" v-for="(error, key) in notExistDependencyNames" :key="key">
        <div class="calc__error-item-name">Имя элемента: '{{error?.label?.length ? error?.label : 'Отсутствует'}}' Значение: '{{error.dependencyName}}'</div>
      </div>
      <p class="calc__error-alert" v-if="notExistDependencyNames.length">Измените существующие имена или добавьте недостающие.</p>
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
    }
  },
  mounted() {
    setTimeout(() => {
      this.processingAllTemplatesForDependencyNames();
    },2000)
  },
  data() {
    return {
      existsNamesDependency: [],  // Список всех имен элементов которые могут участвовать в расчетах
      usedNamesDependencyList: [], //список используемых имен для создания зависимостей
      displayAlert: true
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
    isShow() {
      console.log(this.recurringTemplateNames);
      return Object.keys(this.recurringTemplateNames).length;
    }
  }
};
</script>

<style lang="scss">
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


.calc {
  &__error {
    &-toggle {
      position: absolute;
      right: 0;
      top: 0;
      padding: 10px;
      @include style-button;
    }
    &-wrapper {
      display: flex;
      position: fixed;
      right: 0;
      flex-direction: column;
      bottom: 0;
      margin: 10px;
      background-color: $color-dark-normal;
      padding: 10px;
      color: $color-white;
      border-radius: $border-radius;
      max-width: 450px;
      max-height: 500px;
      overflow: auto;
      box-shadow: 0 0 2px 2px $color-danger;
      min-height: 20px;
      min-width: 15px;
    }
    &-label {
      color: $color-orange-normal;
      margin-top: 15px;
    }
    &-item {
      display: flex;
      flex-direction: column;
      margin: 5px 0;
    }
    &-alert {
      margin-top: 15px;
      font-size: 18px;
    }
  }
}

</style>
