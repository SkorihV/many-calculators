import { nextTick } from "vue";

export default function goScrollToElement(
  elementNameToScroll,
  blockPosition = "start"
) {
  nextTick(() => {
    const elementToScroll = document.querySelector("#" + elementNameToScroll);
    if (Boolean(elementToScroll)) {
      elementToScroll.scrollIntoView({
        behavior: "smooth",
        block: blockPosition,
        inline: "start",
      });
    }
  });
}
