import { Macroabled } from '../types';
import isMacroedWith from './isMacroedWith';

/**
 * Determines whether the given value is "macroabled".
 *
 * The term "macroabled" is used to identify objects or
 * functions that have been extended using the `macroable()` function.
 * All "macroabled" values are both `macroable` and `macroed` values.
 *
 * A value is considered "macroabled" if:
 * - The value implements a `hasMacro` method, where the "target" is the value itself and that behaves exactly like the `isMacroedWith()` function.
 * - The value implements a `macro` method, where the "target" is the value itself and that behaves exactly like the `macro()` function.
 * - The value implements a `mixin` method, where the "target" is the value itself and that behaves exactly like the `mixin()` function.
 *
 * @example
 * ```js
 * import { isMacroabled } from '@vicgutt/macrojs';
 *
 * isMacroabled({ hasMacro() {}, macro() {}, mixin() {} }); // false
 * isMacroabled({ hasMacro: isMacroedWith, macro: macro, mixin: mixin }); // false
 * isMacroabled(macroable({})); // true
 * ```
 */
export default function isMacroabled<T>(value: unknown): value is Macroabled<T> {
    return (
        isMacroedWith(value, ['hasMacro', 'macro', 'mixin']) &&
        typeof (value as Macroabled<unknown>).hasMacro === 'function' &&
        typeof (value as Macroabled<unknown>).macro === 'function' &&
        typeof (value as Macroabled<unknown>).mixin === 'function'
    );
}
