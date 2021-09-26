import { Macroed, PossiblyMacroedObject } from '../types';

/**
 * Determines whether the given value is "macroed".
 *
 * The term "macroed" is used to identify objects or
 * functions that have been extended using either the `macro()`
 * or the `mixin()` function.
 *
 * @example
 * ```js
 * import { isMacroed } from '@vicgutt/macrojs';
 *
 * const value = [];
 *
 * // Example 1
 *
 * mixin(Array, {});
 * mixin(value, {});
 *
 * isMacroed(Array); // false
 * isMacroed(Array.prototype); // false
 * isMacroed(value); // false
 *
 * // Example 2
 *
 * mixin(Array, { yolo: 'best word ever!' });
 *
 * isMacroed(Array); // false
 * isMacroed(Array.prototype); // true
 * isMacroed(value); // true
 *
 * // Example 3
 *
 * mixin(value, { yolo: 'best word ever!' });
 *
 * isMacroed(Array); // false
 * isMacroed(Array.prototype); // false
 * isMacroed(value); // true
 * ```
 */
export default function isMacroed(value: unknown): value is Macroed {
    return (value as PossiblyMacroedObject)?.__macros__?.constructor === Set;
}
