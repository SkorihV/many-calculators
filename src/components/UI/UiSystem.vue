<template>
  <div v-if="false"></div>
</template>

<script>
import { MixinsForProcessingFormula } from "@/components/UI/MixinsForProcessingFormula";
import { MixinsGeneralItemData } from "@/components/UI/MixinsGeneralItemData";
import { mapActions } from "vuex";

export default {
  name: "UiSystem",
  emits: ["changedValue", "changeValid"],
  mixins: [MixinsForProcessingFormula, MixinsGeneralItemData],
  props: {
    cost: {
      type: [Number, String],
      default: null,
      validator(value) {
        return !isNaN(Number(value));
      },
    },
    /**
     * Список цен с зависимостями / условиями
     */
    dependencyPrices: {
      type: Array,
      default: () => [],
    },
  },
  mounted() {
    this.changeValue("mounted")
  },
  methods: {
    ...mapActions(["tryAddDependencyElement"]),
    changeValue(eventType = "system") {
      this.$emit("changedValue", {
        value: parseFloat(this.localCost),
        displayValue: null,
        name: this.localElementName,
        type: "system",
        cost: parseFloat(this.localCost),
        label: "",
        formOutputMethod: null,
        isShow: this.isVisibilityFromDependency,
        excludeFromCalculations: false,
        unit: "",
        eventType,
      });
      if (eventType !== "delete" || eventType !== "mounted") {
        this.changeValid(eventType);
      }
    },
    /**
     * возвращает общее состояние не валидности инпута
     */
    changeValid(eventType) {
      this.$emit("changeValid", {
        error: false,
        name: this.localElementName,
        type: "system",
        label: "",
        eventType,
        isShow: true,
      });
    },
    tryPassDependency() {
      this.tryAddDependencyElement({
        name: this.localElementName,
        value: parseFloat(this.localCost),
        isShow: this.isVisibilityFromDependency,
        displayValue: null,
        type: "system",
      });
    },
  },
  watch: {
    localCost: {
      handler(newValue, oldValue) {
        if (newValue !== oldValue) {
          this.changeValue();
        }
      },
      deep: true
    }
  },
  computed: {
    localElementName() {
      return this.checkedValueOnVoid(this.elementName)
        ? this.elementName
        : Math.random().toString();
    },
    /**
     * Возвращает цену подходящую условию, если моле отображается
     * Если не одна цена не подходит, то возвращается стандартная
     * @returns {Number|String|*}
     */
    localCost() {
      if (!this.initProcessingDependencyPrice || !this.dependencyPrices) {
        return this.cost;
      }

      let newCost = this.costAfterProcessingDependencyPrice(
        this.dependencyPrices
      );
      if (newCost !== null) {
        return newCost;
      }
      return this.cost;
    },
  },
};
</script>
