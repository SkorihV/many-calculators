<template>
  <div class="calc-slider" v-cloak>
    <div
      v-for="bank in banks"
      :key="Math.random()"
      class="calc-slider__item"
      @click="selectedBank(bank)"
    >
      <div class="calc-slider__wrapper-img">
        <img
          v-if="bank?.image?.filename"
          :src="this.imageDir + bank?.image?.filename"
          :alt="bank.title"
          width="150"
          height="100"
          class="calc-slider__img"
        />
      </div>
      <div class="calc-slider__wrapper-title">
        <span class="calc-slider__title">{{ bank.title }}</span
        ><span class="calc-slider__interest-rate"
          >{{ bank.interestRate }} %</span
        >
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "TheBanks",
  emits: ["selectCurrentBank"],
  mounted() {
    this.imageDir = window?.imageDir || "";
    setTimeout(() => {
      $(".calc-slider").slick(this.sliderOptions);
      if (this.banks.length) {
        this.$emit("selectCurrentBank", this.banks[0]);
      }
    }, 100);
  },

  props: {
    sliderOptions: {
      type: Object,
      default: () => {},
    },
    banks: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      imageDir: null,
    };
  },

  methods: {
    selectedBank(bank) {
      this.$emit("selectCurrentBank", bank);
    },
  },
};
</script>

<style scoped></style>
