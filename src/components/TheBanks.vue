<template>
  <div v-if="banks.length" class="calc-slider">
    <div
      v-for="bank in banks"
      :key="Math.random()"
      class="calc-slider__item"
      @click="$emit('currentInterestRate', bank.interestRate)"
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
  emits: ["currentInterestRate"],
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
  mounted() {
    $(".calc-slider").slick(this.sliderOptions);
  },
};
</script>

<style scoped></style>
