import { useBaseStore } from "@/store/piniaStore";
import { mapState } from "pinia";

export const MixinDisplaySpinner = {
  created() {
    this.tryToggleElementIsMounted(this.elementName, false);
  },
  mounted() {
    setTimeout(() => {
      this.tryToggleElementIsMounted(this.elementName, true);
    }, 200);
  },
  computed: {
    ...mapState(useBaseStore, ["tryToggleElementIsMounted"]),
  },
};
