import {
    MacroOptions,
    MacroProperties,
    MacroCallback,
    Macroed,
    Macroable,
    AssignedPropertyKey,
    AssignCallback,
} from './types';
import isMacroable from './is/isMacroable';
import isMacroed from './is/isMacroed';
import isMacroedWith from './is/isMacroedWith';
import assign from './utils/assign';
import {
    DEFAULT_FUNCTION_PROTOTYPE_PROPERTIES,
    DEFAULT_FUNCTION_STATIC_PROPERTIES,
} from './constants/functionDefaultProperties';

const defaultOptions: MacroOptions = {
    force: false,
    onFunctionPrototype: true,
};

/**
 * Register a collection of macros on a given target.
 *
 * This function, as opposed to the `macro()` function, allows us
 * to register multiple properties/methods at once on a given target.
 *
 * It has the following signature:
 * - **target** (`unknown`): The object/function onto which the new properties/methods should be added.
 * - **properties** (`object`|`function`):
 *    - If an object, the keys will be used for the property name and it's value for the property's implementation.
 *    - If a function, all it's static and prototype enumerable own properties will be copied over onto the target.
 * - **callback** (`function` | `null`): A function, when present, gives us full control over how we'd like the copying to proceed.
 * - **options** (`MacroOptions`):
 *    - **force** (`boolean` | defaults to `false`): Force replace existing properties and/or properties previously added via macro.
 *    - **onFunctionPrototype** (`boolean` | defaults to `true`): When the target is a function, should the new property be
 *                                                                added to the target's prototype or to the target directly,
 *                                                                essentially making it a static property.
 *
 * @example
 * ```js
 * import { mixin } from '@vicgutt/macrojs';
 *
 * const target = [];
 *
 * mixin(target, {
 *     hello: () => 'hello!',
 *     isEmpty() {
 *         return this.length === 0;
 *     },
 * });
 *
 * target.hello(); // 'hello!'
 * target.isEmpty(); // true
 *
 * mixin(
 *     { name: 'Bob', age: NaN },
 *     {
 *         isHuman: '🤔',
 *         isTroubleMaker: '👀',
 *     },
 *     (propertyKey, target, properties, options) => {
 *         console.log(propertyKey, target, properties, options);
 *     }
 * );
 *
 * // isHuman { name: 'Bob', age: NaN } { isHuman: '🤔', isTroubleMaker: '👀' } { force: false, onFunctionPrototype: true }
 * // isTroubleMaker { name: 'Bob', age: NaN } { isHuman: '🤔', isTroubleMaker: '👀' } { force: false, onFunctionPrototype: true }
 * ```
 */
export default function mixin<T, P extends MacroProperties>(
    target: T,
    properties: P,
    callback: MacroCallback<T, P> = null,
    options: MacroOptions = {}
): void {
    options = { ...defaultOptions, ...(options || {}) };

    if (!properties || !['object', 'function'].includes(typeof properties) || Array.isArray(properties)) {
        return;
    }

    if (typeof properties === 'function') {
        handleFunctionProperties(target, properties, callback, options);
    } else {
        handleObjectProperties(target, properties, callback, options);
    }
}

function handleFunctionProperties<T, P extends Function>( // eslint-disable-line @typescript-eslint/ban-types
    target: T | Macroable,
    properties: P,
    callback: MacroCallback<T, P>,
    options: MacroOptions
): void {
    const props = {
        static: properties,
        proto: properties.prototype ?? {},
    };

    if (callback) {
        [
            ...Object.getOwnPropertyNames(props.static),
            ...Object.getOwnPropertySymbols(props.static),
            ...Object.getOwnPropertyNames(props.proto),
            ...Object.getOwnPropertySymbols(props.proto),
        ].forEach((name) => {
            callback(name, target, properties, options);
        });

        return;
    }

    if (!isMacroable(target)) {
        return;
    }

    const assignedStaticPropKeys: AssignedPropertyKey[] = [];
    const assignedProtoPropKeys: AssignedPropertyKey[] = [];

    assign(
        target,
        props.static,
        assignCallback(target, options, assignedStaticPropKeys, DEFAULT_FUNCTION_STATIC_PROPERTIES)
    );
    markAsMacroed(target, assignedStaticPropKeys);

    if (typeof target === 'function' && isMacroable(target.prototype)) {
        target = target.prototype;
    }

    assign(
        target,
        props.proto,
        assignCallback(target, options, assignedProtoPropKeys, DEFAULT_FUNCTION_PROTOTYPE_PROPERTIES)
    );
    markAsMacroed(target, assignedProtoPropKeys);
}

function handleObjectProperties<T, P extends MacroProperties>(
    target: T | Macroable,
    properties: P,
    callback: MacroCallback<T, P>,
    options: MacroOptions
): void {
    if (callback) {
        [...Object.getOwnPropertyNames(properties), ...Object.getOwnPropertySymbols(properties)].forEach((name) => {
            callback(name, target, properties, options);
        });

        return;
    }

    if (typeof target === 'function' && options.onFunctionPrototype && isMacroable(target.prototype)) {
        target = target.prototype;
    }

    if (!isMacroable(target)) {
        return;
    }

    const assignedPropKeys: AssignedPropertyKey[] = [];

    assign(target, properties, assignCallback(target, options, assignedPropKeys));
    markAsMacroed(target, assignedPropKeys);
}

function assignCallback(
    target: Macroable,
    options: MacroOptions,
    assignedPropKeys: AssignedPropertyKey[],
    excludeList: string[] = []
): AssignCallback {
    return (name) => {
        if (excludeList.includes(name as string)) {
            return false;
        }

        if (!options.force && (name in target || isMacroedWith(target, name))) {
            return false;
        }

        assignedPropKeys.push(name);

        return;
    };
}

function markAsMacroed(target: Macroable, assignedPropKeys: AssignedPropertyKey[]) {
    if (assignedPropKeys.length && !isMacroed(target)) {
        Object.defineProperty(target, '__macros__', {
            value: new Set(),
            writable: false,
            enumerable: false,
            configurable: false,
        });
    }

    assignedPropKeys.forEach((key) => {
        (target as unknown as Macroed).__macros__.add(key as string);
    });
}
