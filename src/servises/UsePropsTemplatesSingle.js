/**
 *
 */
class Props {
  constructor() {
    if (typeof Props.instance === 'object') {
      return Props.instance;
    }
    this.propsData = {
      label: this.label(),
      labelSub: this.labelSub(),
      elementName: this.elementName(),
      classes: this.classes(),
      dependencyFormulaDisplay: this.dependencyFormulaDisplay(),
      parentIsShow: this.parentIsShow(),
      prompt: this.prompt(),
      notEmpty: this.notEmpty(),
      excludeFromCalculations: this.excludeFromCalculations(),
      parentName: this.parentName(),
      formulaProcessingLogic: this.formulaProcessingLogic(),
      templateName: this.templateName(),
      maxWidthSide: this.maxWidthSide(),
      maxWidth: this.maxWidth(),
      maxHeight: this.maxHeight(),
      template: this.template(),
      index: this.index(),
      cost: this.cost(),
      dependencyPrices: this.dependencyPrices(),
      isColumn: this.isColumn(),
      isNeedChoice: this.isNeedChoice(),
      formOutputMethod: this.formOutputMethod(),
      resultOutputMethod: this.resultOutputMethod(),
      isChecked: this.isChecked(),
      formula: this.formula(),
      min: this.min(),
      max: this.max(),
      unit: this.unit(),
      positionElement: this.positionElement(),
      zeroValueDisplayIgnore: this.zeroValueDisplayIgnore(),
      baseValue : this.baseValue(),
      iconSettings: this.iconSettings(),
      backgroundImageSettings: this.backgroundImageSettings(),
      templates: this.templates(),
    };
    Props.instance = this;
    return this;
  }

  templates() {
    return {
      type: Array,
      default: () => [],
    }
  };

  /**
   * заголовок
   */
  label() {
    return {
      type: String,
      default: "",
    };
  };
  labelSub() {
    return {
      type: String,
      default: "",
    };
  };
  elementName(){
    return {
      type: String,
      default: Math.random().toString(),
    };
  };
  classes() {
    return {
      type: String,
      default: null,
    };
  };

  /**
   * Формула на результатах вычисления которой будет строиться результат отображения элемента
   * @returns {{default: string, type: StringConstructor}}
   */
  dependencyFormulaDisplay() {
    return {
      type: String,
      default: "",
    };
  };

  parentIsShow() {
    return {
      type: Boolean,
      default: true,
    };
  };

  prompt(){
    return {
      type: String,
      default: null,
    };
  };

  maxWidthSide() {
    return {
      type: [Number, String],
      default: 50,
    };
  };

  maxWidth() {
    return {
      type: [Number, String],
      default: 50,
    };
  };

  maxHeight() {
    return {
      type: [Number, String],
      default: 50,
    };
  };

  templateName() {
    return {
      type: String,
      default: null,
    };
  };

  template() {
    return {
      type: Object,
      default: null,
    };
  };

  formulaProcessingLogic() {
    return {
      type: String,
      default: "error",
    };
  };

  parentName() {
    return {
      type: String,
      default: null,
    };
  };

  /**
   * Исключить элемент из расчета по формуле
   */
  excludeFromCalculations() {
    return {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    };
  };
  /**
   * элемент не может быть пустым и требуется выбор
   */
  notEmpty() {
    return {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    };
  };

  index() {
    return {
      type: [Number, String],
      default: null,
    };
  };

  cost() {
    return {
      type: [Number, String],
      default: null,
      validator(value) {
        return !isNaN(Number(value));
      },
    };
  };
  /**
   * Список цен с зависимостями / условиями
   */
  dependencyPrices() {
    return {
      type: Array,
      default: () => [],
    };
  };

  isColumn() {
    return {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    };
  };

  /**
   * По умолчанию не выбрано - нужно сделать выбор.
   */
  isNeedChoice() {
    return {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    };
  };
  /**
   * метод вывода данных в результирующую форму
   */
  formOutputMethod() {
    return {
      type: String,
      default: "no",
    };
  };

  /**
   * метод вывода данных в результирующий блок
   */
  resultOutputMethod() {
    return {
      type: String,
      default: "no",
    };
  };

  /**
   *     Всегда включена. Отключить нельзя
   */
  isChecked() {
    return {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    };
  };

  formula() {
    return {
      type: String,
      default: "",
    };
  };

  min() {
    return {
      type: [Number, String],
      default: 0,
      validator(value) {
        return !isNaN(Number(value));
      },
    };
  };

  max() {
    return {
      type: [Number, String],
      default: 10,
      validator(value) {
        return !isNaN(Number(value));
      },
    };
  };

  unit() {
    return {
      type: String,
      default: "",
    };
  };

  positionElement() {
    return {
      type: Number,
      default: 0,
    };
  };

  /**
   * Игнорировать пустое значение при выводе в результат
   * @returns {{default: boolean, validator(*): *, type: (BooleanConstructor|NumberConstructor)[]}|boolean}
   */
  zeroValueDisplayIgnore() {
    return {
      type: [Boolean, Number],
      default: true,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    };
  };
  baseValue() {
    return {
      type: String,
      default: "default",
    };
  };

  iconSettings() {
    return {
      type: Object,
      default: () => {},
    }
  }
  backgroundImageSettings() {
    return {
      type: Object,
      default: () => {},
    }
  }

  getProps(props) {
    let propsForReturn = {};
    if (Array.isArray(props)) {
      props.map((name) => {
        if (this.propsData[name]) {
          propsForReturn[name] = this.propsData[name];
        } else {
          throw "Попытка вызвать отсутствующий в базе Props - " + name;
        }
      });
      return propsForReturn;
    }
  }
}
const propsTemplate = new Props();

export { propsTemplate };
