export const MixinCurrentWidthElement =  {
  mounted() {
    this.updatedCurrentWidth();
    window.addEventListener('resize', ()=> {
      this.updatedCurrentWidth();
    })
  },
  data() {
    return {
      currentWidthElement: null,
      timerName: null,
    }
  },
  methods: {
    updatedCurrentWidth() {
      if (this.$refs?.parent && this.$refs.parent?.offsetWidth !== 0) {
        this.currentWidthElement = this.$refs.parent.offsetWidth;
        clearInterval(this.timerName);
      }
    }
  },
  watch: {
    parentIsShow: {
      handler(newValue) {
        if (newValue) {
          let step = 0;
          this.timerName = setInterval(() => {
            this.updatedCurrentWidth();
            if (step > 10) {
              clearInterval(this.timerName);
            }
          },500)

        }
      }
    }
  },
  computed: {
    isMakeElementColumn() {
      return this.currentWidthElement <= 220;
    }
  }
};


