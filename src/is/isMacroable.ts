import { Macroable } from '../types';

/**
 * Determines whether the given value is "macroable".
 *
 * The term "macroable" is used to identify objects or
 * functions that can be extended using the `macro()`
 * and `mixin()` functions.
 *
 * A value is considered "macroable" if:
 * - The value is NOT null
 * - The value is an object or a function
 * - The value's extension is NOT prevented _`(Object.isExtensible(value) === true)`_
 * - The value is NOT "sealed" _`(Object.isSealed(value) === false)`_
 * - The value is NOT "frozen" _`(Object.isFrozen(value) === false)`_
 *
 * @example
 * ```js
 * import { isMacroable } from '@vicgutt/macrojs';
 *
 * isMacroable(null); // false
 * isMacroable('hello'); // false
 * isMacroable(Object.seal({})); // false
 * isMacroable([]); // true
 * isMacroable({}); // true
 * isMacroable(Array); // true
 * isMacroable(() => {}); // true
 * isMacroable(document.querySelectorAll('body')); // true
 * ```
 */
export default function isMacroable(value: unknown): value is Macroable {
    if (!value || (typeof value !== 'object' && typeof value !== 'function')) {
        return false;
    }

    /**
     * No need to check for `Object.isFrozen(value)` here as
     * `Object.isSealed(value)` returns `true` for the results of
     * both `Object.seal(value)` and  `Object.freeze(value)`.
     */
    return !Object.isSealed(value) && Object.isExtensible(value);
}
