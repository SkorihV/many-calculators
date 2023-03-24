/**
 * Добавление позиций для элементов Блок-секции
 * @param item
 * @param index
 * @returns {{newItem: *, shiftIndex: *}|{newItem: {}, shiftIndex: *}}
 */
const updatePositionElementsInBlockSection = function (item, index){
  const newItem = item;
  let shiftIndex = index;

  const isExistTemplates = Boolean(newItem?.templates?.length);
  if (!isExistTemplates) {
    return { newItem: {}, shiftIndex };
  }

  newItem.templates = newItem.templates.map((currentItem) => {
    if (typeof currentItem !== "object") {
      return false
    }
    const {newItem, newIndex} = updatePositionInBaseTemplates(currentItem, shiftIndex)
    shiftIndex = newIndex;
    currentItem = newItem;
    return currentItem;
  }).filter(item => item !== false);
  return { newItem, shiftIndex };
}

/**
 * Добавление позиций для шаблонов аккордеона и табов
 * @param currentItem
 * @param shiftIndex
 * @returns {{newItem: *, shiftIndex}}
 */
const updatePositionElementsInTabAndAccordion = function(currentItem, shiftIndex) {
  const tabMainObject = currentItem;
  const tabsCount = tabMainObject?.items?.length;

  if (!Boolean(tabsCount)) {
    return {newItem: tabMainObject, shiftIndex};
  }

  for (let i = 0; i < tabsCount; i++) {
    const currentTab = tabMainObject?.items[i];
    const templatesInTab = currentTab?.templates;
    const countTemplatesInTab = templatesInTab?.length;
    const newTemplates = [];

    if (typeof currentTab !== "object" || !Boolean(countTemplatesInTab)) {
      i++
      continue;
    }

    for (let q = 0; q < countTemplatesInTab; q++) {
      const currentTemplate = templatesInTab[q]
      if (typeof currentTemplate !== "object") {
        q++;
        continue;
      }
      const {newItem, newIndex} = updatePositionInBaseTemplates(currentTemplate, shiftIndex)
      shiftIndex = newIndex;
      newTemplates.push(newItem);
    }
    tabMainObject.items[i].templates = newTemplates;
  }

  return {newItem: tabMainObject, shiftIndex};
}

/**
 * Добавление позиций для базовых элементов
 * @param currentItem
 * @param shiftIndex
 * @returns {{newItem: *, newIndex: *}}
 */
const updatePositionInBaseTemplates = function(currentItem, shiftIndex) {
  let bufferIndex = shiftIndex;
  let bufferItem = currentItem;
  if (bufferItem.template === "UiColumns") {
    const {newItem, newIndex} = updatePositionElementsInColumns(bufferItem, bufferIndex)
    bufferIndex = newIndex;
    bufferItem = newItem;
  } else {
    bufferItem.position = shiftIndex;
    bufferIndex++;
  }
  return {newItem: bufferItem, newIndex: bufferIndex}
}

/**
 * Добавление позиций для элемента Колонки
 * @param currentColumnsObject
 * @param index
 * @returns {{newItem, newIndex: *}}
 */
const updatePositionElementsInColumns = function(currentColumnsObject, index) {
  let newIndex = index;
  const currentColumns = currentColumnsObject?.columns;
  const countColumns = currentColumns?.length;
  const newSetColumns = [];

  if (!Boolean(countColumns)) {
    return {newItem: currentColumnsObject, newIndex};
  }

  for (let i = 0; i < countColumns; i++) {
    let currentTemplatesInColumn = currentColumns[i]?.templates;
    const countTemplatesInColumn = currentTemplatesInColumn?.length;
    if (!Boolean(countTemplatesInColumn)) {
      i++
      continue;
    }
    currentTemplatesInColumn = currentTemplatesInColumn.map(templateItem => {
      templateItem.position = newIndex;
      newIndex++;
      return templateItem;
    })
    currentColumns[i].templates = currentTemplatesInColumn;
    newSetColumns.push(currentColumns[i]);
  }

  currentColumnsObject.columns = newSetColumns;
  return {newItem: currentColumnsObject, newIndex};
}


export {
  updatePositionElementsInBlockSection,
  updatePositionElementsInTabAndAccordion,
  updatePositionInBaseTemplates
}
