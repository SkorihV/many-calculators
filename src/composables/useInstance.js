import {getCurrentInstance} from "vue";

export const getParent = () => {
  const instance = getCurrentInstance();
  if ( instance?.proxy.$parent?.$el) {
    return instance.proxy.$parent.$el
  }
  return null;
}
