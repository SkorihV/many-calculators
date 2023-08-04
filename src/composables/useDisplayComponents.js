import {useDisplayComponentsStore} from "@/store/displayComponentsStore";
import {onMounted, unref, watch} from "vue";

export const useDisplayComponents = (name, isVisibilityFromDependency, typeElement) => {
    const displayStore = useDisplayComponentsStore()

    onMounted(() => {
        tryDisplayingComponents()
    })

    watch(isVisibilityFromDependency, () => {
        tryDisplayingComponents()
    }, { deep: true })

    function tryDisplayingComponents() {
        displayStore.addDisplayComponent({
            name: name,
            isShow: isVisibilityFromDependency.value,
            type: typeElement
        })
    }
}