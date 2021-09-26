import mixin from '../src/mixin';
import macro from '../src/macro';
import { makeDummyClass, makeDummyObject, SELF } from './__Fixtures/objects';
import values from './__Fixtures/values';
import equalObjects from './__utils/equalObjects';
import equalDummyObjects from './__utils/equalDummyObjects';
import getOwnPropertyKeys from './__utils/getOwnPropertyKeys';
import getFunctionOwnPropertyKeys from './__utils/getFunctionOwnPropertyKeys';
import assignProperty from './__utils/assignProperty';
import { AnyFunction, AssignCallback, Macroed } from '../src/types';
import functionToObject from './__utils/functionToObject';
import {
    DEFAULT_FUNCTION_PROTOTYPE_PROPERTIES,
    DEFAULT_FUNCTION_STATIC_PROPERTIES,
} from '../src/constants/functionDefaultProperties';
import isMacroable from '../src/is/isMacroable';
import isMacroed from '../src/is/isMacroed';

const props = {
    onPrototypeBefore: ['constructor', 'ooh', 'level', 'yeah'],
    onPrototypeAfter: ['constructor', 'ooh', 'level', 'yeah', 'hi', 'sup', '__macros__'],
    onPrototypeAfter2: ['constructor', 'ooh', 'level', 'yeah', 'hola', 'age', 'length', '__macros__'],
};

const makeDummy2Class = () => {
    return class Dummy2 {
        hola() {
            return 'hola';
        }
        get age() {
            return 99;
        }
        get length() {
            return 777;
        }
    };
};
const randomTruthy = () => Math.random() < 0.5;
const isSpecialNativeFunction = (value: unknown) => {
    return (
        value === Object ||
        value === Function ||
        value === String ||
        value === Number ||
        value === Boolean ||
        value instanceof String ||
        value instanceof Number ||
        value instanceof Boolean
    );
};

describe('mixin', () => {
    it('can mix in properties from an object', () => {
        const Dummy = makeDummyClass();

        expect(Object.getOwnPropertyNames(Dummy.prototype)).toEqual(props.onPrototypeBefore);
        // @ts-expect-error shush
        expect(Dummy.prototype.__macros__).toEqual(undefined);

        mixin(Dummy, {
            hi: () => 'hi',
            sup() {
                return 'sup';
            },
        });

        expect(Object.getOwnPropertyNames(Dummy.prototype)).toEqual(props.onPrototypeAfter);
        // @ts-expect-error shush
        expect(Dummy.prototype.__macros__).toEqual(new Set(['hi', 'sup']));

        // @ts-expect-error shush
        expect(Dummy.prototype.hi()).toEqual('hi');
        // @ts-expect-error shush
        expect(new Dummy().hi()).toEqual('hi');
        // @ts-expect-error shush
        expect(Dummy.prototype.sup()).toEqual('sup');
        // @ts-expect-error shush
        expect(new Dummy().sup()).toEqual('sup');

        mixin(Dummy, {
            yolo: {
                abc: () => 'abc',
                get ohlala() {
                    // @ts-expect-error shush
                    if (this.called) {
                        return 'called!';
                    }

                    // @ts-expect-error shush
                    this.called = true;

                    return 'ohlala';
                },
            },
        });

        // @ts-expect-error shush
        expect(new Dummy().__macros__).toEqual(new Set(['hi', 'sup', 'yolo']));
        // @ts-expect-error shush
        expect(new Dummy().yolo.abc()).toEqual('abc');
        // @ts-expect-error shush
        expect(new Dummy().yolo.ohlala).toEqual('ohlala');
        // @ts-expect-error shush
        expect(new Dummy().yolo.ohlala).toEqual('called!');

        expect(Dummy.prototype.yeah).toEqual('yeah');
        expect(Dummy.prototype.yeah).toEqual('called!');

        expect(+new Dummy()).toEqual(42);
        expect(`${new Dummy()}`).toEqual('---');
        expect(new Dummy() + '').toEqual('🤷‍♂️');
    });

    it('can mix in properties from a function/class', () => {
        const Dummy = makeDummyClass();
        const Dummy2 = makeDummy2Class();

        expect(Object.getOwnPropertyNames(Dummy.prototype)).toEqual(props.onPrototypeBefore);
        // @ts-expect-error shush
        expect(Dummy.prototype.__macros__).toEqual(undefined);

        mixin(Dummy, Dummy2);

        expect(Object.getOwnPropertyNames(Dummy.prototype)).toEqual(props.onPrototypeAfter2);

        // @ts-expect-error shush
        expect(Dummy.prototype.__macros__).toEqual(new Set(['hola', 'age', 'length']));

        // @ts-expect-error shush
        expect(Dummy.prototype.hola()).toEqual('hola');
        // @ts-expect-error shush
        expect(new Dummy().hola()).toEqual('hola');
        // @ts-expect-error shush
        expect(Dummy.prototype.age).toEqual(99);
        // @ts-expect-error shush
        expect(new Dummy().age).toEqual(99);
        // @ts-expect-error shush
        expect(Dummy.prototype.length).toEqual(777);
        // @ts-expect-error shush
        expect(new Dummy().length).toEqual(777);

        expect(+Dummy.prototype).toEqual(42);
        expect(`${Dummy.prototype}`).toEqual('---');
        expect(Dummy.prototype + '').toEqual('🤷‍♂️');

        /**
         * Directly passing in the source's (Dummy2Bis) prototype instead of the full object
         */

        const DummyBis = makeDummyClass();
        const Dummy2Bis = makeDummy2Class();

        expect(Object.getOwnPropertyNames(DummyBis.prototype)).toEqual(props.onPrototypeBefore);
        // @ts-expect-error shush
        expect(DummyBis.prototype.__macros__).toEqual(undefined);

        mixin(DummyBis, Dummy2Bis.prototype);

        expect(Object.getOwnPropertyNames(DummyBis.prototype)).toEqual(props.onPrototypeAfter2);

        // @ts-expect-error shush
        expect(Dummy.prototype.__macros__).toEqual(new Set(['hola', 'age', 'length']));

        // @ts-expect-error shush
        expect(Dummy.prototype.hola()).toEqual('hola');
        // @ts-expect-error shush
        expect(new Dummy().hola()).toEqual('hola');
        // @ts-expect-error shush
        expect(Dummy.prototype.age).toEqual(99);
        // @ts-expect-error shush
        expect(new Dummy().age).toEqual(99);
        // @ts-expect-error shush
        expect(Dummy.prototype.length).toEqual(777);
        // @ts-expect-error shush
        expect(new Dummy().length).toEqual(777);

        expect(+Dummy.prototype).toEqual(42);
        expect(`${Dummy.prototype}`).toEqual('---');
        expect(Dummy.prototype + '').toEqual('🤷‍♂️');

        /**
         * Ensuring "getters" are correctly set and not "called" when defining the property on the target object
         */

        mixin(
            Dummy,
            class Yolo {
                abc = () => 'abc';
                get ohlala() {
                    // @ts-expect-error shush
                    if (this.called) {
                        return 'called!';
                    }

                    // @ts-expect-error shush
                    this.called = true;

                    return 'ohlala';
                }
            }
        );

        // @ts-expect-error shush
        expect(new Dummy().__macros__).toEqual(new Set(['hola', 'age', 'length', 'ohlala']));
        // @ts-expect-error shush
        expect(Dummy.abc).toEqual(undefined);

        const instance = new Dummy();

        // @ts-expect-error shush
        expect(instance.abc).toEqual(undefined);
        // @ts-expect-error shush
        expect(instance.ohlala).toEqual('ohlala');
        // @ts-expect-error shush
        expect(instance.ohlala).toEqual('called!');

        expect(+instance).toEqual(42);
        expect(`${instance}`).toEqual('---');
        expect(instance + '').toEqual('🤷‍♂️');
    });

    test('the `mixin` function can make use of a callback as a 3rd parameter', () => {
        [makeDummyClass(), makeDummyObject()].forEach((Dummy) => {
            class Dummy2 {}

            const isFunction = typeof Dummy === 'function';
            const keys = isFunction ? getFunctionOwnPropertyKeys(Dummy) : getOwnPropertyKeys(Dummy);

            expect(Object.getOwnPropertyNames(Dummy2.prototype)).toEqual(['constructor']);
            // @ts-expect-error shush
            expect(Dummy2.prototype.__macros__).toEqual(undefined);

            let i = 0;

            mixin(
                Dummy2,
                Dummy,
                (name, self, mixin, options) => {
                    expect(keys.includes(name)).toEqual(true);
                    expect(self).toEqual(Dummy2);
                    expect(mixin).toEqual(Dummy);
                    expect(options).toEqual({ force: true, onFunctionPrototype: true, yolo: 'yolo' });

                    expect(keys[i]).toEqual(name);

                    i++;
                },
                // @ts-expect-error shush
                { force: true, onFunctionPrototype: true, yolo: 'yolo' }
            );

            expect(i > 0).toEqual(true);
            expect(i).toEqual(keys.length);

            expect(Object.getOwnPropertyNames(Dummy2.prototype)).toEqual(['constructor']);
            // @ts-expect-error shush
            expect(Dummy2.prototype.__macros__).toEqual(undefined);

            mixin(Dummy2, Dummy, (name, self) => {
                self.prototype.yo = 'ho';

                if (name === 'ooh') {
                    self.prototype[name] = isFunction ? Dummy.prototype[name] : Dummy[name];
                }
            });

            expect(Object.getOwnPropertyNames(Dummy2.prototype)).toEqual(['constructor', 'yo', 'ooh']);
            // @ts-expect-error shush
            expect(Dummy2.prototype.__macros__).toEqual(undefined);

            // @ts-expect-error shush
            expect(Dummy2.prototype.yo).toEqual('ho');
            // @ts-expect-error shush
            expect(Dummy2.prototype.ooh()).toEqual('ooh');
            // @ts-expect-error shush
            expect(new Dummy2().yo).toEqual('ho');
            // @ts-expect-error shush
            expect(new Dummy2().ooh()).toEqual('ooh');

            macro(Dummy, 'last', () => 'last');

            mixin(Dummy2, Dummy, (name, self, mixin) => {
                if (name === 'last') {
                    // @ts-expect-error shush
                    macro(self, name, isFunction ? mixin.prototype[name] : mixin[name]);
                }
            });

            expect(Object.getOwnPropertyNames(Dummy2.prototype)).toEqual([
                'constructor',
                'yo',
                'ooh',
                'last',
                '__macros__',
            ]);
            // @ts-expect-error shush
            expect(Dummy2.prototype.__macros__).toEqual(new Set(['last']));

            // @ts-expect-error shush
            expect(Dummy2.prototype.last()).toEqual('last');
            // @ts-expect-error shush
            expect(new Dummy2().last()).toEqual('last');
        });
    });

    it('can force replace existing properties', () => {
        const Dummy = makeDummyClass();

        expect(Object.getOwnPropertyNames(Dummy.prototype)).toEqual(props.onPrototypeBefore);
        // @ts-expect-error shush
        expect(Dummy.prototype.__macros__).toEqual(undefined);

        mixin(Dummy, {
            hi: () => 'hi',
        });

        // @ts-expect-error shush
        expect(Dummy.prototype.__macros__).toEqual(new Set(['hi']));
        // @ts-expect-error shush
        expect(new Dummy().hi()).toEqual('hi');

        mixin(Dummy, {
            hi: () => 'Get out of my face!',
        });

        // @ts-expect-error shush
        expect(Dummy.prototype.__macros__).toEqual(new Set(['hi']));
        // @ts-expect-error shush
        expect(new Dummy().hi()).toEqual('hi');

        mixin(
            Dummy,
            {
                hi: () => 'Get out of my face!',
            },
            null,
            { force: true }
        );

        // @ts-expect-error shush
        expect(Dummy.prototype.__macros__).toEqual(new Set(['hi']));
        // @ts-expect-error shush
        expect(new Dummy().hi()).toEqual('Get out of my face!');
    });

    it("can add new static properties to a class/function (instead of it's prototype)", () => {
        const Dummy = makeDummyClass();

        // @ts-expect-error shush
        expect(Dummy.prototype.__macros__).toEqual(undefined);
        // @ts-expect-error shush
        expect(Dummy.__macros__).toEqual(undefined);

        mixin(Dummy, {
            yo: () => 'yo',
        });

        // @ts-expect-error shush
        expect(Dummy.prototype.__macros__).toEqual(new Set(['yo']));
        // @ts-expect-error shush
        expect(Dummy.__macros__).toEqual(undefined);

        mixin(
            Dummy,
            {
                yoo: () => 'yoo',
            },
            null,
            // @ts-expect-error shush
            null
        );

        // @ts-expect-error shush
        expect(Dummy.prototype.__macros__).toEqual(new Set(['yo', 'yoo']));
        // @ts-expect-error shush
        expect(Dummy.__macros__).toEqual(undefined);

        mixin(
            Dummy,
            {
                yolo: () => 'yolo',
            },
            null,
            { onFunctionPrototype: false }
        );

        // @ts-expect-error shush
        expect(Dummy.prototype.__macros__).toEqual(new Set(['yo', 'yoo']));
        // @ts-expect-error shush
        expect(Dummy.__macros__).toEqual(new Set(['yolo']));
    });

    test('the source keys (2nd argument) can be symbols ', () => {
        const Dummy = makeDummy2Class();
        const THIS = Symbol('this');

        mixin(Dummy, {
            [THIS]() {
                return this;
            },
            [Symbol.toPrimitive](hint: string) {
                if (hint === 'number') {
                    return 77;
                }

                if (hint === 'string') {
                    return '!!!';
                }

                return '@';
            },
        });

        // @ts-expect-error shush
        expect(Dummy.prototype[THIS]()).toEqual(Dummy.prototype);
        // @ts-expect-error shush
        expect(new Dummy()[THIS]()).toEqual(new Dummy());

        expect(+Dummy.prototype).toEqual(77);
        expect(`${Dummy.prototype}`).toEqual('!!!');
        expect(Dummy.prototype + '').toEqual('@');

        expect(+new Dummy()).toEqual(77);
        expect(`${new Dummy()}`).toEqual('!!!');
        expect(new Dummy() + '').toEqual('@');

        // @ts-expect-error shush
        expect(Dummy.prototype.__macros__).toEqual(new Set([THIS, Symbol.toPrimitive]));
    });

    test('Target:object | Source:object ==> Target::static <- Source::static', () => {
        const target = {} as ReturnType<typeof makeDummyObject> & Macroed;
        const source = makeDummyObject();

        mixin(target, source);

        expect(target.__macros__).toEqual(new Set(getOwnPropertyKeys(source)));
        expect(target.__macros__).toEqual(
            new Set(['hey', 'hi', 'state', 'ooh', 'level', 'yeah', SELF, Symbol.toPrimitive])
        );

        assignProperty(source, target, '__macros__');

        expect(equalObjects(target, source)).toEqual(true);
        expect(equalDummyObjects(target, source)).toEqual(true);
    });

    test('Target:object | Source:function ==> Target::static <- Source::static + Target::static <- Source::prototype', () => {
        const target = {} as ReturnType<typeof makeDummyObject> & Macroed;
        const Source = makeDummyClass();

        mixin(target, Source);

        expect(target.__macros__).toEqual(new Set(getFunctionOwnPropertyKeys(Source, true)));
        expect(target.__macros__).toEqual(new Set(['hi', 'ooh', 'level', 'yeah', SELF, Symbol.toPrimitive]));

        assignProperty(Source, target, '__macros__');
        assignProperty(target, Source, ['length', 'prototype', 'name']);
        assignProperty(target, Source.prototype, 'constructor');

        const conversion = functionToObject<ReturnType<typeof makeDummyObject>>(Source);

        expect(equalObjects(target, conversion)).toEqual(true);
        expect(equalDummyObjects(target, conversion)).toEqual(true);
    });

    test('Target:function | Source:function ==> Target::static <- Source::static + Target::prototype <- Source::prototype', () => {
        const Target = class {} as unknown as ReturnType<typeof makeDummyObject> & Macroed & AnyFunction;
        const Source = makeDummyClass();

        mixin(Target, Source);

        expect(Target.__macros__).toEqual(new Set(getOwnPropertyKeys(Source, DEFAULT_FUNCTION_STATIC_PROPERTIES)));
        expect(Target.prototype.__macros__).toEqual(
            new Set(getOwnPropertyKeys(Source.prototype, DEFAULT_FUNCTION_PROTOTYPE_PROPERTIES))
        );

        expect(Target.__macros__).toEqual(new Set(['hi']));
        expect(Target.prototype.__macros__).toEqual(new Set(['ooh', 'level', 'yeah', SELF, Symbol.toPrimitive]));

        assignProperty(Source, Target, '__macros__');
        assignProperty(Source.prototype, Target.prototype, '__macros__');
        assignProperty(Target, Source, 'name');

        const ignoreMacroHiddenProp: AssignCallback = (key) => {
            if (key === '__macros__') {
                return false;
            }

            return;
        };

        expect(equalObjects(Target, Source, true)).toEqual(true);
        expect(
            equalDummyObjects(
                functionToObject<ReturnType<typeof makeDummyObject>>(Target, ignoreMacroHiddenProp),
                functionToObject<ReturnType<typeof makeDummyObject>>(Source, ignoreMacroHiddenProp)
            )
        ).toEqual(true);
    });

    describe('Target:function | Source:object ==> Target::prototype <- Source::static (or Target::static <- Source::static if configured)', () => {
        test("Target's function is NOT undefined & `onFunctionPrototype` is true", () => {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            const target = function () {} as unknown as ReturnType<typeof makeDummyObject> & Macroed & AnyFunction;
            const source = makeDummyObject();

            mixin(target, source);

            expect(target.__macros__).toEqual(undefined);
            expect(target.prototype.__macros__).toEqual(new Set(getOwnPropertyKeys(source)));
            expect(target.prototype.__macros__).toEqual(
                new Set(['hey', 'hi', 'state', 'ooh', 'level', 'yeah', SELF, Symbol.toPrimitive])
            );

            assignProperty(source, target.prototype, ['constructor', '__macros__']);

            expect(equalObjects(target.prototype, source)).toEqual(true);
            expect(equalDummyObjects(target.prototype, source)).toEqual(true);
        });

        test("Target's function IS undefined & `onFunctionPrototype` is true", () => {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            const target = (() => {}) as unknown as ReturnType<typeof makeDummyObject> & Macroed & AnyFunction;
            const source = makeDummyObject();

            mixin(target, source);

            expect(target.__macros__).toEqual(new Set(getOwnPropertyKeys(source)));
            expect(target.__macros__).toEqual(
                new Set(['hey', 'hi', 'state', 'ooh', 'level', 'yeah', SELF, Symbol.toPrimitive])
            );
            expect(target.prototype?.__macros__).toEqual(undefined);

            assignProperty(source, target, ['length', 'name', '__macros__']);

            expect(equalObjects(target, source)).toEqual(true);
            expect(equalDummyObjects(target, source)).toEqual(true);
        });

        test("Target's function is NOT undefined & `onFunctionPrototype` is false", () => {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            const target = function () {} as unknown as ReturnType<typeof makeDummyObject> & Macroed & AnyFunction;
            const source = makeDummyObject();

            mixin(target, source, null, { onFunctionPrototype: false });

            expect(target.__macros__).toEqual(new Set(getOwnPropertyKeys(source)));
            expect(target.__macros__).toEqual(
                new Set(['hey', 'hi', 'state', 'ooh', 'level', 'yeah', SELF, Symbol.toPrimitive])
            );
            expect(target.prototype?.__macros__).toEqual(undefined);

            assignProperty(source, target, ['length', 'prototype', 'name', '__macros__']);

            expect(equalObjects(target, source)).toEqual(true);
            expect(equalDummyObjects(target, source)).toEqual(true);
        });

        test("Target's function is NOT undefined & `onFunctionPrototype` is false", () => {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            const target = (() => {}) as unknown as ReturnType<typeof makeDummyObject> & Macroed & AnyFunction;
            const source = makeDummyObject();

            mixin(target, source, null, { onFunctionPrototype: false });

            expect(target.__macros__).toEqual(new Set(getOwnPropertyKeys(source)));
            expect(target.__macros__).toEqual(
                new Set(['hey', 'hi', 'state', 'ooh', 'level', 'yeah', SELF, Symbol.toPrimitive])
            );
            expect(target.prototype?.__macros__).toEqual(undefined);

            assignProperty(source, target, ['length', 'name', '__macros__']);

            expect(equalObjects(target, source)).toEqual(true);
            expect(equalDummyObjects(target, source)).toEqual(true);
        });
    });

    /**
     * The following tests should always be positioned last as they
     * modify native/base objects/functions/prototypes.
     *
     * Also, the order of the tests matters.
     */
    describe('Last set of tests', () => {
        it('does nothing when the 2nd argument is deemed "non satisfactory" (aka invalid) or "empty"', () => {
            Object.entries(values).forEach(([, items]) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                items().forEach((value: any) => {
                    const Dummy = randomTruthy() ? makeDummyClass() : makeDummyObject();

                    mixin(Dummy, value, null, { force: true });

                    if (
                        value &&
                        typeof value === 'object' &&
                        !Array.isArray(value) &&
                        getOwnPropertyKeys(value).length
                    ) {
                        // @ts-expect-error shush
                        expect(Dummy.prototype?.__macros__ || Dummy.__macros__).toBeInstanceOf(Set);

                        return;
                    }

                    if (typeof value === 'function' && getFunctionOwnPropertyKeys(value, true).length) {
                        // @ts-expect-error shush
                        expect(Dummy.prototype?.__macros__ || Dummy.__macros__).toBeInstanceOf(Set);

                        return;
                    }

                    // @ts-expect-error shush
                    expect(Dummy.prototype?.__macros__).toEqual(undefined);
                    // @ts-expect-error shush
                    expect(Dummy.__macros__).toEqual(undefined);

                    if (typeof Dummy === 'function') {
                        expect(getFunctionOwnPropertyKeys(Dummy)).toEqual(getFunctionOwnPropertyKeys(makeDummyClass()));
                    } else {
                        expect(getOwnPropertyKeys(Dummy)).toEqual(getOwnPropertyKeys(makeDummyObject()));
                    }
                });
            });
        });

        it('does nothing when the 1st argument is deemed "non satisfactory" (aka invalid)', () => {
            Object.entries(values).forEach(([, items]) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                items().forEach((value: any) => {
                    if (isSpecialNativeFunction(value)) {
                        return;
                    }

                    const Dummy = randomTruthy() ? makeDummyClass() : makeDummyObject();

                    mixin(value, Dummy, null, { force: true });

                    if (!value || !['object', 'function'].includes(typeof value)) {
                        expect(isMacroable(value)).toEqual(false);
                        expect(value?.__macros__).toEqual(undefined);
                        expect(value?.prototype?.__macros__).toEqual(undefined);
                        expect(value?.ooh).toEqual(undefined);

                        return;
                    }

                    if (typeof value === 'object') {
                        expect(isMacroable(value)).toEqual(true);
                        expect(value.__macros__).toBeInstanceOf(Set);
                        expect(value.prototype?.__macros__).toEqual(undefined);
                        expect(value.ooh()).toEqual('ooh');

                        return;
                    }

                    if (typeof value === 'function' && typeof value.prototype === 'undefined') {
                        expect(isMacroable(value)).toEqual(true);
                        expect(value?.__macros__).toBeInstanceOf(Set);
                        expect(value?.prototype?.__macros__).toEqual(undefined);
                        expect(value?.ooh()).toEqual('ooh');

                        return;
                    }

                    expect(typeof value === 'function').toEqual(true);

                    if (typeof Dummy === 'function') {
                        expect(value.__macros__).toEqual(new Set(['hi']));
                        expect(value.hi()).toEqual('hi');
                    } else {
                        expect(value.__macros__).toEqual(undefined);
                    }

                    expect(value.prototype.__macros__).toBeInstanceOf(Set);
                    expect(value.prototype.ooh()).toEqual('ooh');

                    try {
                        expect(new value().ooh()).toEqual('ooh');
                    } catch (error) {
                        expect(['anonymous', 'BigInt', 'Promise'].includes(value.name)).toEqual(true);
                    }
                });
            });
        });

        test('native/base objects and functions can also me macroed', () => {
            // @ts-expect-error shush
            expect('hey'.__macros__).toEqual(undefined);
            // @ts-expect-error shush
            expect(true.__macros__).toEqual(undefined);
            // @ts-expect-error shush
            expect((123).__macros__).toEqual(undefined);
            // @ts-expect-error shush
            expect(['hey'].__macros__).toBeInstanceOf(Set);

            Object.entries(values).forEach(([, items]) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                items().forEach((value: any) => {
                    if (!isSpecialNativeFunction(value)) {
                        return;
                    }

                    if (value === Object) {
                        return;
                    }

                    if (isMacroed(value)) {
                        return;
                    }

                    const Dummy = randomTruthy() ? makeDummyClass() : makeDummyObject();
                    mixin(value, Dummy, null, { force: true });

                    if (typeof Dummy === 'function' || value === Function) {
                        expect(value.__macros__).toBeInstanceOf(Set);
                        expect(value.__macros__.has('hi')).toEqual(true);
                        expect(typeof value.hi === 'function' ? value.hi() : value.hi).toEqual('hi');
                    } else {
                        expect(value.__macros__).toEqual(undefined);
                    }

                    expect(value.prototype.__macros__).toBeInstanceOf(Set);
                    expect(value.prototype.ooh()).toEqual('ooh');
                    expect(new value().ooh()).toEqual('ooh');
                });
            });

            // @ts-expect-error shush
            expect('hey'.__macros__).toBeInstanceOf(Set);
            // @ts-expect-error shush
            expect(true.__macros__).toBeInstanceOf(Set);
            // @ts-expect-error shush
            expect((123).__macros__).toBeInstanceOf(Set);
            // @ts-expect-error shush
            expect(['hey'].__macros__).toBeInstanceOf(Set);

            const Dummy = randomTruthy() ? makeDummyClass() : makeDummyObject();

            mixin(Object, Dummy, null, { force: true });

            // @ts-expect-error shush
            expect(Object.__macros__).toBeInstanceOf(Set);
            // @ts-expect-error shush
            expect(Object.prototype.__macros__).toBeInstanceOf(Set);

            // @ts-expect-error shush
            expect(['hey'].__macros__).toBeInstanceOf(Set);
        });
    });
});
