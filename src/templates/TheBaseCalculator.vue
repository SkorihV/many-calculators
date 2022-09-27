<template>
  <ui-radio
    :radio-value="radioArr"
    @change-radio="changeRadio"
    is-column
  ></ui-radio>
  <div>32434</div>
  {{ currentRadio }}
</template>

<script>
import UiRadio from "@/components/UI/UiRadio";
export default {
  name: "TheBaseCalculator",
  components: { UiRadio },
  data() {
    return {
      radioArr: [
        {
          label: "первая",
          value: 1,
          cost: 150,
        },
        {
          label: "вторая",
          value: 2,
          cost: 34,
        },
        {
          label: "третья",
          value: 3,
          cost: 560,
        },
        {
          label: "четвертая",
          value: 4,
          cost: 11,
        },
      ],
      currentRadio: null,
    };
  },
  methods: {
    changeRadio(data) {
      this.currentRadio = data;
    },
  },
};
</script>

<style scoped></style>
