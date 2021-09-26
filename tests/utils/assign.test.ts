import { AssignedDescriptors } from '../../src/types';
import assign from '../../src/utils/assign';
import { SELF, makeDummyClass, makeDummyObject } from '../__Fixtures/objects';
import equalObjects from '../__utils/equalObjects';
import equalDummyObjects from '../__utils/equalDummyObjects';

describe('utils:assign', () => {
    it('works', () => {
        const assigned = assign({}, makeDummyObject());

        expect(equalObjects(assigned, makeDummyObject())).toEqual(true);
        expect(equalDummyObjects(assigned, makeDummyObject())).toEqual(true);
    });

    it('correctly copies getters & setters', () => {
        const assigned = assign({}, makeDummyObject());

        // @ts-expect-error shush
        expect(assigned.called).toEqual(undefined);
        expect(assigned.yeah).toEqual('yeah');

        // @ts-expect-error shush
        expect(assigned.called).toEqual(true);
        expect(assigned.yeah).toEqual('called!');

        expect(assigned.state.level).toEqual(7);
        expect(assigned.level).toEqual(7);

        assigned.level = 10;

        expect(assigned.state.level).toEqual(20);
        expect(assigned.level).toEqual(20);
    });

    it('correctly copies symbols', () => {
        const _ = (value: Function): string => value.toString().replace(/\s/g, ''); // eslint-disable-line @typescript-eslint/ban-types

        const source = makeDummyObject();
        const assigned = assign({}, source);

        expect(_(assigned[SELF])).toEqual(_(source[SELF]));
        expect(_(assigned[SELF])).toEqual(`[SELF](){returnthis;}`);
        expect(assigned[SELF]()).toEqual(assigned);

        expect(_(assigned[Symbol.toPrimitive])).toEqual(_(source[Symbol.toPrimitive]));

        expect(+assigned).toEqual(42);
        expect(`${assigned}`).toEqual('---');
        expect(assigned + '').toEqual('🤷‍♂️');
    });

    it('works similarly but NOT equal to the native `Object.assign` function', () => {
        const source = makeDummyObject();
        const assigned = assign({}, makeDummyObject());
        const assigned2 = Object.assign({}, makeDummyObject());

        // Quick and simple way to "test" the `equalObjects` function actually works
        expect(equalObjects(source, source)).toEqual(true);
        expect(equalObjects(assigned, assigned)).toEqual(true);
        expect(equalObjects(assigned2, assigned2)).toEqual(true);

        expect(equalObjects(assigned, source)).toEqual(true);
        expect(equalObjects(assigned2, source)).toEqual(false);
        expect(equalObjects(assigned, assigned2)).toEqual(false);

        /**
         * Testing the differences between `assign` & `Object.assign`.
         * Basically, `Object.assign` does not set the source's setters/getters,
         * (meaning the actual functions) but instead sets their returned value.
         * `assign` does not have that issue (the whole point of the function actually).
         */

        const _ = Object.getOwnPropertyDescriptor;
        const ___ = (...args: unknown[]) => {
            // @ts-expect-error shush
            const descriptor = _(...args);

            if (descriptor?.get) {
                // @ts-expect-error shush
                descriptor.get = descriptor.get.toString();
            }

            if (descriptor?.set) {
                // @ts-expect-error shush
                descriptor.set = descriptor.set.toString();
            }

            return descriptor;
        };

        expect(___(assigned, 'yeah')).toEqual({
            get: ___(source, 'yeah')?.get,
            set: undefined,
            enumerable: true,
            configurable: true,
        });
        expect(___(assigned2, 'yeah')).toEqual({
            value: 'yeah',
            writable: true,
            enumerable: true,
            configurable: true,
        });

        expect(___(assigned, 'level')).toEqual({
            get: ___(source, 'level')?.get,
            set: ___(source, 'level')?.set,
            enumerable: true,
            configurable: true,
        });
        expect(___(assigned2, 'level')).toEqual({
            value: 7,
            writable: true,
            enumerable: true,
            configurable: true,
        });

        // @ts-expect-error shush
        expect(assigned.called).toEqual(undefined);
        // @ts-expect-error shush
        expect(assigned2.called).toEqual(undefined);

        expect(assigned.yeah).toEqual('yeah');
        expect(assigned2.yeah).toEqual('yeah');

        // @ts-expect-error shush
        expect(assigned.called).toEqual(true);
        // @ts-expect-error shush
        expect(assigned2.called).toEqual(undefined);

        expect(assigned.yeah).toEqual('called!');
        expect(assigned2.yeah).toEqual('yeah');

        expect(assigned.state.level).toEqual(7);
        expect(assigned2.state.level).toEqual(7);
        expect(assigned.level).toEqual(7);
        expect(assigned2.level).toEqual(7);

        assigned.level = 10;
        assigned2.level = 10;

        expect(assigned.state.level).toEqual(20);
        expect(assigned2.state.level).toEqual(7);
        expect(assigned.level).toEqual(20);
        expect(assigned2.level).toEqual(10);

        Object.defineProperties(assigned2, {
            state: _(assigned, 'state') as PropertyDescriptor,
            yeah: _(assigned, 'yeah') as PropertyDescriptor,
            called: _(assigned, 'called') as PropertyDescriptor,
            level: _(assigned, 'level') as PropertyDescriptor,
        });

        expect(equalObjects(assigned, assigned2)).toEqual(true);

        assigned.level = 50;
        assigned2.level = 50;

        expect(assigned.level).toEqual(100);
        expect(assigned2.level).toEqual(100);
    });

    test('testing the 3rd (the callback) argument', () => {
        let i = -1;
        const _descriptors: AssignedDescriptors = {};
        const source = makeDummyObject();

        const assigned = assign({}, source, (key, descriptor, descriptors, index, array) => {
            i++;

            expect(key in source).toEqual(true);
            expect(descriptor).toEqual(Object.getOwnPropertyDescriptor(source, key));
            expect(_descriptors).toEqual(descriptors);
            expect(index).toEqual(i);
            expect(array).toEqual([...Object.getOwnPropertyNames(source), ...Object.getOwnPropertySymbols(source)]);

            if (descriptor) {
                _descriptors[key] = descriptor;
            }
        });

        expect(equalObjects(assigned, source)).toEqual(true);
        expect(equalDummyObjects(assigned, source)).toEqual(true);

        // @ts-expect-error shush
        const filtered = assign({}, source, (key, _, descriptors) => {
            expect('hi' in descriptors).toEqual(false);
            expect('ooh' in descriptors).toEqual(false);
            expect('yeah' in descriptors).toEqual(false);

            if (['hi', 'ooh', 'yeah'].includes(key as string)) {
                return false;
            }

            if (key === 'hey') {
                return;
            }

            if (key === 'level') {
                return null;
            }
        });

        expect(equalObjects(filtered, source)).toEqual(false);
        expect(equalDummyObjects(filtered, source)).toEqual(false);

        // @ts-expect-error shush
        delete source.hi;
        // @ts-expect-error shush
        delete source.ooh;
        // @ts-expect-error shush
        delete source.yeah;

        expect(equalObjects(filtered, source)).toEqual(true);
    });

    test('testing having a classe/function as the source', () => {
        const target = { abc: 123 };
        const target2 = { abc: 123 };
        const target3 = { abc: 123 };
        const target4 = { abc: 123 };
        const Source = makeDummyClass();

        const keys = (value: unknown) => [...Object.getOwnPropertyNames(value), ...Object.getOwnPropertySymbols(value)];

        // Static (The object itself)
        expect(keys(target)).toEqual(['abc']);
        expect(keys(target2)).toEqual(['abc']);

        expect(keys(assign(target, Source))).toEqual(['abc', ...keys(Source)]);
        expect(keys(target)).toEqual(['abc', ...keys(Source)]);
        expect(keys(target)).toEqual(['abc', 'length', 'prototype', 'hi', 'name']);

        expect(keys(Object.assign(target2, Source))).toEqual(['abc']);
        expect(keys(target2)).toEqual(['abc']);

        // Prototype
        expect(keys(target)).toEqual(['abc', ...keys(Source)]);
        expect(keys(target2)).toEqual(['abc']);

        expect(keys(assign(target, Source.prototype))).toEqual(['abc', ...keys(Source), ...keys(Source.prototype)]);
        expect(keys(target)).toEqual(['abc', ...keys(Source), ...keys(Source.prototype)]);
        expect(keys(target)).toEqual([
            'abc',
            'length',
            'prototype',
            'hi',
            'name',
            'constructor',
            'ooh',
            'level',
            'yeah',
            SELF,
            Symbol.toPrimitive,
        ]);

        expect(keys(Object.assign(target2, Source.prototype))).toEqual(['abc']);
        expect(keys(target2)).toEqual(['abc']);

        // Instance
        expect(keys(target3)).toEqual(['abc']);
        expect(keys(target4)).toEqual(['abc']);

        expect(keys(assign(target3, new Source()))).toEqual(['abc', ...keys(new Source())]);
        expect(keys(target3)).toEqual(['abc', ...keys(new Source())]);
        expect(keys(target3)).toEqual(['abc', 'hey', 'state']);

        expect(keys(Object.assign(target4, new Source()))).toEqual(['abc', ...keys(new Source())]);
        expect(keys(target4)).toEqual(['abc', ...keys(new Source())]);
        expect(keys(target4)).toEqual(['abc', 'hey', 'state']);
    });

    test('testing having a classe/function as the target', () => {
        class Target {
            abc = 123;
            get def() {
                return 'def';
            }
        }
        class Target2 {
            abc = 123;
            get def() {
                return 'def';
            }
        }
        class Target3 {
            abc = 123;
            get def() {
                return 'def';
            }
        }
        class Target4 {
            abc = 123;
            get def() {
                return 'def';
            }
        }
        class Target5 {
            abc = 123;
            get def() {
                return 'def';
            }
        }
        class Target6 {
            abc = 123;
            get def() {
                return 'def';
            }
        }

        const source = () => makeDummyObject();
        const keys = (value: unknown) => [...Object.getOwnPropertyNames(value), ...Object.getOwnPropertySymbols(value)];

        // Static (The object itself)
        expect(keys(Target)).toEqual(['length', 'prototype', 'name']);
        expect(keys(Target2)).toEqual(['length', 'prototype', 'name']);

        expect(keys(assign(Target, source()))).toEqual(['length', 'prototype', 'name', ...keys(source())]);
        expect(keys(Target)).toEqual(['length', 'prototype', 'name', ...keys(source())]);
        expect(keys(Target)).toEqual([
            'length',
            'prototype',
            'name',
            'hey',
            'hi',
            'state',
            'ooh',
            'level',
            'yeah',
            SELF,
            Symbol.toPrimitive,
        ]);

        expect(keys(Object.assign(Target2, source()))).toEqual([
            'length',
            'prototype',
            'name',
            'hey',
            'hi',
            'state',
            'ooh',
            'level',
            'yeah',
            SELF,
            Symbol.toPrimitive,
        ]);
        expect(keys(Target2)).toEqual([
            'length',
            'prototype',
            'name',
            'hey',
            'hi',
            'state',
            'ooh',
            'level',
            'yeah',
            SELF,
            Symbol.toPrimitive,
        ]);

        // Prototype
        expect(keys(Target3.prototype)).toEqual(['constructor', 'def']);
        expect(keys(Target4.prototype)).toEqual(['constructor', 'def']);

        expect(keys(assign(Target3.prototype, source()))).toEqual(['constructor', 'def', ...keys(source())]);
        expect(keys(Target3.prototype)).toEqual(['constructor', 'def', ...keys(source())]);
        expect(keys(Target3.prototype)).toEqual([
            'constructor',
            'def',
            'hey',
            'hi',
            'state',
            'ooh',
            'level',
            'yeah',
            SELF,
            Symbol.toPrimitive,
        ]);

        expect(keys(Object.assign(Target4.prototype, source()))).toEqual([
            'constructor',
            'def',
            'hey',
            'hi',
            'state',
            'ooh',
            'level',
            'yeah',
            SELF,
            Symbol.toPrimitive,
        ]);
        expect(keys(Target4.prototype)).toEqual([
            'constructor',
            'def',
            'hey',
            'hi',
            'state',
            'ooh',
            'level',
            'yeah',
            SELF,
            Symbol.toPrimitive,
        ]);

        // Instance
        const instance1 = new Target5();
        const instance2 = new Target6();

        expect(keys(instance1)).toEqual(['abc']);
        expect(keys(instance2)).toEqual(['abc']);

        expect(keys(assign(instance1, source()))).toEqual(['abc', ...keys(source())]);
        expect(keys(instance1)).toEqual(['abc', ...keys(source())]);
        expect(keys(instance1)).toEqual([
            'abc',
            'hey',
            'hi',
            'state',
            'ooh',
            'level',
            'yeah',
            SELF,
            Symbol.toPrimitive,
        ]);

        expect(keys(Object.assign(instance2, source()))).toEqual([
            'abc',
            'hey',
            'hi',
            'state',
            'ooh',
            'level',
            'yeah',
            SELF,
            Symbol.toPrimitive,
        ]);
        expect(keys(instance2)).toEqual([
            'abc',
            'hey',
            'hi',
            'state',
            'ooh',
            'level',
            'yeah',
            SELF,
            Symbol.toPrimitive,
        ]);

        expect(keys(Target5)).toEqual(['length', 'prototype', 'name']);
        expect(keys(Target6)).toEqual(['length', 'prototype', 'name']);

        expect(keys(Target5.prototype)).toEqual(['constructor', 'def']);
        expect(keys(Target6.prototype)).toEqual(['constructor', 'def']);
    });

    test('testing primitives as target/source', () => {
        const values = [null, undefined, false, 1, 10n, NaN, Infinity, 'hey', Symbol('hey')];
        const keys = (value: unknown) => [...Object.getOwnPropertyNames(value), ...Object.getOwnPropertySymbols(value)];

        values.forEach((target) => {
            expect(() => assign(target, makeDummyObject())).toThrow('Object.defineProperties called on non-object');
        });

        values.forEach((source) => {
            const target = {};

            if (source === null || source === undefined) {
                expect(() => assign({}, source)).toThrow('Cannot convert undefined or null to object');
                expect(() => keys(source)).toThrow('Cannot convert undefined or null to object');

                return;
            }

            assign(target, source);

            if (source === 'hey') {
                expect(target).toEqual({ 0: 'h', 1: 'e', 2: 'y' });
                expect(keys(target)).toEqual(['0', '1', '2', 'length']);
                expect(keys(source)).toEqual(['0', '1', '2', 'length']);

                return;
            }

            expect(target).toEqual({});
            expect(keys(target)).toEqual([]);
            expect(keys(source)).toEqual([]);
        });
    });

    test('testing source with non primitive properties (the props should be copied by reference, so unsuitable for "deep cloning")', () => {
        const target = {
            name: 'Joe',
            relationships: [{ name: 'Kelly', relationType: 'daughter' }],
        };
        const source = {
            name: 'Bob',
            relationships: [
                { name: 'Alice', relationType: 'friend' },
                { name: 'Thomas', relationType: 'cousin' },
            ],
        };

        const assigned = assign(target, source);

        expect(assigned).toEqual(source);
        expect(target).toEqual(source);

        assigned.name = 'Tom';

        expect(source.name).toEqual('Bob');
        expect(target.name).toEqual('Tom');
        expect(assigned.name).toEqual('Tom');

        assigned.relationships[0].name = 'Olivia';

        expect(source.relationships[0].name).toEqual('Olivia');
        expect(target.relationships[0].name).toEqual('Olivia');
        expect(assigned.relationships[0].name).toEqual('Olivia');

        assigned.relationships.push({ name: 'Pat', relationType: 'brother' });

        expect(source.relationships).toEqual([
            { name: 'Olivia', relationType: 'friend' },
            { name: 'Thomas', relationType: 'cousin' },
            { name: 'Pat', relationType: 'brother' },
        ]);
        expect(target.relationships).toEqual([
            { name: 'Olivia', relationType: 'friend' },
            { name: 'Thomas', relationType: 'cousin' },
            { name: 'Pat', relationType: 'brother' },
        ]);
        expect(assigned.relationships).toEqual([
            { name: 'Olivia', relationType: 'friend' },
            { name: 'Thomas', relationType: 'cousin' },
            { name: 'Pat', relationType: 'brother' },
        ]);
    });

    test('properties on the prototype chain and non-enumerable properties cannot be copied', () => {
        /**
         * Here:
         * - `lollipop` is on source's prototype chain
         * - `nope` is a non-enumerable property
         * - `yep` is an own enumerable property
         *
         * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign#properties_on_the_prototype_chain_and_non-enumerable_properties_cannot_be_copied
         */
        const source = Object.create(
            { lollipop: 1 },
            {
                nope: {
                    value: 2,
                    // enumerable: false, -> default
                },
                yep: {
                    value: 3,
                    enumerable: true,
                },
            }
        );

        expect(Object.assign({}, source)).toEqual({ yep: 3 });
        expect(assign({}, source)).toEqual({ yep: 3 });
    });
});
