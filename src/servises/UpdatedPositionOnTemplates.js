/**
 *
 * @param item
 * @param index
 * @returns {{newItem: Object, shiftIndex: Number}}
 */
const updatePositionElementsInBiSection = function(item, index) {
  let newItem = item;
  let shiftIndex = index;
  if (newItem.leftSide?.length) {
    newItem.leftSide = newItem?.leftSide?.map((itemLeft) => {
      if (typeof itemLeft === "object") {
        itemLeft.position = shiftIndex;
        shiftIndex++;
        return itemLeft;
      } else {
        shiftIndex++;
        return itemLeft;
      }
    });
  }
  if (newItem.rightSide?.length) {
    newItem.rightSide = newItem?.rightSide?.map((itemRight) => {
      if (typeof itemRight === "object") {
        itemRight.position = shiftIndex;
        shiftIndex++;
        return itemRight;
      } else {
        shiftIndex++;
        return itemRight;
      }
    });
  }
  return { newItem, shiftIndex };
}

const updatePositionElementsInTabAndAccordion = function(currentItem, shiftIndex) {
  let newItem = currentItem;
  const itemsLength = newItem?.items.length;
  for (let i = 0; i < itemsLength; i++) {
    if (typeof newItem?.items[i] === "object") {
      let currentTemplates = newItem?.items[i].templates;
      let currentTempLength = currentTemplates?.length;
      let newTemplates = [];
      if (currentTempLength) {
        for (let q = 0; q < currentTempLength; q++) {
          if (typeof currentTemplates[q] === "object") {
            currentTemplates[q].position = shiftIndex;
            shiftIndex++;
            newTemplates.push(currentTemplates[q]);
          }
        }
      }
      newItem.items[i].templates = newTemplates;
    }
  }
  return {newItem, shiftIndex};
}






export {
  updatePositionElementsInBiSection,
  updatePositionElementsInTabAndAccordion
}
