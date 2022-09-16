<template>
  <div v-if="banks.length" class="calc-slider">
    <div
      v-for="bank in banks"
      :key="Math.random()"
      class="calc-slider__item"
      @click="selectedBank(bank)"
    >
      <div class="calc-slider__wrapper-img">
        <img :src="bank.image" :alt="bank.title" class="calc-slider__img" />
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
    $(".calc-slider").slick(this.sliderOptions);
    if (this.banks.length) {
      this.$emit("selectCurrentBank", this.banks[0]);
    }
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

  methods: {
    selectedBank(bank) {
      this.$emit("selectCurrentBank", bank);
    },
  },
};
</script>

<style scoped></style>
