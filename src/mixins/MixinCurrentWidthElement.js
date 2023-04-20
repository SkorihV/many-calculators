export const MixinCurrentWidthElement = {
  mounted() {
    let stepInterval = 0;
    this.timerName = setInterval(() => {
      this.updatedCurrentWidth();
      if (stepInterval > 10) {
        clearInterval(this.timerName);
      }

      stepInterval++;
    }, 500);

    window.addEventListener("resize", this.resizeWidth);
  },
  unmounted() {
    window.removeEventListener('resize', this.resizeWidth)
  },
  data() {
    return {
      currentWidthElement: 980,
      timerName: null,
    };
  },
  methods: {
    updatedCurrentWidth() {
      if (this.$refs?.parent && this.$refs.parent?.offsetWidth !== 0) {
          this.currentWidthElement = this.$refs.parent.offsetWidth;
          clearInterval(this.timerName);
      }
    },
    resizeWidth() {
      this.updatedCurrentWidth();
    }
  },
  watch: {
    parentIsShow: {
      handler(newValue) {
        if (newValue) {
          let stepInterval = 0;
          this.timerName = setInterval(() => {
            this.updatedCurrentWidth();
            if (stepInterval > 10) {
              clearInterval(this.timerName);
            }
            stepInterval++;
          }, 500);
        }
      },
    },
  },
  computed: {
    isMakeElementColumn() {
      return (
        (this.currentWidthElement <= 350 && this.isExistLabel) ||
        this.currentWidthElement <= 220
      );
    },
  },
};
