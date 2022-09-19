<template>
  <div class="calc calc-wrapper">
    <the-banks
      v-if="!isHandlerRate"
      :slider-options="sliderOptions"
      :banks="banks"
      @selectCurrentBank="selectCurrentBank"
    />
    <div class="calc__wrapper-content content">
      <div class="content__left-side">
        <ui-input
          label="Годовая ставка: "
          min="1"
          max="50"
          not-empty
          only-number
          is-name="handlerRate"
          :input-value="currentInterestRate"
          @changeValid="changeValid($event, 'handlerRate')"
          @changeValue="changeCurrentRateOnHandler"
        />
        <ui-input
          label="Стоимость объекта недвижимости:"
          :inputValue="propertyPrice"
          @changeValue="changePropertyPrice"
          @changeValid="changeValid($event, 'propertyPrice')"
          id-name="propertyPrice"
          unit="руб"
          not-empty
          only-number
          min="100000"
          max="15000000"
          is-currency
        />
        <ui-range
          :input-value="propertyPrice"
          @changeValue="changePropertyPrice"
          min="100000"
          max="15000000"
          step="50000"
        />
        <div class="content__min-wrapper">
          <ui-input
            label="первоначальный взнос:"
            id-name="downPaymentPercentage"
            :inputValue="downPaymentPercentage"
            @changeValue="changeDownPaymentPercentage"
            @changeValid="changeValid($event, 'downPaymentPercentage')"
            min="0"
            max="90"
            unit="%"
            not-empty
            only-number
            type-number
          />
          <ui-input
            unit="руб"
            :inputValue="downPaymentCurrency"
            id-name="downPaymentCurrency"
            @changeValue="changeDownPaymentCurrency"
            @changeValid="changeValid($event, 'downPaymentCurrency')"
            not-empty
            only-number
            is-currency
          />
        </div>
        <ui-range
          :input-value="downPaymentPercentage"
          @changeValue="changeDownPaymentPercentage"
          min="0"
          max="90"
          show-steps
          step-prompt="5"
        />
        <div class="content__min-wrapper">
          <ui-input
            label="срок кредита:"
            :inputValue="creditTerm"
            @changeValid="changeValid($event, 'creditTerm')"
            @changeValue="changeCreditTerm"
            id-name="creditTerm"
            min="10"
            max="25"
            only-number
            not-empty
          />
          <ui-select
            :options="typeTimes"
            @selectedValue="changeMethodChoiceTime"
          />
        </div>
      </div>

      <div class="content__right-side right-side">
        <div v-if="isInvalid" class="right-side__error-block">
          <div class="right-side__error-block-title">
            Не корректно заполнены данные. Исправьте, пожалуйста!
          </div>
        </div>
        <div v-else class="right-side__content-block">
          <div
            v-if="currenSelectedBank.image && !isHandlerRate"
            class="right-side__item"
          >
            <div class="right-side__content">
              <img :src="currenSelectedBank.image" />
            </div>
          </div>

          <div
            v-if="currenSelectedBank.title && !isHandlerRate"
            class="right-side__item"
          >
            <div class="right-side__label">Банк:</div>
            <div class="right-side__content right-side__content_little">
              {{ currenSelectedBank.title }}
            </div>
          </div>

          <div class="right-side__item">
            <div class="right-side__label">Ставка:</div>
            <div class="right-side__content">
              {{ currentInterestRate }}
            </div>
          </div>

          <div class="right-side__item">
            <div class="right-side__label">Сумма кредита:</div>
            <div class="right-side__content">{{ startCreditSumInOut }}</div>
          </div>

          <div class="right-side__item">
            <div class="right-side__label">Ежемесячный платеж:</div>
            <div class="right-side__content">{{ monthlyPaymentInOut }}</div>
          </div>
          <div class="right-side__item">
            <div class="right-side__label">Начисленные проценты:</div>
            <div class="right-side__content">{{ overpaymentAmountInOut }}</div>
          </div>
          <div class="right-side__item">
            <div class="right-side__label">Долг + проценты:</div>
            <div class="right-side__content">{{ totalSumCreditInOut }}</div>
          </div>
        </div>
      </div>
    </div>
    <template v-if="!isInvalid">
      <div class="calc__title">Тип расчета:</div>
      <div
        v-if="typeCalculation === 'A'"
        @click="typeCalculation = 'D'"
        class="calc__toggle-btn"
      >
        Аннуитетный
      </div>
      <div
        v-if="typeCalculation === 'D'"
        @click="typeCalculation = 'A'"
        class="calc__toggle-btn"
      >
        Дифференцированный
      </div>
      <payment-schedule
        :start-credit-sum="startCreditSum"
        :credit-term-month="amountMonth"
        :monthly-payment="monthlyPayment"
        :monthly-interest-rate="monthlyInterestRate"
        :typeCalculation="typeCalculation"
      ></payment-schedule>
    </template>
  </div>
</template>

<script>
import TheBanks from "@/components/TheBanks";
import UiInput from "@/components/UI/UiInput";
import UiRange from "@/components/UI/UiRange";
import UiSelect from "@/components/UI/UiSelect";
import PaymentSchedule from "@/components/PaymentSchedule";

export default {
  name: "app_mortgage_calculator",
  components: {
    TheBanks,
    UiInput,
    UiRange,
    UiSelect,
    PaymentSchedule,
  },
  data() {
    return {
      sliderOptions: {
        slidesToShow: 3,
        dots: true,
        infinite: false,
        slidesToScroll: 1,
        autoplay: false,
        autoplaySpeed: 2000,
      },
      currentInterestRate: 0,
      currenSelectedBank: {}, //текущая процентная ставка
      propertyPrice: 0, //стоимость покупаемого объекта недвижимости
      downPaymentPercentage: 0, //первоначальный взнос процент
      downPaymentCurrency: 0, //первоначальный взнос валюта
      creditTerm: 0, //срок кредита
      errorsInputs: new Set(),
      isHandlerRate: false,
      typeTimes: [
        {
          title: "Мес",
          value: "month",
        },
        {
          title: "Год",
          value: "year",
        },
      ],
      currentTypeTime: {}, // текущие единицы времени для расчета
      typeCalculation: "A",
      max: 100,
      min: 10,
      banks: [
        {
          title:
            "Ну очень большое название банка прям в две строки чтобы не поместилось",
          image: "https://dummyimage.com/150x100/cccccc/fff.jpg",
          interestRate: 9.6,
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
          interestRate: 15,
        },
      ],
    };
  },
  methods: {
    /**
     * Изменить годовую ставку
     * @param bank
     */
    selectCurrentBank(bank) {
      this.currenSelectedBank = bank;
      this.currentInterestRate = bank.interestRate;
    },
    changeCurrentRateOnHandler(rate) {
      this.currentInterestRate = parseFloat(rate).toFixed(2);
    },

    /**
     * изменить стоимость объекта недвижимости
     * @param price
     */
    changePropertyPrice(price) {
      this.propertyPrice = price;
    },
    /**
     * изменить процент первоначального взноса
     * @param paymentPercent
     */
    changeDownPaymentPercentage(paymentPercent) {
      this.downPaymentPercentage = paymentPercent;
    },
    /**
     * изменить сумму первоначального взноса
     * @param paymentCurrency
     */
    changeDownPaymentCurrency(paymentCurrency) {
      this.downPaymentCurrency = paymentCurrency;
    },
    /**
     * изменить срок кредита
     * @param creditTerm
     */
    changeCreditTerm(creditTerm) {
      this.creditTerm = creditTerm;
    },
    /**
     * изменить общее состояние валидности данных
     * @param dateValid
     * @param targetValid
     */
    changeValid(dateValid, targetValid) {
      if (dateValid) {
        this.errorsInputs.add(targetValid);
      } else {
        if (this.errorsInputs.has(targetValid))
          this.errorsInputs.delete(targetValid);
      }
    },
    /**
     * Округлить дробное число
     * @param value
     * @param factor
     * @returns {number}
     */
    aroundCeil(value, factor = 100) {
      return Math.ceil(value * factor) / factor;
    },
    /**
     * выбор единицы измерения срока кредита
     * @param item
     */
    changeMethodChoiceTime(item) {
      this.currentTypeTime = item;
    },
  },
  watch: {
    propertyPrice() {
      this.downPaymentCurrency = Math.ceil(
        this.propertyPrice -
          (this.propertyPrice / 100) * (100 - this.downPaymentPercentage)
      );
    },
    downPaymentPercentage() {
      this.downPaymentCurrency = Math.ceil(
        (parseFloat(this.propertyPrice) / 100) *
          parseFloat(this.downPaymentPercentage)
      );
    },
    downPaymentCurrency() {
      this.downPaymentPercentage = Math.ceil(
        this.downPaymentCurrency / (parseFloat(this.propertyPrice) / 100)
      );
    },
    creditTerm() {},
  },
  computed: {
    /**
     * количество месяцев
     * @returns {number}
     */
    amountMonth() {
      if (this.currentTypeTime.value === "year") {
        return this.creditTerm * 12;
      }

      return parseFloat(this.creditTerm);
    },
    /**
     * месячная ставка исходя из годовой
     * @returns {number}
     */
    monthlyInterestRate() {
      return this.aroundCeil(this.currentInterestRate / 12 / 100, 10000);
    },
    /**
     * общая ставка
     * @returns {number}
     */
    totalRate() {
      return Math.pow(1 + this.monthlyInterestRate, this.amountMonth);
    },
    /**
     * ежемесячный платеж
     * @returns {number}
     */
    monthlyPayment() {
      const top = this.totalRate * this.monthlyInterestRate;
      const bottom = this.totalRate - 1;

      return this.aroundCeil(this.startCreditSum * (top / bottom));
    },
    monthlyPaymentInOut() {
      return this.monthlyPayment.toLocaleString("ru");
    },

    /**
     * сумма переплаты (начисленные проценты)
     */
    overpaymentAmount() {
      return this.aroundCeil(this.totalSumCredit - this.startCreditSum);
    },
    overpaymentAmountInOut() {
      return this.overpaymentAmount.toLocaleString("ru");
    },

    /**
     * начальная сумма кредита
     * @returns {number}
     */
    startCreditSum() {
      return this.aroundCeil(this.propertyPrice - this.downPaymentCurrency);
    },
    startCreditSumInOut() {
      return this.startCreditSum.toLocaleString("ru");
    },
    /**
     * общая сумма кредита (долг + проценты)
     * @returns {number}
     */
    totalSumCredit() {
      return this.aroundCeil(this.monthlyPayment * this.amountMonth);
    },
    totalSumCreditInOut() {
      return this.totalSumCredit.toLocaleString("ru");
    },

    isInvalid() {
      return Boolean(this.errorsInputs.size);
    },
  },
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

      .slick {
        &-next,
        &-prev {
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
          &.slick-disabled {
            background-color: $color-dark-hover;
            opacity: 0.8;
            cursor: default;
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

        &-next {
          right: 0;
          &:before {
            content: ">";
          }
        }
        &-prev {
          left: 0;
          &:before {
            content: "<";
          }
        }
        &-dots {
          margin-top: 2px;
          @include style-flex-center;
          list-style: none;

          .slick-active {
            @include style-button-hover;
          }
          button {
            @include style-border;
            @include style-button;
            background-color: $color-dark-normal;
            cursor: pointer;
            line-height: 0;
            font-size: 0;
            height: 17px;
            width: 17px;
          }
        }
      }
    }
    //----------контент-------

    &__wrapper-content {
      display: flex;
      align-items: flex-start;
    }
    .content {
      &__left-side {
        display: flex;
        flex: 0 0 auto;
        flex-direction: column;
      }
      &__min-wrapper {
        @include style-flex-center;
      }

      &__right-side {
        flex: 1 1 100%;
        @include style-flex-center;
        flex-direction: column;
        padding: 15px;

        .right-side {
          &__error-block-title {
            color: $color-orange-normal;
            font-size: 30px;
          }
          &__content-block {
            display: flex;
            flex-direction: column;
            width: 100%;
          }

          &__item {
            @include style-flex-center;
            justify-content: space-between;
            padding: 10px;
          }
          &__label {
            font-size: 18px;
            color: $color-dark-normal;
          }
          &__content {
            color: $color-gray-dark;
            font-size: 30px;
            &_little {
              font-size: 20px;
            }
          }
        }
      }
    }

    &__title {
      font-size: 18px;
      font-weight: 500;
      margin-bottom: 10px;
      display: flex;
    }
    &__toggle-btn {
      font-weight: 600;
      @include style-flex-center;
      @include style-button;
      padding: 10px;
      cursor: pointer;
      &:hover {
        @include style-button-hover;
        @include style-border-hover;
      }
    }

    &__table-payment {
      width: 100%;
      &-show {
        @include style-button;
        padding: 10px;
        margin-top: 10px;
        cursor: pointer;
        @include style-border;
        &:hover {
          @include style-button-hover;
          @include style-border-hover;
        }
      }
      &-wrapper {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        max-height: 500px;
        overflow-y: auto;
      }
      &-tr {
        &_sticky {
          position: sticky;
          top: 0;
          background-color: $color-gray-dark;
        }
      }
      &-th {
        border-bottom: 1px solid $color-gray-dark;
        padding: 5px 0;
      }
      &-td {
        border-bottom: 1px solid $color-gray-dark;
        padding: 5px 0;
        color: $color-dark-normal;
      }
    }
  }
}

.calc {
  * {
    margin: 0;
    font-size: 15px;
    text-align: center;
    color: $color-font-dark;
    font-family: Arial, Helvetica, sans-serif;
    box-sizing: border-box;
  }
  //--------Стили input text-----
  &__input {
    &-wrapper {
      @include style-flex-center;
      flex-direction: column;
      margin: 5px;
      position: relative;
      flex: 1 1 auto;
      padding-bottom: 15px;
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

    &-item {
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
    }
    &-unit {
      margin-left: 5px;
    }
    &-error {
      font-size: 10px;
      color: $color-danger;
      font-weight: 600;
      position: absolute;
      bottom: 0;
    }
  }
  //--------Стили input range-----

  &__range {
    &-wrapper {
      background-color: $color-gray-middle;
      display: flex;
      flex-direction: column;
      width: 100%;
      margin: 5px 0;
    }

    &-item {
      -webkit-appearance: none;
      width: 100%;
      height: 15px;
      border-radius: 5px;
      background: #d3d3d3;
      outline: none;
      opacity: 0.7;
      -webkit-transition: 0.2s;
      transition: opacity 0.2s;
      &::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 25px;
        height: 25px;
        background: $color-dark-normal;
        cursor: pointer;
        @include style-border;
        &:hover {
          @include style-border-hover;
        }
      }
      &::-moz-range-thumb {
        width: 25px;
        height: 25px;
        border-radius: 50%;
        background: $color-dark-normal;
        cursor: pointer;
        @include style-border;
        &:hover {
          @include style-border-hover;
        }
      }
    }

    &-steps {
      &-wrapper {
        @include style-flex-center;
        justify-content: space-around;
        margin: 5px 0;
      }
      &-item {
        flex: 1 1 auto;
        position: relative;
        cursor: pointer;
        &:after {
          content: "";
          display: block;
          padding-bottom: 100%;
        }
        &-content {
          @include style-flex-center;
          position: absolute;
          width: 100%;
          height: 100%;
          font-size: 10px;
          border-radius: $border-radius;
          &_selected {
            background-color: $color-dark-normal;
            color: $color-gray-light;
          }
        }
      }
    }
  }

  //---------Стили select-----

  &__select {
    &-wrapper {
      @include style-flex-center;
      max-width: 100px;
      width: 100%;
      gap: 5px;
      padding-bottom: 15px;
      &.is-column {
        flex-direction: column;
      }
    }
    &-change {
      &-wrapper {
        cursor: pointer;
        @include style-border;
        font-size: 15px;
        line-height: 16px;
        background-color: white;
        position: relative;
      }

      &-item {
        position: relative;
        padding: 10px 25px 10px 20px;
        &:before {
          content: "";
          width: 7px;
          height: 7px;
          border: solid $color-dark-normal;
          border-width: 0 3px 3px 0;
          display: inline-block;
          position: absolute;
          top: 50%;
          right: 5px;
          transform: translateY(-50%) rotate(45deg);
          -webkit-transform: translateY(-50%) rotate(45deg);
        }
        &.is-open {
          &:before {
            transform: translateY(-50%) rotate(-135deg);
            -webkit-transform: translateY(-50%) rotate(-135deg);
          }
        }
      }
    }

    &-option {
      &-wrapper {
        display: flex;
        flex-direction: column;
        position: absolute;
        width: 100%;
        left: 0;
        top: 100%;
        @include style-border;
      }
      &-item {
        background-color: white;
        padding: 10px;
        &:hover {
          background-color: $color-gray-middle;
        }
      }
    }
  }
}
</style>
