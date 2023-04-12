import { useBaseStore } from "@/store/piniaStore";
import { mapState } from "pinia";

export const MixinLocalDependencyList = {
  data() {
    return {
      /**
       * список переменных от которого зависит именно текущий элемент
       */
      localDependencyList: {},
      countUpdatedDependency: 0,
    };
  },
  methods: {
    /**
     * Собираем локальный список зависимостей из глобального на основе формулы
     * @param formula
     */
    constructLocalListElementDependencyInFormula(formula) {
      formula.forEach((name) => {
        if (
          this.isElementDependency(name) &&
          !this.existLocalElementDependency(name)
        ) {
          this.putElementDependencyInLocalList(name);
        }
      });
    },
    isElementDependency(name) {
      const elementIsNotExist = !name?.length && !this.globalDependenciesList;
      if (elementIsNotExist) {
        return false;
      }
      return name in this.globalDependenciesList;
    },
    /**
     * @param name
     * @returns {boolean}
     */
    existLocalElementDependency(name) {
      return name in this.localDependencyList;
    },
    /**
     * @param name
     */
    putElementDependencyInLocalList(name) {
      this.localDependencyList[name] = this.globalDependenciesList[name];
    },
  },
  watch: {
    globalDependenciesList: {
      handler(newValue) {
        let isUpdated = false;
        for (let key in newValue) {
          const isUpdatedDependencyList =
            this.existLocalElementDependency(key) &&
            (newValue[key].value !== this.localDependencyList[key].value ||
              newValue[key].isShow !== this.localDependencyList[key].isShow);

          if (isUpdatedDependencyList) {
            this.localDependencyList[key] = newValue[key];
            isUpdated = true;
            this.countUpdatedDependency++;
          }
        }
        if (isUpdated && this.changeValue) {
          this.changeValue("changeValueDependenciesElements");
        }
      },
      deep: true,
    },
    localDependencyList: {
      handler(newValue, oldValue) {
        let isUpdated = false;
        Object.entries(newValue).forEach(([key, data]) => {
          if (data.value !== oldValue[key].value) {
            isUpdated = true;
          }
        });
      },
      deep: true,
    },
  },
  computed: {
    ...mapState(useBaseStore, [
      "globalDependenciesList",
      "isCanShowAllTooltips",
      "devMode",
    ]),
  },
};
