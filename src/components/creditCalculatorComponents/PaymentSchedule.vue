<template>
  <div class="calc__table-payment-wrapper">
    <div class="calc__table-payment-show" @click="isShow = !isShow">
      {{ isShow ? "Скрыть" : "Отобразить" }}
    </div>
    <table v-if="isShow" class="calc__table-payment">
      <tr class="calc__table-payment-tr calc__table-payment-tr_sticky">
        <th class="calc__table-payment-th">№</th>
        <th class="calc__table-payment-th">Месяц</th>
        <th class="calc__table-payment-th">Сумма платежа, руб</th>
        <th class="calc__table-payment-th">Платеж по основному долгу, руб</th>
        <th class="calc__table-payment-th">Платеж по процентам, руб</th>
        <th class="calc__table-payment-th">Остаток долга, руб</th>
      </tr>
      <template v-if="typeCurrentCalculation === 'A'">
        <tr
          class="calc__table-payment-tr"
          v-for="(month, inx) in dataListForCreditAnnuity"
          :key="inx"
        >
          <td class="calc__table-payment-td">{{ inx + 1 }}</td>
          <td class="calc__table-payment-td">
            {{ monthNames[month.month] }} {{ month.year }}
          </td>
          <td class="calc__table-payment-td">{{ month.monthlyPayment }}</td>
          <td class="calc__table-payment-td">{{ month.mainSimInMonth }}</td>
          <td class="calc__table-payment-td">{{ month.percentageInMonth }}</td>
          <td class="calc__table-payment-td">{{ month.mainSum }}</td>
        </tr>
      </template>
      <template v-if="typeCurrentCalculation === 'D'">
        <tr
          class="calc__table-payment-tr"
          v-for="(month, inx) in dataListForCreditDifferentiated"
          :key="inx"
        >
          <td class="calc__table-payment-td">{{ inx + 1 }}</td>
          <td class="calc__table-payment-td">
            {{ monthNames[month.month] }} {{ month.year }}
          </td>
          <td class="calc__table-payment-td">{{ month.monthlyPayment }}</td>
          <td class="calc__table-payment-td">{{ month.mainSimInMonth }}</td>
          <td class="calc__table-payment-td">{{ month.percentageInMonth }}</td>
          <td class="calc__table-payment-td">{{ month.mainSum }}</td>
        </tr>
      </template>
    </table>
  </div>
</template>

<script>
// расчеты тут https://mobile-testing.ru/loancalc/rachet_dosrochnogo_pogashenia/

export default {
  name: "PaymentSchedule",
  emits: ["changeFirstItemForCreditDifferentiatedPayment"],
  props: {
    startCreditSum: {
      // сумма основного долга
      type: Number,
      default: null,
    },
    startDate: {
      // дата начала расчета
      type: Number,
      default: Date.now(),
    },
    creditTermMonth: {
      type: Number, // срок кредита в месяцах
    },
    monthlyPayment: {
      //ежемесячный платеж
      type: Number,
    },
    monthlyInterestRate: {
      // ежемесячная ставка
      type: Number,
    },
    typeCurrentCalculation: {
      type: String,
      default: "A",
    },
  },
  data() {
    return {
      creditListAnnuity: [], // список данных по аннуитивному типу
      creditListDifferentiated: [], // список данных по дифференцированному типу
      mainSumAnnuity: 0, // сумма платежа
      mainSumDifferentiated: 0, // сумма платежа
      monthNames: [
        "Январь",
        "Февраль",
        "Март",
        "Апрель",
        "Май",
        "Июнь",
        "Июль",
        "Август",
        "Сентябрь",
        "Октябрь",
        "Ноябрь",
        "Декабрь",
      ],
      isShow: false,
    };
  },
  methods: {
    /**
     * получить объект с данными о дне
     * @param timeStamp
     * @returns {{month: number, year: number, day: number}}
     */
    getDataDayInTimeStamp(timeStamp) {
      const newDate = new Date(timeStamp);
      const day = newDate.getDate();
      const month = newDate.getMonth();
      const year = newDate.getFullYear();
      return { year, month, day };
    },
    /**
     * получить timestamp из объекта дня
     * @param date
     * @returns {number}
     */
    getTimeStampInDate(date) {
      const time = new Date(date.year, date.month, date.day);
      return time.getTime();
    },
    /**
     * количество дней в году из timestamp
     * @param year
     * @returns {number}
     */
    getCurrentDayInYear(year) {
      return (new Date(year, 11, 31) - new Date(year, 0, 0)) / 86400000;
    },

    /**
     * количество дней между двумя датами timestamp
     * @param firstDay
     * @param lastDay
     * @returns {number}
     */
    getDifferenceDays(firstDay, lastDay) {
      return Math.abs((firstDay - lastDay) / 86400000);
    },

    /**
     * получить количество дней в месяце
     * @param month
     * @param year
     * @returns {number}
     */
    getDaysInMonth(month, year = null) {
      if (year === null) {
        let currentDate = this.getDataDayInTimeStamp(Date.now());
        year = currentDate.year;
      }
      return new Date(year, month + 1, 0).getDate();
    },

    /**
     * получить номер следующего месяца
     * @param month
     * @returns {number}
     */
    getNextMonth(month) {
      let nextMonth = month;
      if (nextMonth === 11) {
        nextMonth = 0;
      } else {
        nextMonth++;
      }
      return nextMonth;
    },

    /**
     * получить данные за месяц по аннуитетному варианту расчета
     * @param stamp
     * @returns {{month: number, monthlyPayment: string, year: number, mainSimInMonth: *, mainSum: *, percentageInMonth: *}}
     */
    getLoanInterestInMonthAnnuity(stamp) {
      let { year, month } = this.getDataDayInTimeStamp(stamp);

      let percentageOfTheDebt = this.mainSumAnnuity * this.monthlyInterestRate;
      let mainPartOfTheDebt = this.monthlyPayment - percentageOfTheDebt;
      this.mainSumAnnuity = this.mainSumAnnuity - mainPartOfTheDebt;

      return {
        percentageInMonth: this.aroundCeil(
          percentageOfTheDebt,
          100
        ).toLocaleString("ru"),
        mainSimInMonth: this.aroundCeil(mainPartOfTheDebt, 100).toLocaleString(
          "ru"
        ),
        mainSum: this.aroundCeil(this.mainSumAnnuity, 100).toLocaleString("ru"),
        monthlyPayment: this.monthlyPayment.toLocaleString("ru"),
        month,
        year,
      };
    },

    /**
     * получить данные за месяц по дифференцированному варианту расчета
     * @param stamp
     * @returns {{month: number, monthlyPayment: string, year: number, mainSimInMonth: *, mainSum: *, percentageInMonth: *}}
     */
    getLoanInterestInDifferentiated(stamp) {
      let { year, month } = this.getDataDayInTimeStamp(stamp);
      // console.log(this.monthlyInterestRate);
      let percentageOfTheDebt =
        this.mainSumDifferentiated * this.monthlyInterestRate;
      let monthlyPayment =
        percentageOfTheDebt + this.monthlyRepaymentFoDebtDifferentiated;
      this.mainSumDifferentiated =
        this.mainSumDifferentiated - this.monthlyRepaymentFoDebtDifferentiated;

      return {
        percentageInMonth: this.aroundCeil(
          percentageOfTheDebt,
          100
        ).toLocaleString("ru"),
        mainSimInMonth: this.aroundCeil(
          this.monthlyRepaymentFoDebtDifferentiated,
          100
        ).toLocaleString("ru"),
        mainSum: this.aroundCeil(
          this.mainSumDifferentiated,
          100
        ).toLocaleString("ru"),
        monthlyPayment: monthlyPayment.toLocaleString("ru"),
        month,
        year,
      };
    },

    aroundCeil(value, factor = 100) {
      return Math.ceil(value * factor) / factor;
    },
  },
  watch: {
    dataListForCreditDifferentiated() {
      if (this.dataListForCreditDifferentiated.length) {
        this.$emit(
          "changeFirstItemForCreditDifferentiatedPayment",
          this.dataListForCreditDifferentiated[0]
        );
      }
    },
  },
  computed: {
    /**
     * данные аннуитетных платежей
     * @returns {[]}
     */
    dataListForCreditAnnuity() {
      this.creditListAnnuity = [];
      this.mainSumAnnuity = this.startCreditSum;
      let { year, month } = this.getDataDayInTimeStamp(this.startDate);

      let start = new Date(year, month).getTime();

      for (let i = 0; i < this.creditTermMonth; i++) {
        this.creditListAnnuity.push(this.getLoanInterestInMonthAnnuity(start));
        let { year, month } = this.getDataDayInTimeStamp(start);

        month = this.getNextMonth(month);
        if (month === 0) {
          year++;
        }
        start = new Date(year, month).getTime();
      }
      return this.creditListAnnuity;
    },

    /**
     * данные для дифференцированных платежей
     * @returns {[]}
     */
    dataListForCreditDifferentiated() {
      this.creditListDifferentiated = [];
      this.mainSumDifferentiated = this.startCreditSum;

      let { year, month } = this.getDataDayInTimeStamp(this.startDate);

      let start = new Date(year, month).getTime();

      for (let i = 0; i < this.creditTermMonth; i++) {
        this.creditListDifferentiated.push(
          this.getLoanInterestInDifferentiated(start)
        );
        let { year, month } = this.getDataDayInTimeStamp(start);

        month = this.getNextMonth(month);
        if (month === 0) {
          year++;
        }
        start = new Date(year, month).getTime();
      }
      return this.creditListDifferentiated;
    },
    /**
     * ежемесячное погашение долга по дифференцированному типу
     * @returns {number}
     */
    monthlyRepaymentFoDebtDifferentiated() {
      return this.startCreditSum / this.creditTermMonth;
    },
  },
};
</script>

<style scoped></style>
