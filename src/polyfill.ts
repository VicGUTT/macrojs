import { UnknownObject, PolyfillObject } from './types';
import mixin from './mixin';

/**
 * Register a collection of macros on a given target based on a defined condition.
 *
 * It has the following signature:
 * - **target** (`unknown`): The object/function onto which the new properties/methods should be added.
 * - **objects** (`PolyfillObject` | `PolyfillObject[]`):
 *    - **property** (`string`): The property/method name that should be registered onto the target.
 *    - **needed** (`boolean`): Determines if the polyfill is needed. If `falsy`, the property/method will be discarded.
 *    - **implemention** (`unknown`): The property/method implementation that should be registered for the given name.
 *
 * @example
 * ```js
 * import { polyfill } from '@vicgutt/macrojs';
 *
 * polyfill(Array.prototype, [
 *     {
 *         property: 'at',
 *         needed: !('at' in Array.prototype),
 *         implemention() {
 *             //
 *         },
 *     },
 *     {
 *         property: 'isEmpty',
 *         needed: !('isEmpty' in Array.prototype),
 *         implemention() {
 *             return this.length === 0;
 *         },
 *     },
 *     {
 *         property: 'isNotEmpty',
 *         needed: !('isNotEmpty' in Array.prototype),
 *         implemention() {
 *             return !this.isEmpty();
 *         },
 *     },
 *     {
 *         property: 'push',
 *         needed: true, // will overwrite the existing method
 *         implemention() {
 *             return 'hijacked 😱';
 *         },
 *     },
 * ]);
 *
 * [].isEmpty(); // true
 * [].isNotEmpty(); // false
 * [].push(123); // 'hijacked 😱'
 * ['hey'].at(0); // 'hey'
 * ['hey'].at(-1); // 'hey'
 * ['hey'].at(1); // undefined
 * ```
 */
export default function polyfill(target: unknown, objects: PolyfillObject | PolyfillObject[]): void {
    const mapped = (Array.isArray(objects) ? objects : [objects]).reduce((acc, item): UnknownObject => {
        const descriptor = Object.getOwnPropertyDescriptor(item, 'implemention');

        if (!item.needed || !descriptor) {
            return acc;
        }

        Object.defineProperty(acc, item.property, descriptor);

        return acc;
    }, {} as UnknownObject);

    mixin(target, mapped, null, { force: true });
}
