import values from '../__Fixtures/values';
import tryCatch from '../__utils/tryCatch';
import isMacroable from '../../src/is/isMacroable';

const primitives = (items: unknown[]) => {
    return items.filter((value) => !value || (typeof value !== 'object' && typeof value !== 'function'));
};
const objects = (items: unknown[]) => {
    return items.filter((value) => value && (typeof value === 'object' || typeof value === 'function'));
};
const isModifiableObject = (value: unknown) => {
    return Object.isExtensible(value) && !Object.isSealed(value) && !Object.isFrozen(value);
};

const nativeFunctions = [
    Boolean,
    Number,
    BigInt,
    String,
    Array,
    Function,
    Object,
    Map,
    Set,
    WeakMap,
    WeakSet,
    Date,
    Promise,
];

describe('is:isMacroable', () => {
    it('works', () => {
        const value1 = { hey: 1 };
        const value2 = { hey: 2 };
        const value3 = { hey: 3 };

        expect(isMacroable(value1)).toEqual(true);
        expect(isMacroable(value2)).toEqual(true);
        expect(isMacroable(value3)).toEqual(true);

        Object.preventExtensions(value1);
        Object.seal(value2);
        Object.freeze(value3);

        expect(isMacroable(value1)).toEqual(false);
        expect(isMacroable(value2)).toEqual(false);
        expect(isMacroable(value3)).toEqual(false);
    });

    test('no primitives are "macroable" but all objects are "macroable"', () => {
        Object.entries(values).forEach(([, items]) => {
            primitives(items()).forEach((value) => {
                expect(isModifiableObject(value)).toEqual(false);

                if (value) {
                    expect(isMacroable(Object.getPrototypeOf(value))).toEqual(true);
                }

                expect(isMacroable(value)).toEqual(false);
            });
            objects(items()).forEach((value) => {
                expect(isModifiableObject(value)).toEqual(true);

                if (Object.getPrototypeOf(value)) {
                    expect(isMacroable(Object.getPrototypeOf(value))).toEqual(true);
                }

                expect(isMacroable(value)).toEqual(true);
            });
        });
    });

    test('no non extensible objects are "macroable"', () => {
        nativeFunctions.forEach((item) => {
            expect(!Object.isExtensible(item)).toEqual(false);
            expect(Object.isSealed(item)).toEqual(false);
            expect(Object.isFrozen(item)).toEqual(false);
        });

        Object.entries(values).forEach(([, items]) => {
            objects(items())
                .map((value) => tryCatch(() => Object.preventExtensions(value)))
                .filter(Boolean)
                .forEach((value) => {
                    expect(isMacroable(value)).toEqual(false);
                });
        });
    });

    test('no sealed objects are "macroable"', () => {
        nativeFunctions.forEach((item) => {
            expect(!Object.isExtensible(item)).toEqual(true);
            expect(Object.isSealed(item)).toEqual(false);
            expect(Object.isFrozen(item)).toEqual(false);
        });

        Object.entries(values).forEach(([, items]) => {
            objects(items())
                .map((value) => tryCatch(() => Object.seal(value)))
                .filter(Boolean)
                .forEach((value) => {
                    expect(isMacroable(value)).toEqual(false);
                });
        });
    });

    test('no frozen objects are "macroable"', () => {
        nativeFunctions.forEach((item) => {
            expect(!Object.isExtensible(item)).toEqual(true);
            expect(Object.isSealed(item)).toEqual(true);
        });

        Object.entries(values).forEach(([, items]) => {
            objects(items())
                .map((value) => tryCatch(() => Object.freeze(value)))
                .filter(Boolean)
                .forEach((value) => {
                    expect(isMacroable(value)).toEqual(false);
                });
        });
    });
});
