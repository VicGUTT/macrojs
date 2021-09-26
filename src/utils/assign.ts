import { AssignCallback, AssignedDescriptors } from '../types';

/**
 * The `assign()` function copies all enumerable own properties from one source
 * object to a target object. It returns the modified target object.
 *
 * Properties in the target object are overwritten by properties in the source
 * if they have the same key. Later source's properties overwrite earlier ones.
 *
 * This function intends to work similarly but NOT identically to the native
 * `Object.assign()` method.
 *
 * They differ in that this function does NOT invoke getters and setters but rather
 * copy their definition _(just like any other property)_ to the target object by
 * using `Object.getOwnPropertyDescriptor()` and `Object.defineProperties()`.
 *
 * This function accepts a callback as 3rd argument.
 * If the callback returns`false`, the ongoing copying task will be interrupted but
 * previously copied properties will remain.
 *
 * **Note**
 * - Both String and Symbol properties are copied.
 * - This function will throw on a non object target and on a `null` or `undefined` source.
 * - Properties on the prototype chain and non-enumerable properties cannot be copied.
 * - Functions and their prototype can be used as target and/or source.
 * - If the source value is a reference to an object, it only copies the reference _(unsuitable for "deep cloning")_.
 *
 * @example
 * ```js
 * import { assign } from '@vicgutt/macrojs';
 *
 * const source = { name: 'Bob', age: 77 };
 *
 * assign({}, source); // { name: 'Bob', age: 77 }
 * assign({}, source, () => {}); // { name: 'Bob', age: 77 }
 * assign({}, source, (propertyKey) => {
 *     if (propertyKey === 'age') {
 *         return false;
 *     }
 * }); // { name: 'Bob' }
 *
 * assign({}, source, (propertyKey, propertydescriptor, assignedDescriptors, index, propertyKeys) => {
 *     assignedDescriptors[`--${String(propertyKey)}`] = {
 *         value: `${index} | ${String(propertyKey)} | ${propertyKeys}`,
 *         configurable: true,
 *         enumerable: propertyKey === 'name',
 *         writable: true,
 *     };
 * }); // { '--name': '0 | name | name,age', name: 'Bob', age: 77 }
 * ```
 */
export default function assign<T, S>(target: T, source: S, callback: AssignCallback = null): T & S {
    const keys = [...Object.getOwnPropertyNames(source), ...Object.getOwnPropertySymbols(source)];

    const descriptors = keys.reduce((descriptors, key, index, array) => {
        const descriptor = Object.getOwnPropertyDescriptor(source, key);

        if (callback && callback(key, descriptor, descriptors, index, array) === false) {
            return descriptors;
        }

        // if (typeof key === 'symbol' && !descriptor?.enumerable) {
        //     return descriptors;
        // }

        /*
         * The `descriptor` will always be defined so there's no point in checking
         * otherwise.
         */
        // if (descriptor) {...}
        descriptors[key] = descriptor as PropertyDescriptor;

        return descriptors;
    }, {} as AssignedDescriptors);

    Object.defineProperties(target, descriptors);

    return target as T & S;
}

/*
 * Solution inpired by these articles:
 * https://calebporzio.com/equivalent-of-php-class-traits-in-javascript
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign#copying_accessors
 */
