<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import {useBaseStore} from "@/store/baseStore";
import {useElementNamesStore} from "@/store/elementNamesStore";
import {storeToRefs} from "pinia";
import devFormulaBlockWrapper from '@/components/UI/devMode/devFormulaBlockWrapper.vue'

import {
  REGEXP_ELEMENT_VALUE_AS_WORLD,
  REGEXP_SIGN,
  REGEXP_SPACES_IN_AROUND,
  REGEXP_VARIABLE_SIGN_NUMBERS,
} from "@/constants/regexp";
import {
  EXCEPTION_VARIABLES_IN_FORMULA,
  LIST_BANNED_ELEMENTS_NAME,
} from "@/constants/variables";
import { trimVariableCost, trimVariableValue } from "@/servises/UtilityServices";

const baseStore = useBaseStore()
const {getAllNameListByArray} = storeToRefs(useElementNamesStore())
const { devMode } = storeToRefs(baseStore);

const props = defineProps({
  templates: {
    type: Array,
    default: () => [],
  },
  resultOptions: {
    type: Object,
    default: () => {}
  },
  formula: {
    type: String,
    default: null,
  },
});

onMounted(() => {
  setTimeout(() => {
    processingAllTemplatesOnData();
  }, 2000);
  console.warn(
    "Включен режим отладки с демонстрацией ошибок и внутренних состояний элементов."
  );
});

const usedArrayNamesInElements = reactive(new Set()); //список используемых имен для создания зависимостей
const listExistElementNames = ref([]); // Список всех имен элементов которые могут участвовать в расчетах
const listDisplayFormula = ref([]); //список всех формул отвечающих за отображение
const listComputedFormula = ref([]); //Список всех формул отвечающих за расчет
const displayAlert = ref(false);
const localShowInsideElementStatus = ref(false);


const listFieldsInFormula = [
  "dependencyFormulaDisplay",
  "dependencyFormulaItem",
  "dependencyFormulaDisplayLeftSide",
  "dependencyFormulaDisplayRightSide",
  "dependencyFormulaHtmlText",
  "formulaDisplayButton",
  "formulaDependencyForResultBlock",
  "formulaDependencyTextAfterSumma",
  "dependencyFormulaTextAfterSumma",
  "dependencyFormulaOutput"
];

/**
 * рекурсивно обходим все шаблоны и получаем нужный массив данных
 * по указанному полю в указанную переменную
 * @param template - данные по которым происходит обход
 * @param desiredField - название / массив полей которые будут искаться в данных
 * @param accumulatorVariable - переменная из data() в которую будет передаваться полученный массив объектов
 * @param nameFieldOnResult - название поля в объекте куда будет передаваться полученные результаты по отдельному полю
 * @param label  - заголовок для переменной
 * @returns {boolean}
 */
function getNeedleDataInTemplates(
  template,
  desiredField,
  accumulatorVariable,
  nameFieldOnResult,
  label = null
) {
  if (template?.label) {
    label = template.label;
  }

  if (Array.isArray(desiredField)) {
    desiredField?.forEach((field) => {
      isExistField(template, field)
        ? accumulatorVariable.value.push({
            label: template?.label ? template?.label : label ? label : null,
            [nameFieldOnResult]: template[field],
          })
        : false;
    });
  } else {
    isExistField(template, desiredField)
      ? accumulatorVariable.value.push({
          label: template?.label ? template?.label : label ? label : null,
          [nameFieldOnResult]: template[desiredField],
        })
      : false;
  }

  for (let prop in template) {
    if (isDataObject(template[prop])) {
      getNeedleDataInTemplates(
        template[prop],
        desiredField,
        accumulatorVariable,
        nameFieldOnResult,
        label
      );
    } else if (isDataArray(template[prop])) {
      template[prop].forEach((item) =>
        getNeedleDataInTemplates(
          item,
          desiredField,
          accumulatorVariable,
          nameFieldOnResult,
          label
        )
      );
    }
  }
  return false;
}

/**
 * поле существует
 * @param template
 * @param field
 * @returns {boolean}
 */
function isExistField(template, field) {
  return Boolean(template[field]?.length);
}

/**
 * @param data
 */
function isDataObject(data) {
  return (
    typeof data === "object" &&
    !Array.isArray(data) &&
    data !== null &&
    data !== "undefined"
  );
}

/**
 *
 * @param data
 * @returns {*|boolean}
 */
function isDataArray(data) {
  return (
    Array.isArray(data) && data?.length && data !== null && data !== "undefined"
  );
}

/**
 *
 * @returns {*[]}
 */
function processingAllTemplatesOnData() {
  if (!props.templates?.length) {
    return [];
  }

  getNeedleDataInTemplates(
    props.templates,
    "elementName",
    listExistElementNames,
    "elementName"
  );

  getNeedleDataInTemplates(
    props.templates,
    listFieldsInFormula,
    listDisplayFormula,
    "displayFormula"
  );
  getNeedleDataInTemplates(
    props.resultOptions,
    listFieldsInFormula,
    listDisplayFormula,
    "displayFormula"
  );
  getNeedleDataInTemplates(
    props.templates,
    ["formula", "dependencyFormulaCost", "cost",],
    listComputedFormula,
    "formula"
  );

  if (props.formula?.length) {
    listComputedFormula.value.push({
      label: "Основная формула",
      formula: props.formula,
    });
  }

  listDisplayFormula.value = listDisplayFormula.value.map((item) => {
    item.displayFormula = processingFormulaSpecialsSymbols(item.displayFormula);
    return item;
  });
  listComputedFormula.value = listComputedFormula.value.map((item) => {
    item.formula = processingFormulaSpecialsSymbols(item.formula);
    return item;
  });
  listExistElementNames.value.forEach((item) =>
    usedArrayNamesInElements.add(item.elementName)
  );
}

/**
 *
 * @param formula
 * @returns {*}
 */
function processingFormulaSpecialsSymbols(formula) {
  // разбиваем формулу на массив отдельных данных

  formula = formula?.split(REGEXP_VARIABLE_SIGN_NUMBERS)
    ?.map((item) => {
      //удаляем пробелы по краям
      let nextItem = item?.replace(REGEXP_SPACES_IN_AROUND, "");
      // если по краям есть кавычки, то удаляем пробелы между
      // кавычками и текстом в середине, не трогая пробелы внутри текста
      if (item?.match(REGEXP_SIGN)) {
        nextItem = "";
      }
      return nextItem;
    })
    .filter(
      (item) =>
        item?.trim()?.length && !item.match(REGEXP_ELEMENT_VALUE_AS_WORLD)
    );

  return formula;
}

watch(localShowInsideElementStatus, (newValue) => {
  baseStore.tryToggleShowInsideElementStatus(newValue);
});

/**
 * не существующие имена в формулах отвечающих за отображение элементов
 * @returns {*[]}
 */
const notExistNamesInDisplayFormula = computed(() => {
  let usedNamesDependencyListOut = [];
  listDisplayFormula.value.forEach((item) => {
    item.displayFormula.forEach((name) => {
      name = trimVariableValue(name)
      if (
        !usedArrayNamesInElements.has(name) &&
        !EXCEPTION_VARIABLES_IN_FORMULA.includes(name)
      ) {
        usedNamesDependencyListOut.push({
          label: item.label,
          name: name,
        });
      }
    });
  });
  return usedNamesDependencyListOut;
});

/**
 * не существующие имена в формулах на расчет
 * @returns {*[]}
 */
const notExistNamesInComputedFormula = computed(() => {
  let usedNamesDependencyListOut = [];
  listComputedFormula.value.forEach((item) => {
    item?.formula.forEach((name) => {
      name = trimVariableValue(name)
      name = trimVariableCost(name)
      if (
        !usedArrayNamesInElements.has(name) &&
        !EXCEPTION_VARIABLES_IN_FORMULA.includes(name)
      ) {
        usedNamesDependencyListOut.push({
          label: item.label,
          name: name,
        });
      }
    });
  });
  return usedNamesDependencyListOut;
});

/**
 * Повторяющиеся имена переменных
 * @returns {{}}
 */
const recurringTemplateNames = computed(() => {
  let recurring = {};
  let resultRecurring = {};
  listExistElementNames.value.forEach((item) => {
    if (item.elementName in recurring) {
      recurring[item.elementName].push(item.label);
    } else {
      recurring[item.elementName] = [];
      recurring[item.elementName].push(item.label);
    }
  });
  for (let key in recurring) {
    recurring[key].length > 1 ? (resultRecurring[key] = recurring[key]) : false;
  }
  return resultRecurring;
});

const isExistDoubleNames = computed(() => {
  return Boolean(Object.keys(recurringTemplateNames.value).length);
});

const isExistNamesIsDisplayFormula = computed(() => {
  return Boolean(notExistNamesInDisplayFormula.value.length);
});

const isExistNamesInComputedFormula = computed(() => {
  return Boolean(notExistNamesInComputedFormula.value.length);
});

const isExistError = computed(() => {
  return (
    isExistDoubleNames.value ||
    isExistNamesIsDisplayFormula.value ||
    isExistNamesInComputedFormula.value
  );
});
</script>

<template>
  <div class="calc__error-wrapper" :class="{ isShow: devMode }" v-cloak>
    <div class="calc__error-control-wrapper">
      <label class="calc__error-checkbox-label" v-if="displayAlert">
        <span class="calc__error-checkbox-text">
          Отобразить внутреннее состояние элементов:
        </span>
        <input
          class="calc__error-checkbox-input"
          v-model="localShowInsideElementStatus"
          type="checkbox"
        />
      </label>
      <div
        class="calc__error-toggle"
        @click="displayAlert = !displayAlert"
        :class="{ isError: isExistError, close: !displayAlert }"
      >
        X
      </div>
    </div>
    <template v-if="displayAlert">
      <div class="calc__error-content">
        <template v-if="getAllNameListByArray.length">
          <div class="calc__error-label">
            Список всех элементов Заголовок / Имя:
          </div>
          <div
            class="calc__error-item"
            v-for="(data, key) in getAllNameListByArray"
            :key="key"
          >
            <div class="calc__error-item-name">
              {{ data.label ? data.label : "Без заголовка " }}
              <dev-formula-block-wrapper
                :formula="data.name"
                is-result
              />
            </div>
          </div>
        </template>

        <template v-if="isExistDoubleNames">
          <div class="calc__error-label">Дубли имен:</div>
          <div
            class="calc__error-item"
            v-for="(error, key) in recurringTemplateNames"
            :key="key"
          >
            <div class="calc__error-item-name">
              Название '{{ key }}' обнаружено у следующих элементов:
            </div>
            <div class="calc__error-item-name" v-for="label in error">
              {{ label?.length ? label : "Название не задано" }}
            </div>
          </div>
          <p class="calc__error-alert">Имена должны быть уникальными!</p>
        </template>

        <template v-if="isExistNamesIsDisplayFormula">
          <div class="calc__error-label">
            Не существующие имена в формулах на отображение: Заголовок / Имя
          </div>
          <div
            class="calc__error-item"
            v-for="(error, key) in notExistNamesInDisplayFormula"
            :key="key"
          >
            <div class="calc__error-item-name">
              У элемента: '{{
                error?.label?.length ? error?.label : "Название не задано"
              }}' в формуле указано имя: <b>'{{ error.name }}'</b>> - не
              существует.
            </div>
          </div>
          <p class="calc__error-alert">
            Измените существующие имена или добавьте недостающие.
          </p>
        </template>

        <template v-if="isExistNamesInComputedFormula">
          <div class="calc__error-label">
            Не существующие имена в формулах на расчет: Заголовок / Имя
          </div>
          <div
            class="calc__error-item"
            v-for="(error, key) in notExistNamesInComputedFormula"
            :key="key"
          >
            <div class="calc__error-item-name">
              У элемента: '{{
                error?.label?.length ? error?.label : "Название не задано"
              }}' в формуле указано имя: <b>'{{ error.name }}'</b> - не
              существует.
            </div>
          </div>
          <p class="calc__error-alert">
            Измените существующие имена или добавьте недостающие.
          </p>
        </template>

        <template
          v-if="
            listExistElementNames.filter((item) =>
              LIST_BANNED_ELEMENTS_NAME.includes(item.elementName)
            ).length
          "
        >
          <div class="calc__error-label">
            <p>Недоступные имена элементов</p>
            <p>Список всех имен элементов Заголовок / Имя:</p>
          </div>
          <div
            class="calc__error-item"
            v-for="(data, key) in listExistElementNames.filter((item) =>
              LIST_BANNED_ELEMENTS_NAME.includes(item.elementName)
            )"
            :key="key"
          >
            <div class="calc__error-item-name">
              {{ data.label ? data.label : "Без заголовка " }} /
              {{ data.elementName }}
            </div>
          </div>
          <p>
            Переименуйте указанные элементы иначе расчет может быть не
            корректен.
          </p>
        </template>
      </div>
      <p class="calc__error-item">
        В случае наличия ошибок, калькулятор может вести расчет некорректно!
      </p>
    </template>
  </div>
</template>
