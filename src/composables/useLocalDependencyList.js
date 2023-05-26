import {
  getBaseStoreGetters,
  getBaseStoreAction,
} from "@/composables/useBaseStore";
import { ref, reactive, watch, isReactive, onMounted } from "vue";

export function useLocalDependencyList() {
  const { globalDependenciesList } = getBaseStoreGetters();
  const isElementDependency = getBaseStoreAction("isElementDependency");
  const localDependencyList = reactive({});
  const countUpdatedDependency = ref(0);

  /**
   * Собираем локальный список зависимостей из глобального на основе формулы
   * @param formula
   */
  const constructLocalListElementDependencyInFormula = (formula) => {
    formula.forEach((name) => {
      if (isElementDependency(name) && !existLocalElementDependency(name)) {
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
    localDependencyList[name] = globalDependenciesList.value[name];
  };

  watch(
    globalDependenciesList,
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
