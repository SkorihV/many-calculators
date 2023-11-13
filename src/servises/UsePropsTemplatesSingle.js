import { isBoolean, isNotNaN } from "@/validators/validators";

class Props {
  constructor() {
    if (typeof Props.instance === "object") {
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
      globalMaxWidth: this.globalMaxWidth(),
      globalMaxHeight: this.globalMaxHeight(),
      template: this.template(),
      index: this.index(),
      cost: this.cost(),
      dependencyPrices: this.dependencyPrices(),
      dependencyHtmlText: this.dependencyHtmlText(),
      isColumn: this.isColumn(),
      isNeedChoice: this.isNeedChoice(),
      formOutputMethod: this.formOutputMethod(),
      resultOutputMethod: this.resultOutputMethod(),
      isChecked: this.isChecked(),
      formula: this.formula(),
      min: this.min(),
      max: this.max(),
      unit: this.unit(),
      htmlText: this.htmlText(),
      positionElement: this.positionElement(),
      zeroValueDisplayIgnore: this.zeroValueDisplayIgnore(),
      baseValue: this.baseValue(),
      iconSettings: this.iconSettings(),
      backgroundImageSettings: this.backgroundImageSettings(),
      templates: this.templates(),
      isStretch: this.isStretch(),
      elementPosition: this.elementPosition(),
      options: this.options(),
      signAfterDot: this.signAfterDot(),
      roundOffType: this.roundOffType()

    };
    Props.instance = this;
    return this;
  }

  templates() {
    return {
      type: Array,
      default: () => [],
    };
  }

  /**
   * заголовок
   */
  label() {
    return {
      type: String,
      default: "",
    };
  }
  labelSub() {
    return {
      type: String,
      default: "",
    };
  }
  elementName() {
    return {
      type: String,
      default: Math.random().toString(),
    };
  }
  classes() {
    return {
      type: String,
      default: null,
    };
  }

  /**
   * Формула на результатах вычисления которой будет строиться результат отображения элемента
   * @returns {{default: string, type: StringConstructor}}
   */
  dependencyFormulaDisplay() {
    return {
      type: String,
      default: "",
    };
  }

  parentIsShow() {
    return {
      type: Boolean,
      default: true,
    };
  }

  prompt() {
    return {
      type: String,
      default: null,
    };
  }

  maxWidthSide() {
    return {
      type: [Number, String],
      default: 100,
    };
  }

  maxWidth() {
    return {
      type: [Number, String],
      default: null,
    };
  }

  maxHeight() {
    return {
      type: [Number, String],
      default: null,
    };
  }

  htmlText() {
    return {
      type: String,
      default: null,
    };
  }

  globalMaxWidth() {
    return {
      type: [Number, String],
      default: null,
    };
  }
  globalMaxHeight() {
    return {
      type: [Number, String],
      default: null,
    };
  }

  templateName() {
    return {
      type: String,
      default: null,
    };
  }

  template() {
    return {
      type: Object,
      default: null,
    };
  }

  formulaProcessingLogic() {
    return {
      type: String,
      default: "error",
    };
  }

  parentName() {
    return {
      type: String,
      default: null,
    };
  }

  /**
   * Исключить элемент из расчета по формуле
   */
  excludeFromCalculations() {
    return {
      type: [Boolean, Number],
      default: false,
      validator: isBoolean,
    };
  }
  /**
   * элемент не может быть пустым и требуется выбор
   */
  notEmpty() {
    return {
      type: [Boolean, Number],
      default: false,
      validator: isBoolean,
    };
  }

  index() {
    return {
      type: [Number, String],
      default: null,
    };
  }

  cost() {
    return {
      type: [Number, String],
      default: null,
      validator: isNotNaN,
    };
  }
  /**
   * Список цен с зависимостями / условиями
   */
  dependencyPrices() {
    return {
      type: Array,
      default: () => [],
    };
  }
  dependencyHtmlText() {
    return {
      type: Array,
      default: () => [],
    };
  }

  isColumn() {
    return {
      type: [Boolean, Number],
      default: false,
      validator: isBoolean,
    };
  }

  isStretch() {
    return {
      type: [Boolean, Number],
      default: false,
      validator: isBoolean,
    };
  }

  /**
   * По умолчанию не выбрано - нужно сделать выбор.
   */
  isNeedChoice() {
    return {
      type: [Boolean, Number],
      default: false,
      validator: isBoolean,
    };
  }
  /**
   * метод вывода данных в результирующую форму
   */
  formOutputMethod() {
    return {
      type: String,
      default: "no",
    };
  }

  /**
   * метод вывода данных в результирующий блок
   */
  resultOutputMethod() {
    return {
      type: String,
      default: "no",
    };
  }

  /**
   *     Всегда включена. Отключить нельзя
   */
  isChecked() {
    return {
      type: [Boolean, Number],
      default: false,
      validator: isBoolean,
    };
  }

  formula() {
    return {
      type: String,
      default: "",
    };
  }

  min() {
    return {
      type: [Number, String],
      default: 0,
      validator: isNotNaN,
    };
  }

  max() {
    return {
      type: [Number, String],
      default: 10,
      validator: isNotNaN,
    };
  }

  unit() {
    return {
      type: String,
      default: "",
    };
  }

  positionElement() {
    return {
      type: Number,
      default: 0,
    };
  }

  signAfterDot() {
    return {
    type: [Number, String],
    default: -2,
      validator: isNotNaN
    }
  }
  roundOffType() {
    return {
      type: String,
      default: "round",
    }
  }

  /**
   * Игнорировать пустое значение при выводе в результат
   * @returns {{default: boolean, validator(*): *, type: (BooleanConstructor|NumberConstructor)[]}|boolean}
   */
  zeroValueDisplayIgnore() {
    return {
      type: [Boolean, Number],
      default: true,
      validator: isBoolean,
    };
  }
  baseValue() {
    return {
      type: String,
      default: "default",
    };
  }

  iconSettings() {
    return {
      type: Object,
      default: () => {},
    };
  }
  options() {
    return {
      type: Object,
      default: () => {},
    };
  }

  elementPosition() {
    return {
      type: String,
      default: "default",
    };
  }

  backgroundImageSettings() {
    return {
      type: Object,
      default: () => {},
    };
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
    } else {
      throw "Переданный список не является массивом " + props;
    }
  }
}
const propsTemplate = new Props();

export { propsTemplate };
