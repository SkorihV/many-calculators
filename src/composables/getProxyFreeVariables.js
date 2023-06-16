import { unref } from "vue";
import { NAME_RESERVED_VARIABLE_SUM } from "@/constants/variables";

/**
 * Системная переменная объединяющая в себе сумму всех не используемых в формуле переменных
 * @param value
 * @param name
 * @returns {{cost, name: (*|null), isShow: boolean}}
 */
export const getProxyFreeVariables = (value, cost = null, name = null) => {
  value = unref(value);
  cost = unref(cost);
  name = unref(name);
  return new Proxy(
    {
      name: name === null ? NAME_RESERVED_VARIABLE_SUM : name,
      cost: cost !== null ? cost : value,
      value: value,
      isShow: Boolean(value),
    },
    {
      get: (target, name) => {
        return name in target ? target[name] : null;
      },
    }
  );
};
