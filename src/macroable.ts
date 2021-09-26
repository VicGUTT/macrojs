import { MacroCallback, MacroOptions, MacroabledProperties, Macroabled, AssignedPropertyKey } from './types';
import isMacroedWith from './is/isMacroedWith';
import _macro from './macro';
import _mixin from './mixin';

/**
 * Make an object/function "macroable".
 *
 * A "macroable"d object or function is an object/function that implements
 * the following methods:
 * - **hasMacro**: behaves exactly like the `isMacroedWith()` function, and where the "target" is the object/function itself.
 * - **macro**: behaves exactly like the `macro()` function, and where the "target" is the object/function itself.
 * - **mixin**: behaves exactly like the `mixin()` function, and where the "target" is the object/function itself.
 *
 * @example
 * ```js
 * import { macroable } from '@vicgutt/macrojs';
 *
 * class Week {}
 *
 * macroable(Week);
 *
 * Week.prototype.macro('totalDays', 7);
 * Week.prototype.mixin({
 *     days: ['monday', '...'],
 *     firstDay(country, _default = 'monday') {
 *         if (country === 'US') {
 *             return 'sunday';
 *         }
 *
 *         if (country === 'FR') {
 *             return 'monday';
 *         }
 *
 *         return _default;
 *     },
 * });
 *
 * Week.prototype.hasMacro('totalDays'); // true
 * Week.prototype.hasMacro('days'); // true
 * Week.prototype.hasMacro('firstDay'); // true
 * Week.prototype.hasMacro('nope'); // false
 *
 * Week.prototype.firstDay('FR'); // 'monday'
 * new Week().firstDay('FR'); // 'monday'
 * ```
 */
export default function macroable<T>(
    target: T,
    callback: MacroCallback<T, Omit<MacroabledProperties, '__macros__'>> = null,
    options: MacroOptions = {}
): T & Macroabled<T> {
    _mixin(
        target,
        {
            hasMacro,
            macro,
            mixin,
        },
        callback,
        options
    );

    return target as T & Macroabled<T>;
}

function hasMacro(this: unknown, names: AssignedPropertyKey | AssignedPropertyKey[]): boolean {
    return isMacroedWith(this, names);
}

function macro(this: unknown, propertyName: string, propertyValue: unknown, options: MacroOptions = {}): void {
    _macro(this, propertyName, propertyValue, options);
}

function mixin<T, P>(this: T, properties: P, callback: MacroCallback<T, P> = null, options: MacroOptions = {}): void {
    _mixin(this, properties, callback, options);
}
