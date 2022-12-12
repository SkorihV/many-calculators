import { defineProps } from "vue";

/**
 *
 * @param propsName
 * @returns {{}}
 */
export default function(propsName) {
  const propsForReturn = {};

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

  const tabItem = () => {
    return {
      type: Object,
      default: () => {},
    }
  }

  const tabName = () => {
    return {
      type: String,
      default: "",
    }
  }

  const tabItemId = () => {
    return {
      type: Number,
    }
  }

  const shownIdTab = () => {
    return {
      type: Number,
      default: null,
    }
  }

  const resultsData = {
    tabData: tabData(),
    label: label(),
    elementName: elementName(),
    classes: classes(),
    dependencyFormulaDisplay: dependencyFormulaDisplay(),
    parentIsShow: parentIsShow(),
    tabItem: tabItem(),
    tabName: tabName(),
    tabItemId: tabItemId(),
    shownIdTab: shownIdTab()
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
