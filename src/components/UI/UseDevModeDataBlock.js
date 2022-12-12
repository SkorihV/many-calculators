import { useBaseStore } from "@/store/piniaStore";

import {computed, reactive } from "vue";
import UseUtilityServices from "@/components/UI/UseUtilityServices";

export default function UseDevModeDataBlock(outerData) {
  const store = useBaseStore();
  const { getArrayElementsFromFormula } = UseUtilityServices();
  const data = reactive(outerData)


  const devModeData = computed(()=> {
    if (store.showDevModeBlock) {
      const textLabel = `<div>Заголовок элемента: ${data.label}</div>`;
      const textElementName = `<div>Имя элемента: ${data.elementName}</div>`;
      const textDependencyFormula = data.dependencyFormulaDisplay?.length
        ? `<div> Формула зависимости отображения: ${getArrayElementsFromFormula(
          data.dependencyFormulaDisplay
        ).join(" ")}</div>`
        : "";
      const textDependencyFormulaBeforeProcessing = data.parsingFormulaVariables?.length
        ? `<div>Формула зависимости отображения после обработки: ${data.parsingFormulaVariables}</div>`
        : "";
      const textInfoVisibility = `Отображается: ${data.isVisibilityFromDependency}`;

      const textValue = `<div>Значение элемента: ${
        data.templateName === "UiInput" || data.templateName === "UiRange"
          ? data.resultValue
          : data.templateName === "UiRadio"
            ? data.changedRadio?.value
              ? data.changedRadio?.value
              : null
            : data.templateName === "UiSelect"
              ? data.currentOption?.value
              : data.templateName === "UiCheckbox"
                ? data.localValue
                : null
      }</div>`;

      let textLocalCost = "";

      if (data?.localCost) {
        textLocalCost = `<div>Текущая стоимость: ${data.localCost}</div>`;
      }
      return `
          <div class="dev-block">
           ${textLabel}
           ${textElementName}
           ${textDependencyFormula}
           ${textDependencyFormulaBeforeProcessing}
            
           ${textValue}
           ${textInfoVisibility}

           ${textLocalCost}
          </div>`;
    }
    return false;
  })

  return {
    devModeData
  }
};
