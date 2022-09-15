<template>
  <div class="calc calc-wrapper">
    <the-banks
      :slider-options="sliderOptions"
      :banks="banks"
      @current-interest-rate="changeInterestRate"
    />
    <div class="calc__wrapper-content content">
      <div class="content__left-side">
        <ui-input
          label="Стоимость объекта недвижимости:"
          :inputValue="propertyPrice"
          @changeValue="changePropertyPrice"
          id-name="propertyPrice"
          unit="руб"
          not-empty
          only-number
        />
        <ui-range />
        <div class="content__min-wrapper">
          <ui-input
            label="первоначальный взнос:"
            id-name="downPaymentPercentage"
            :inputValue="downPaymentPercentage"
            @changeValue="changeDownPaymentPercentage"
            min="10"
            max="100"
            unit="%"
            not-empty
            only-number
          />
          <ui-input
            unit="руб"
            :inputValue="downPaymentCurrency"
            id-name="downPaymentCurrency"
            @changeValue="changeDownPaymentCurrency"
            not-empty
            only-number
          />
        </div>

        <ui-input
          label="срок кредита:"
          :inputValue="creditTerm"
          @changeValue="changeCreditTerm"
          id-name="creditTerm"
          min="1"
          max="25"
          only-number
          not-empty
        />
      </div>


      <div class="content__right-side">
        propertyPrice {{propertyPrice}} <br>
        propertyPrice {{propertyPrice}} <br>
        downPaymentPercentage {{downPaymentPercentage}} <br>
        downPaymentCurrency {{downPaymentCurrency}} <br>
        creditTerm {{ creditTerm}} <br>
      </div>
    </div>

  </div>
</template>

<script>
import TheBanks from "@/components/TheBanks";
import UiInput from "@/components/UI/UiInput";
import UiRange from "@/components/UI/UiRange";

export default {
  name: "app_mortgage_calculator",
  components: {
    TheBanks,
    UiInput,
    UiRange
  },
  data() {
    return {
      sliderOptions: {
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: false,
        autoplaySpeed: 2000,
      },
      currentInterestRate: 0, //текущая процентная ставка
      propertyPrice: 0, //стоимость покупаемого объекта недвижимости
      downPaymentPercentage: 0, //первоначальный взнос процент
      downPaymentCurrency: 0, //первоначальный взнос валюта
      creditTerm: 0, //срок кредита

      max: 100,
      min: 10,
      banks: [
        {
          title:
            "Ну очень большое название банка прям в две строки чтобы не поместилось",
          image: "https://dummyimage.com/150x100/cccccc/fff.jpg",
          interestRate: 10.5,
        },
        {
          title: "",
          image: "https://dummyimage.com/150x100/cccccc/fff.jpg",
          interestRate: 11.5,
        },
        {
          title: "Банк 3",
          image: "https://dummyimage.com/150x100/cccccc/fff.jpg",
          interestRate: 12.5,
        },
        {
          title: "Банк 4",
          image: "https://dummyimage.com/150x100/cccccc/fff.jpg",
          interestRate: 13.5,
        },
      ],
    };
  },
  methods: {
    changeInterestRate(rate) {
      this.currentInterestRate = rate;
    },
    changePropertyPrice(price) {
      this.propertyPrice = price;
    },
    changeDownPaymentPercentage(paymentPercent) {
      console.log('downPaymentPercentage');
      console.log(paymentPercent);
      this.downPaymentPercentage = paymentPercent;
    },
    changeDownPaymentCurrency(paymentCurrency) {
      console.log(paymentCurrency);
      this.downPaymentCurrency = paymentCurrency;
    },
    changeCreditTerm(creditTerm) {
      this.creditTerm = creditTerm
    }
  },
  watch: {
    currentInterestRate() {
    },
    propertyPrice() {
      this.downPaymentCurrency = parseFloat((this.propertyPrice - (this.propertyPrice / 100 * this.downPaymentPercentage)).toFixed(2));
    },
    downPaymentPercentage() {
      this.downPaymentCurrency = parseFloat((this.propertyPrice - (this.propertyPrice / 100 * this.downPaymentPercentage)).toFixed(2));
    },
    downPaymentCurrency() {

    },
    creditTerm(){},
  }
};
</script>

<style lang="scss">
$color-dark-normal: #464657;
$color-orange-normal: #ff7044;

$color-dark-hover: #5a5a70;
$color-orange-hover: #ff5d2b;

$color-danger: #ff4444;

$color-font-dark: #000000;
$color-font-white: #ffffff;

$color-gray-light: #f2f2f2;
$color-gray-middle: #e6e6e6;
$color-gray-dark: #cccccc;

$border-radius: 4px;

@mixin style-border {
  border: 1px solid $color-gray-middle;
  border-radius: $border-radius;
}

@mixin style-border-hover {
  border: 1px solid $color-gray-dark;
}

@mixin style-button {
  color: $color-font-white;
  background-color: $color-dark-normal;
  @include style-flex-center;
  @include style-border;
}

@mixin style-button-hover {
  background-color: $color-dark-hover;
  box-shadow: 0 0 3px 1px $color-gray-dark;
}

@mixin style-flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

@mixin style-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

//normal orange - FF7044
//normal dark- 464657
//hover orange - FF5D2B
//hover dark- 5A5A70
//font - 00000
//серый - CCCCCC
// border - E6E6E6 -
// background - F2F2F2

* {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: 0;
}

#app_mortgage_calculator {
  max-width: 980px;
  margin: 0 auto;
  min-height: 100vh;
  background-color: $color-gray-light;
}

#app_mortgage_calculator {
  .calc {
    * {
      margin: 0;
      font-size: 15px;
      text-align: center;
      color: $color-font-dark;
      font-family: Arial, Helvetica, sans-serif;
      box-sizing: border-box;
    }
    //-------------------Стили слайдера-----
    &-slider {
      padding: 0 45px;
      margin: 10px 0;
      .slick-list {
        display: flex;
        .slick-track {
          display: flex;
        }
      }
      &__item {
        @include style-flex-center;
        flex-direction: column;
        background-color: $color-gray-dark;
        margin: 0 5px;
        padding: 1px;
        cursor: pointer;
        @include style-border;
        &:hover {
          @include style-border-hover;
        }
      }
      &__wrapper-img {
        @include style-flex-center;
        max-height: 150px;
      }
      &__img {
        @include style-img;
      }
      &__wrapper-title {
        border-top: 1px solid $color-gray-middle;
        width: 100%;
        height: 100%;
        padding: 5px;
        @include style-flex-center;
      }
      &__title {
        color: $color-dark-normal;
      }
      &__interest-rate {
        flex: 0 0 auto;
        padding: 5px;
        background-color: $color-gray-light;
        height: 100%;
        margin-left: 5px;
        font-size: 20px;
        color: $color-gray-dark;
        @include style-flex-center;
        border-radius: $border-radius;
      }
      .slick-next,
      .slick-prev {
        font-size: 0;
        line-height: 0;
        position: absolute;
        top: 50%;
        display: block;
        width: 40px;
        height: 40px;
        padding: 0;
        -webkit-transform: translate(0, -50%);
        -ms-transform: translate(0, -50%);
        transform: translate(0, -50%);
        cursor: pointer;
        border: none;
        outline: none;
        @include style-button;
        &:hover {
          @include style-button-hover;
        }
        &:before {
          position: absolute;
          width: 100%;
          height: 100%;
          font-size: 25px;
          @include style-flex-center;
        }
      }
      .slick-next {
        right: 0;
        &:before {
          content: ">";
        }
      }
      .slick-prev {
        left: 0;
        &:before {
          content: "<";
        }
      }
    }
    //----------контент-------

    &__wrapper-content {
      display: flex;
    }
    .content {
      &__left-side {
        display: flex;
        max-width: 50%;
        flex: 1 0 auto;
        flex-direction: column;
      }
      &__min-wrapper {
        @include style-flex-center;
      }
    }

    //--------Стили input-----
    &__input {
      font-size: 15px;
      line-height: 16px;
      padding: 10px;
      max-width: 100px;
      @include style-border;
      &:hover,
      &:focus-visible {
        @include style-border-hover;
        outline: none;
      }
      &-wrapper {
        @include style-flex-center;
        flex-direction: column;
        margin: 5px;
        padding-bottom: 15px;
        position: relative;
        flex: 1 1 auto;
      }

      &-label {
        @include style-flex-center;
        width: 100%;
        justify-content: space-between;
        &-text {
          flex: 1 0 auto;
          margin-right: auto;
          display: flex;
          justify-content: flex-start;
          text-transform: uppercase;
        }
      }
      &-error {
        font-size: 10px;
        color: $color-danger;
        font-weight: 600;
        position: absolute;
        bottom: 0;
      }
    }
  }
}
</style>
