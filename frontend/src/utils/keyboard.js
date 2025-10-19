const KEY_TO_DIRECTION = Object.freeze({
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowUp: 'up',
});

const isTextInputElement = (element) => {
  if (!element) return false;
  if (element.isContentEditable) return true;
  const tagName = element.tagName;
  if (!tagName) return false;
  const normalized = tagName.toUpperCase();
  return normalized === 'INPUT' || normalized === 'TEXTAREA' || normalized === 'SELECT';
};

export const shouldIgnoreForGameControls = (element) => isTextInputElement(element);

export const extractMoveDirection = (event) => {
  if (!event) return null;

  let direction = KEY_TO_DIRECTION[event.key];
  if (!direction) {
    const { code, key } = event;
    if (code === 'Space' || key === ' ' || key === 'Spacebar') {
      direction = 'space';
    }
  }

  return direction || null;
};

export default {
  extractMoveDirection,
  shouldIgnoreForGameControls,
};
