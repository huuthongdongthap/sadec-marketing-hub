/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DOM UTILITIES - DEPRECATED
 *
 * Re-exported from shared/dom-utils.js for backward compatibility
 *
 * @deprecated Use `import { $, $$, createElement } from '../shared/dom-utils.js'`
 * ═══════════════════════════════════════════════════════════════════════════
 */

// Re-export all from consolidated source
export {
  $,
  $$,
  on,
  off,
  delegate,
  createElement,
  toggleClass,
  addClass,
  removeClass,
  hasClass,
  closest,
  matches,
  ready,
  waitForElement,
  remove,
  empty,
  show,
  hide,
  isVisible,
  getOffset,
  scrollIntoView,
  setAttributes,
  getData,
  setData,
  dom
} from '../shared/dom-utils.js';

// Legacy alias for backward compatibility
export const removeElement = remove;
