import { ref, reactive, watch} from "vue";
import {useDependencyListStore} from "@/store/dependencyListStore";
import {useInnerVariablesStore} from "@/store/innerCustomVariableStore";
import {storeToRefs} from "pinia";
import { isOtherOrGlobalSum } from "@/servises/UtilityServices";

export function useLocalDependencyList() {
  const {getInnerVariableByName} = storeToRefs(useInnerVariablesStore())
  const { getAllDependencyList, getElementByNameInDependency,isElementDependency } = storeToRefs(useDependencyListStore());
  const localDependencyList = reactive({});
  const countUpdatedDependency = ref(0);

  /**
   * Собираем локальный список зависимостей из глобального на основе формулы
   * @param formula
   */
  const constructLocalListElementDependencyInFormula = (formula) => {
    formula?.forEach((name) => {
      if (isOtherOrGlobalSum(name)) {
        putInnerVariableInLocalList(name)
      }

      if (isElementDependency.value(name) && !existLocalElementDependency(name)) {
        putElementDependencyInLocalList(name);
      }
    });
  };

  /**
   * @param name
   * @returns {boolean}
   */
  const existLocalElementDependency = (name) => {
    return name in localDependencyList;
  };
  /**
   * @param name
   */
  const putElementDependencyInLocalList = (name) => {
    localDependencyList[name] = getElementByNameInDependency.value(name);
  };
  const putInnerVariableInLocalList = (name) => {
    localDependencyList[name] = getInnerVariableByName.value(name);
  };

  watch(
      getAllDependencyList,
    (newValue) => {
      let isUpdated = false;
      for (let key in newValue) {
        const isUpdatedDependencyList =
          existLocalElementDependency(key) &&
          (newValue[key].value !== localDependencyList[key].value ||
            newValue[key].isShow !== localDependencyList[key].isShow);

        if (isUpdatedDependencyList) {
          localDependencyList[key] = newValue[key];
          isUpdated = true;
          countUpdatedDependency.value++;
        }
      }
      //вынести обновление из функции в сам компонент
      // if (isUpdated && this.changeValue) {
      //   this.changeValue("changeValueDependenciesElements");
      // }
    },
    { deep: true }
  );

  watch(
    () => localDependencyList,
    (newValue, oldValue) => {
      let isUpdated = false;
      Object.entries(newValue).forEach(([key, data]) => {
        if (data.value !== oldValue[key].value) {
          isUpdated = true;
        }
      });
    },
    { deep: true }
  );

  return {
    countUpdatedDependency,
    localDependencyList,
    constructLocalListElementDependencyInFormula,
  };
}
