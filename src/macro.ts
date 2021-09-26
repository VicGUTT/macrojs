import { MacroOptions } from './types';
import mixin from './mixin';

/**
 * Register a custom macro on a given target.
 *
 * A `macro` is simply the term used to define custom properties
 * and methods that should be copied/cloned over into a given target.
 *
 * A `macro` consist of a "name" _(the identifier)_ and a "value" _(the implementation)_.
 *
 * This function, also called `macro` allows us to register a custom property on a given target.
 *
 * It has the following signature:
 * - **target** (`unknown`): The object/function onto which the new property/method should be added.
 * - **propertyName** (`string`): The property/method name that should be registered onto the target.
 * - **propertyValue** (`unknown`): The property/method implementation that should be registered for the given name.
 * - **options** (`MacroOptions`):
 *    - **force** (`boolean` | defaults to `false`): Force replace existing properties and/or properties previously added via macro.
 *    - **onFunctionPrototype** (`boolean` | defaults to `true`): When the target is a function, should the new property be
 *                                                                added to the target's prototype or to the target directly,
 *                                                                essentially making it a static property.
 *
 * @example
 * ```js
 * import { macro } from '@vicgutt/macrojs';
 *
 * const target = [];
 *
 * macro(target, 'hello', () => 'hello!');
 *
 * target.hello(); // 'hello!'
 *
 * macro(target, 'isEmpty', function () {
 *     return this.length === 0;
 * });
 *
 * target.isEmpty(); // true
 * ```
 */
export default function macro(
    target: unknown,
    propertyName: string,
    propertyValue: unknown,
    options: MacroOptions = {}
): void {
    mixin(target, { [propertyName]: propertyValue }, null, options);
}
