export const MixinsForWorkersTemplates = {
  props: {
    /**
     * заголовок
     */
    label: {
      type: String,
      default: '',
    },
    /**
     * инпут не может быть пустым
     */
    notEmpty: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    },
    /**
     * метод вывода данных в результирующую форму
     */
    formOutputMethod: {
      type: String,
      default: "no",
    },
    /**
     * имя необходимое для корректной работы Label
     */
    elementName: {
      type: String,
      default: null,
    },
    /**
     * Название элемента от значения которого будет строиться зависимость
     */
    dependencyName: {
      type: String,
      default: ''
    },
    /**
     * Формула на результатах вычисления которой будет строиться результат отображения элемента
     */
    formulaDependency: {
      type: String,
      default: ''
    },
    /**
     * Список классов для переопределения стилей на обертке
     */
    classes: {
      type: String,
      default: null,
    },
  },
  methods: {
    checkedValueOnVoid(value) {
      return value?.length !== 0 && value !== undefined && value !== null;
    },
  },
  watch: {
    /**
     * Отправить команду на удаление элемента из общих данных при его скрытии
     * @param newValue
     */
    isVisibilityFromDependency(newValue) {
      if (newValue) {
        this.changeValue()
        this.changeValid();
      } else {
        this.$emit("changedValue", {
          name: this.localElementName,
          eventType: "delete",
        });
      }
    }
  },

  computed: {
    isVisibilityFromDependency() {
       if (this.isDependencyElementVisibility && this.majorElementDependency) {
          try {
            return eval(this.processingVariablesOnFormula)
          } catch (e) {
            return false;
          }
       }
       return true;
    },
    /**
     * Наличие зависимости у текущего элемента
     * @returns {boolean}
     */
    isDependencyElementVisibility() {
      return Boolean(this.dependencyName?.length && this.formulaDependency?.length)
    },
    /**
     * Элемент от которого идет зависимость
     * @returns {*|null}
     */
    majorElementDependency() {
      if (this.dependencyName?.length) {
        return this.dependencyName in this.globalDataForDependencies ? this.globalDataForDependencies[this.dependencyName] : null;
      }
      return null;
    },
    parsingFormulaVariables() {
      if (this.formulaDependency?.length) {
        return this.formulaDependency?.split(" ").filter((item) => item.length);
      }
      return [];
    },
    processingVariablesOnFormula() {
      if (this.majorElementDependency) {
       return this.parsingFormulaVariables.reduce((resultText, item) => {
          resultText += item === this.dependencyName ? this.majorElementDependency.value : item;
          return resultText
        }, '')
      }
      return "";
    }
  }
}
