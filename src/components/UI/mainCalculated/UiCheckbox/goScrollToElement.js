import { nextTick } from "vue";

export default function goScrollToElement(elementNameToScroll) {
  nextTick(() => {
    const elementToScroll = document.querySelector(
      "#" + elementNameToScroll
    );

    if (Boolean(elementToScroll)) {
      elementToScroll.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "start",
      });
    }
  });
}
