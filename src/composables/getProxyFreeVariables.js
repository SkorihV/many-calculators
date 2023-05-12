import { unref } from "vue";
import {getBaseStoreFields} from "@/composables/useBaseStore";


/**
 * Системная переменная объединяющая в себе сумму всех не используемых в формуле переменных
 * @param value
 * @param name
 * @returns {{cost, name: (*|null), isShow: boolean}}
 */
const getProxyFreeVariables = (value, name = null) => {
  const {getNameReserveVariable} = getBaseStoreFields();
  value = unref(value);
  name = unref(name);
  return new Proxy(
    {
      name: name === null ? getNameReserveVariable.value : name,
      cost: value,
      isShow: Boolean(value),
    },
    {
      get: (target, name) => {
        return name in target ? target[name] : null;
      },
    }
  );
}
