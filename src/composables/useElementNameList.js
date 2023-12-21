import { useElementNamesStore } from "@/store/elementNamesStore";
import { onMounted, onUnmounted } from "vue";
export const useElementNameList =  (data) => {
  const nameStore = useElementNamesStore()

  onMounted(() => {
    nameStore.addNameInList(data)
  })
  onUnmounted(() => {
    nameStore.deleteNameInList(data.name)
  })
}
