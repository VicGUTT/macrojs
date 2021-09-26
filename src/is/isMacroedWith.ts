import { AssignedPropertyKey } from '../types';
import isMacroed from '../is/isMacroed';

/**
 * Determines whether the given value has been "macroed"
 * with a set of given properties.
 *
 * @example
 * ```js
 * import { isMacroedWith } from '@vicgutt/macrojs';
 *
 * const value = [];
 *
 * macro(value, 'prop1', 'value1');
 * mixin(value, {
 *    prop2: 'value2',
 *    prop3: 'value3',
 * });
 *
 * isMacroedWith(value, 'prop1'); // true
 * isMacroedWith(value, ['prop1', 'prop2']); // true
 * isMacroedWith(value, ['prop1', 'prop2', 'prop3']); // true
 * isMacroedWith(value, ['prop1', 'prop2', 'prop3', 'prop4']); // false
 * isMacroedWith(value, 'prop'); // false
 * ```
 */
export default function isMacroedWith(value: unknown, names: AssignedPropertyKey | AssignedPropertyKey[]): boolean {
    if (!Array.isArray(names)) {
        names = [names];
    }

    return isMacroed(value) && names.every((name) => value.__macros__.has(name as string));
}
