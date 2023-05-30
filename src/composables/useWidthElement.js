import {computed, onMounted, onUnmounted, ref, watch} from "vue";
import {getParent} from "@/composables/useInstance";

export const getCurrentWidthElement = (parentIsShow) => {
  const currentWidthElement = ref( 980)
  const timerName = ref(null)
  const parent = getParent()

  onMounted(() => {
    let stepInterval = 0;
    timerName.value = setInterval(() => {
      updatedCurrentWidth();
      if (stepInterval > 10) {
        clearInterval(timerName.value);
      }

      stepInterval++;
    }, 500);

    window.addEventListener("resize", resizeWidth);
  })
  onUnmounted(() => {
    window.removeEventListener("resize", resizeWidth);
  })

  function resizeWidth() {
    updatedCurrentWidth();
  }
  function updatedCurrentWidth() {
    if (parent?.value && parent?.value?.offsetWidth !== 0) {
      currentWidthElement.value = parent?.value.offsetWidth;
      clearInterval(timerName.value);
    }
  }

  watch(() => parentIsShow, (newValue) => {
    if (newValue) {
      let stepInterval = 0;
      timerName.value = setInterval(() => {
        updatedCurrentWidth();
        if (stepInterval > 10) {
          clearInterval(timerName.value);
        }
        stepInterval++;
      }, 500);
    }
  })

  return {
    currentWidthElement
  }
}

export const getIsMakeElementColumn = (currentWidthElement, isExistLabel) => {
  const isMakeElementColumn = computed(() => {
    return (
        (currentWidthElement.value <= 350 && isExistLabel.value) ||
        currentWidthElement.value <= 220
    );
  })
  return {
    isMakeElementColumn
  }
}


