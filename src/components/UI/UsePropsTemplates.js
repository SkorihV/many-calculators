import { defineProps } from "vue";

/**
 *
 * @param propsName
 * @returns {{}}
 */
export default function(propsName) {
  const propsForReturn = {};

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




  const accordionData = () => {

  }

  const resultsData = {
    label: label(),
    elementName: elementName(),
    classes: classes(),
    dependencyFormulaDisplay: dependencyFormulaDisplay(),
    parentIsShow: parentIsShow(),
  }

  if (Array.isArray(propsName)) {
    propsName.map((name) => {
      if (resultsData[name]) {
        propsForReturn[name] = resultsData[name];
      }
    })
  }
  return propsForReturn;
}
