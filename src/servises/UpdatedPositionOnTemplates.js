/**
 * у всех элементов калькулятора добавляем порядковый номер.
 * @param inputData
 * @returns {*[]}
 */
const initUpdatingPositionData = function (inputData) {
  const calculatorTemplatesWitchPositions = [];
  const templatesInExist = Boolean(inputData?.calculatorTemplates?.length);
  if (templatesInExist) {
    let templatesPositionIndex = 0;

    inputData.calculatorTemplates.forEach((item) => {
      let currentMainItem = item;
      const currentMainTemplateName = currentMainItem?.template;

      if (currentMainTemplateName === "UiBlockSection") {
        const { newItem, shiftIndex } = updatePositionElementsInBlockSection(
          currentMainItem,
          templatesPositionIndex
        );
        templatesPositionIndex = shiftIndex;
        calculatorTemplatesWitchPositions.push(newItem);
      } else if (
        currentMainTemplateName === "UiTab" ||
        currentMainTemplateName === "UiAccordion"
      ) {
        const { newItem, shiftIndex } = updatePositionElementsInTabAndAccordion(
          currentMainItem,
          templatesPositionIndex
        );
        currentMainItem = newItem;
        templatesPositionIndex = shiftIndex;
        calculatorTemplatesWitchPositions.push(currentMainItem);
      } else if (currentMainTemplateName === "UiDuplicator") {
        const currentDuplicatorItem = currentMainItem;
        const duplicatorTemplates = currentDuplicatorItem?.templates;
        const lengthDuplicatorTemplates = duplicatorTemplates?.length;
        const duplicatorTemplatesInExist = Boolean(lengthDuplicatorTemplates);
        if (duplicatorTemplatesInExist) {
          let currentPositionDuplicatorIndex = 0;
          const newDuplicatorTemplates = [];

          for (let r = 0; r < lengthDuplicatorTemplates; r++) {
            const duplicatorItemTemplateName = duplicatorTemplates[r].template;
            let newTemplate = duplicatorTemplates[r];

            if (duplicatorItemTemplateName === "UiBlockSection") {
              const { newItem, shiftIndex } =
                updatePositionElementsInBlockSection(
                  newTemplate,
                  currentPositionDuplicatorIndex
                );
              currentPositionDuplicatorIndex = shiftIndex;
              newTemplate = newItem;
            } else if (
              duplicatorItemTemplateName === "UiTab" ||
              duplicatorItemTemplateName === "UiAccordion"
            ) {
              const { newItem, shiftIndex } =
                updatePositionElementsInTabAndAccordion(
                  newTemplate,
                  currentPositionDuplicatorIndex
                );
              currentPositionDuplicatorIndex = shiftIndex;
              newTemplate = newItem;
            } else {
              const { newItem, shiftIndex } = updatePositionInBaseTemplates(
                newTemplate,
                currentPositionDuplicatorIndex
              );
              currentPositionDuplicatorIndex = shiftIndex;
              newTemplate = newItem;
            }
            newDuplicatorTemplates.push(newTemplate);
          }
          currentDuplicatorItem.templates = newDuplicatorTemplates;
          currentMainItem.position = templatesPositionIndex;
          templatesPositionIndex++;
          calculatorTemplatesWitchPositions.push(currentDuplicatorItem);
        }
      } else {
        const { newItem, newIndex } = updatePositionInBaseTemplates(
          currentMainItem,
          templatesPositionIndex
        );
        templatesPositionIndex = newIndex;
        calculatorTemplatesWitchPositions.push(newItem);
      }
    });
  }

  return calculatorTemplatesWitchPositions;
};

/**
 * Добавление позиций для элементов Блок-секции
 * @param item
 * @param index
 * @returns {{newItem: *, shiftIndex: *}|{newItem: {}, shiftIndex: *}}
 */
const updatePositionElementsInBlockSection = function (item, index) {
  const newItem = item;
  let shiftIndex = index;

  const isExistTemplates = Boolean(newItem?.templates?.length);
  if (!isExistTemplates) {
    return { newItem: {}, shiftIndex };
  }

  newItem.templates = newItem.templates
    .map((currentItem) => {
      if (typeof currentItem !== "object") {
        return false;
      }
      const { newItem, newIndex } = updatePositionInBaseTemplates(
        currentItem,
        shiftIndex
      );
      shiftIndex = newIndex;
      currentItem = newItem;
      return currentItem;
    })
    .filter((item) => item !== false);
  return { newItem, shiftIndex };
};

/**
 * Добавление позиций для шаблонов аккордеона и табов
 * @param currentItem
 * @param shiftIndex
 * @returns {{newItem: *, shiftIndex}}
 */
const updatePositionElementsInTabAndAccordion = function (
  currentItem,
  shiftIndex
) {
  const tabMainObject = currentItem;
  const tabsCount = tabMainObject?.items?.length;

  if (!Boolean(tabsCount)) {
    return { newItem: tabMainObject, shiftIndex };
  }

  for (let i = 0; i < tabsCount; i++) {
    const currentTab = tabMainObject?.items[i];
    const templatesInTab = currentTab?.templates;
    const countTemplatesInTab = templatesInTab?.length;
    const newTemplates = [];

    if (typeof currentTab !== "object" || !Boolean(countTemplatesInTab)) {
      i++;
      continue;
    }

    for (let q = 0; q < countTemplatesInTab; q++) {
      const currentTemplate = templatesInTab[q];
      if (typeof currentTemplate !== "object") {
        q++;
        continue;
      }
      const { newItem, newIndex } = updatePositionInBaseTemplates(
        currentTemplate,
        shiftIndex
      );
      shiftIndex = newIndex;
      newTemplates.push(newItem);
    }
    tabMainObject.items[i].templates = newTemplates;
  }

  return { newItem: tabMainObject, shiftIndex };
};

/**
 * Добавление позиций для базовых элементов
 * @param currentItem
 * @param shiftIndex
 * @returns {{newItem: *, newIndex: *}}
 */
const updatePositionInBaseTemplates = function (currentItem, shiftIndex) {
  let bufferIndex = shiftIndex;
  let bufferItem = currentItem;
  if (bufferItem.template === "UiColumns") {
    const { newItem, newIndex } = updatePositionElementsInColumns(
      bufferItem,
      bufferIndex
    );
    bufferIndex = newIndex;
    bufferItem = newItem;
  } else {
    bufferItem.position = shiftIndex;
    bufferIndex++;
  }

  return { newItem: bufferItem, newIndex: bufferIndex };
};

/**
 * Добавление позиций для элемента Колонки
 * @param currentColumnsObject
 * @param index
 * @returns {{newItem, newIndex: *}}
 */
const updatePositionElementsInColumns = function (currentColumnsObject, index) {
  let newIndex = index;
  const currentColumns = currentColumnsObject?.columns;
  const countColumns = currentColumns?.length;
  const newSetColumns = [];

  if (!Boolean(countColumns)) {
    return { newItem: currentColumnsObject, newIndex };
  }

  for (let i = 0; i < countColumns; i++) {
    let currentTemplatesInColumn = currentColumns[i]?.templates;
    const countTemplatesInColumn = currentTemplatesInColumn?.length;
    if (!Boolean(countTemplatesInColumn)) {
      currentColumns[i].templates = [];
    } else {
      currentTemplatesInColumn = currentTemplatesInColumn.map(
        (templateItem) => {
          templateItem.position = newIndex;
          newIndex++;
          return templateItem;
        }
      );
      currentColumns[i].templates = currentTemplatesInColumn;
    }
    newSetColumns.push(currentColumns[i]);
  }

  currentColumnsObject.columns = newSetColumns;
  return { newItem: currentColumnsObject, newIndex };
};

export { initUpdatingPositionData };
