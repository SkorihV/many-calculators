import {getCurrentInstance} from "vue";
const instance = getCurrentInstance();

export const getParent = () => {
  if ( instance?.proxy.$parent?.$el) {
    return instance.proxy.$parent.$el
  }
  return null;
}
