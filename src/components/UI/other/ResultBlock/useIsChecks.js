import { computed } from "vue";

export function useIsChecks(data) {
  const isShowResultBlockTitle = Boolean(data?.title?.length);
  const isShowResultBlockSubtitle = Boolean(data?.subtitle?.length);
  const isShowSumma = !Boolean(data?.hiddenSumma)

  return {
    isShowResultBlockTitle,
    isShowResultBlockSubtitle,
    isShowSumma
  }
}


