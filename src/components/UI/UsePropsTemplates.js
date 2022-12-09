import { defineProps } from "vue";

export default function(propsName) {
  const returnDataArr = [];

  const tabData = () => {
    return {
      type: Object,
      default: () => {},
    }
  }
  /**
   * заголовок
   */
  const label = () => {
    return {
      type: String,
      default: "",
    }
  }
  const elementName = () => {
    return  {
      type: String,
      default: Math.random().toString(),
    }
  }
  const classes = () => {
   return  {
      type: String,
    default: null,
    }
  }

  /**
   * Формула на результатах вычисления которой будет строиться результат отображения элемента
   * @returns {{default: string, type: StringConstructor}}
   */
  const dependencyFormulaDisplay = () => {
    return {
    type: String,
    default: "",
  }}

  const parentIsShow = () => {
    return {
      type: Boolean,
      default: true,
    }
  }


  const resultsData = {
    tabData: tabData(),
    label: label(),
    elementName: elementName(),
    classes: classes(),
    dependencyFormulaDisplay: dependencyFormulaDisplay(),
    parentIsShow: parentIsShow(),
  }

  propsName.map((name) => {
    if (resultsData[name]) {
      returnDataArr.push(resultsData[name])
    }
  })

  return returnDataArr;
}
