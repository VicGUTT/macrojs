import { AnyObject } from '../../src/types';

export default function equalObjects(object1: AnyObject, object2: AnyObject, logFailures = false): boolean {
    const keys = {
        object1: [...Object.getOwnPropertyNames(object1), ...Object.getOwnPropertySymbols(object1)],
        object2: [...Object.getOwnPropertyNames(object2), ...Object.getOwnPropertySymbols(object2)],
    };

    const check = (key: string | symbol, a: AnyObject, b: AnyObject) => {
        const result = _check(key, a, b);

        if (logFailures && result === false) {
            console.log('[equalObjects failed]: --> key, a, b | ', key, a, b);
        }

        return result;
    };

    return ![
        ...keys.object1.map((key) => check(key, object1, object2)),
        ...keys.object2.map((key) => check(key, object2, object1)),
    ].includes(false);
}

function _check(key: string | symbol, a: AnyObject, b: AnyObject) {
    const aDescriptor = Object.getOwnPropertyDescriptor(a, key);
    const bDescriptor = Object.getOwnPropertyDescriptor(b, key);

    if (typeof aDescriptor !== typeof bDescriptor) {
        return false;
    }

    if (typeof aDescriptor === 'undefined' || typeof bDescriptor === 'undefined') {
        return true;
    }

    const checkableValue = (value: unknown): unknown => {
        if ((typeof value !== 'object' && typeof value !== 'function') || value === null) {
            return value;
        }

        if (typeof value !== 'function') {
            value = () => value;
        }

        return (value as () => unknown).toString();
    };

    return (
        JSON.stringify(aDescriptor) === JSON.stringify(bDescriptor) &&
        aDescriptor.get?.toString?.() === bDescriptor.get?.toString?.() &&
        aDescriptor.set?.toString?.() === bDescriptor.set?.toString?.() &&
        checkableValue(aDescriptor.value) === checkableValue(bDescriptor.value) &&
        aDescriptor.writable === bDescriptor.writable &&
        aDescriptor.configurable === bDescriptor.configurable &&
        aDescriptor.enumerable === bDescriptor.enumerable
    );
}
