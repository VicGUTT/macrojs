import macro from '../src/macro';
import { makeDummyClass, makeDummyObject } from './__Fixtures/objects';

const props = {
    // default: ['length', 'prototype', 'name'],
    static: ['length', 'prototype', 'hi', 'name'],
    instance: ['hey', 'state'],
    // macro: ['__macros__'],
    // macroed: ['hello'],
    fullStatic: ['length', 'prototype', 'hi', 'name', 'hello', '__macros__'],
    onPrototypeBefore: ['constructor', 'ooh', 'level', 'yeah'],
    onPrototypeAfter: ['constructor', 'ooh', 'level', 'yeah', 'hello', '__macros__'],
};

describe('macro', () => {
    it("can add a macro to a class/function's prototype by default", () => {
        const Dummy = makeDummyClass();

        expect('__macros__' in Dummy).toEqual(false);
        expect('__macros__' in Dummy.prototype).toEqual(false);
        expect('__macros__' in new Dummy()).toEqual(false);
        expect('hello' in Dummy).toEqual(false);
        expect('hello' in Dummy.prototype).toEqual(false);
        expect('hello' in new Dummy()).toEqual(false);
        expect(Object.getOwnPropertyNames(Dummy)).toEqual(props.static);
        expect(Object.getOwnPropertyNames(Dummy.prototype)).toEqual(props.onPrototypeBefore);
        expect(Object.getOwnPropertyNames(new Dummy())).toEqual(props.instance);

        macro(Dummy, 'hello', () => 'hello');

        expect('__macros__' in Dummy).toEqual(false);
        expect('__macros__' in Dummy.prototype).toEqual(true);
        expect('__macros__' in new Dummy()).toEqual(true);
        expect('hello' in Dummy).toEqual(false);
        expect('hello' in Dummy.prototype).toEqual(true);
        expect('hello' in new Dummy()).toEqual(true);
        expect(Object.getOwnPropertyNames(Dummy)).toEqual(props.static);
        expect(Object.getOwnPropertyNames(Dummy.prototype)).toEqual(props.onPrototypeAfter);
        expect(Object.getOwnPropertyNames(new Dummy())).toEqual(props.instance);

        // @ts-expect-error shush
        expect(Dummy.__macros__).toEqual(undefined);
        // @ts-expect-error shush
        expect(Dummy.prototype.__macros__).toEqual(new Set(['hello']));
        // @ts-expect-error shush
        expect(new Dummy().__macros__).toEqual(new Set(['hello']));

        // @ts-expect-error shush
        expect(Dummy.hello).toEqual(undefined);
        // @ts-expect-error shush
        expect(Dummy.prototype.hello()).toEqual('hello');
        // @ts-expect-error shush
        expect(new Dummy().hello()).toEqual('hello');
    });

    it("can add a macro to a class/function's prototype", () => {
        const Dummy = makeDummyClass();

        expect('__macros__' in Dummy).toEqual(false);
        expect('__macros__' in Dummy.prototype).toEqual(false);
        expect('__macros__' in new Dummy()).toEqual(false);
        expect('hello' in Dummy).toEqual(false);
        expect('hello' in Dummy.prototype).toEqual(false);
        expect('hello' in new Dummy()).toEqual(false);
        expect(Object.getOwnPropertyNames(Dummy)).toEqual(props.static);
        expect(Object.getOwnPropertyNames(Dummy.prototype)).toEqual(props.onPrototypeBefore);
        expect(Object.getOwnPropertyNames(new Dummy())).toEqual(props.instance);

        macro(Dummy.prototype, 'hello', () => 'hello');

        expect('__macros__' in Dummy).toEqual(false);
        expect('__macros__' in Dummy.prototype).toEqual(true);
        expect('__macros__' in new Dummy()).toEqual(true);
        expect('hello' in Dummy).toEqual(false);
        expect('hello' in Dummy.prototype).toEqual(true);
        expect('hello' in new Dummy()).toEqual(true);
        expect(Object.getOwnPropertyNames(Dummy)).toEqual(props.static);
        expect(Object.getOwnPropertyNames(Dummy.prototype)).toEqual(props.onPrototypeAfter);
        expect(Object.getOwnPropertyNames(new Dummy())).toEqual(props.instance);

        // @ts-expect-error shush
        expect(Dummy.__macros__).toEqual(undefined);
        // @ts-expect-error shush
        expect(Dummy.prototype.__macros__).toEqual(new Set(['hello']));
        // @ts-expect-error shush
        expect(new Dummy().__macros__).toEqual(new Set(['hello']));

        // @ts-expect-error shush
        expect(Dummy.hello).toEqual(undefined);
        // @ts-expect-error shush
        expect(Dummy.prototype.hello()).toEqual('hello');
        // @ts-expect-error shush
        expect(new Dummy().hello()).toEqual('hello');

        macro(Dummy, 'yolo', {
            abc: () => 'abc',
            get yeah() {
                // @ts-expect-error shush
                if (this.called) {
                    return 'called!';
                }

                // @ts-expect-error shush
                this.called = true;

                return 'yeah';
            },
        });

        // @ts-expect-error shush
        expect(new Dummy().__macros__).toEqual(new Set(['hello', 'yolo']));
        // @ts-expect-error shush
        expect(new Dummy().yolo.abc()).toEqual('abc');
        // @ts-expect-error shush
        expect(new Dummy().yolo.yeah).toEqual('yeah');
        // @ts-expect-error shush
        expect(new Dummy().yolo.yeah).toEqual('called!');
    });

    it('can add a macro to a class/function', () => {
        const Dummy = makeDummyClass();

        expect('__macros__' in Dummy).toEqual(false);
        expect('__macros__' in Dummy.prototype).toEqual(false);
        expect('__macros__' in new Dummy()).toEqual(false);
        expect('hello' in Dummy).toEqual(false);
        expect('hello' in Dummy.prototype).toEqual(false);
        expect('hello' in new Dummy()).toEqual(false);
        expect(Object.getOwnPropertyNames(Dummy)).toEqual(props.static);
        expect(Object.getOwnPropertyNames(Dummy.prototype)).toEqual(props.onPrototypeBefore);
        expect(Object.getOwnPropertyNames(new Dummy())).toEqual(props.instance);

        macro(Dummy, 'hello', () => 'hello', { onFunctionPrototype: false });

        expect('__macros__' in Dummy).toEqual(true);
        expect('__macros__' in Dummy.prototype).toEqual(false);
        expect('__macros__' in new Dummy()).toEqual(false);
        expect('hello' in Dummy).toEqual(true);
        expect('hello' in Dummy.prototype).toEqual(false);
        expect('hello' in new Dummy()).toEqual(false);
        expect(Object.getOwnPropertyNames(Dummy)).toEqual(props.fullStatic);
        expect(Object.getOwnPropertyNames(Dummy.prototype)).toEqual(props.onPrototypeBefore);
        expect(Object.getOwnPropertyNames(new Dummy())).toEqual(props.instance);

        // @ts-expect-error shush
        expect(Dummy.__macros__).toEqual(new Set(['hello']));
        // @ts-expect-error shush
        expect(Dummy.prototype.__macros__).toEqual(undefined);
        // @ts-expect-error shush
        expect(new Dummy().__macros__).toEqual(undefined);

        // @ts-expect-error shush
        expect(Dummy.hello()).toEqual('hello');
        // @ts-expect-error shush
        expect(Dummy.prototype.hello).toEqual(undefined);
        // @ts-expect-error shush
        expect(new Dummy().hello).toEqual(undefined);

        macro(
            Dummy,
            'yolo',
            {
                abc: () => 'abc',
                get yeah() {
                    // @ts-expect-error shush
                    if (this.called) {
                        return 'called!';
                    }

                    // @ts-expect-error shush
                    this.called = true;

                    return 'yeah';
                },
            },
            { onFunctionPrototype: false }
        );

        // @ts-expect-error shush
        expect(Dummy.__macros__).toEqual(new Set(['hello', 'yolo']));
        // @ts-expect-error shush
        expect(Dummy.yolo.abc()).toEqual('abc');
        // @ts-expect-error shush
        expect(Dummy.yolo.yeah).toEqual('yeah');
        // @ts-expect-error shush
        expect(Dummy.yolo.yeah).toEqual('called!');
    });

    it('can add a macro to an object litteral', () => {
        const Dummy = makeDummyObject();
        const keys = Object.keys(Dummy);

        expect('__macros__' in Dummy).toEqual(false);
        expect('hello' in Dummy).toEqual(false);
        expect(Object.getOwnPropertyNames(Dummy)).toEqual(keys);

        macro(Dummy, 'hello', () => 'hello');

        expect('__macros__' in Dummy).toEqual(true);
        expect('hello' in Dummy).toEqual(true);
        expect(Object.getOwnPropertyNames(Dummy)).toEqual([...keys, 'hello', '__macros__']);

        // @ts-expect-error shush
        expect(Dummy.__macros__).toEqual(new Set(['hello']));
        // @ts-expect-error shush
        expect(Dummy.hello()).toEqual('hello');

        macro(Dummy, 'yolo', {
            abc: () => 'abc',
            get yeah() {
                // @ts-expect-error shush
                if (this.called) {
                    return 'called!';
                }

                // @ts-expect-error shush
                this.called = true;

                return 'yeah';
            },
        });

        // @ts-expect-error shush
        expect(Dummy.__macros__).toEqual(new Set(['hello', 'yolo']));
        // @ts-expect-error shush
        expect(Dummy.yolo.abc()).toEqual('abc');
        // @ts-expect-error shush
        expect(Dummy.yolo.yeah).toEqual('yeah');
        // @ts-expect-error shush
        expect(Dummy.yolo.yeah).toEqual('called!');
    });

    it('can add a macro to an object', () => {
        const Dummy: unknown[] = [];

        expect('__macros__' in Dummy).toEqual(false);
        expect('hi' in Dummy).toEqual(false);
        expect(Object.getOwnPropertyNames(Dummy)).toEqual(['length']);

        macro(Dummy, 'hello', () => 'hello');

        expect('__macros__' in Dummy).toEqual(true);
        expect('hello' in Dummy).toEqual(true);
        expect(Object.getOwnPropertyNames(Dummy)).toEqual(['length', 'hello', '__macros__']);

        // @ts-expect-error shush
        expect(Dummy.__macros__).toEqual(new Set(['hello']));

        // @ts-expect-error shush
        expect(Dummy.hello()).toEqual('hello');

        // The "onFunctionPrototype" option here should have no effet, as the target is not a function
        macro(Dummy, 'hi', () => 'hi', { onFunctionPrototype: false });

        expect('__macros__' in Dummy).toEqual(true);
        expect('hi' in Dummy).toEqual(true);
        expect(Object.getOwnPropertyNames(Dummy)).toEqual(['length', 'hello', '__macros__', 'hi']);

        // @ts-expect-error shush
        expect(Dummy.__macros__).toEqual(new Set(['hello', 'hi']));

        // @ts-expect-error shush
        expect(Dummy.hi()).toEqual('hi');
    });

    it('can replace a macroed property', () => {
        const Dummy = makeDummyClass();

        // @ts-expect-error shush
        expect(Dummy.prototype.__macros__).toEqual(undefined);
        // @ts-expect-error shush
        expect(Dummy.prototype.hello).toEqual(undefined);

        macro(Dummy, 'hello', () => 'hello');

        // @ts-expect-error shush
        expect(Dummy.prototype.__macros__).toEqual(new Set(['hello']));
        // @ts-expect-error shush
        expect(Dummy.prototype.hello()).toEqual('hello');
        // @ts-expect-error shush
        expect(new Dummy().hello()).toEqual('hello');

        macro(Dummy, 'hello', () => 'hi');

        // @ts-expect-error shush
        expect(Dummy.prototype.__macros__).toEqual(new Set(['hello']));
        // @ts-expect-error shush
        expect(Dummy.prototype.hello()).toEqual('hello');
        // @ts-expect-error shush
        expect(new Dummy().hello()).toEqual('hello');

        macro(Dummy, 'hello', () => 'hi', { force: true });

        // @ts-expect-error shush
        expect(Dummy.prototype.__macros__).toEqual(new Set(['hello']));
        // @ts-expect-error shush
        expect(Dummy.prototype.hello()).toEqual('hi');
        // @ts-expect-error shush
        expect(new Dummy().hello()).toEqual('hi');
    });

    it('can replace a `native` class/function property', () => {
        const Dummy = makeDummyClass();

        // @ts-expect-error shush
        expect(Dummy.prototype.__macros__).toEqual(undefined);
        expect(Dummy.prototype.ooh()).toEqual('ooh');

        macro(Dummy, 'ooh', () => 'hi');

        // @ts-expect-error shush
        expect(Dummy.prototype.__macros__).toEqual(undefined);
        expect(Dummy.prototype.ooh()).toEqual('ooh');

        macro(Dummy, 'ooh', () => 'hi', { force: true });

        // @ts-expect-error shush
        expect(Dummy.prototype.__macros__).toEqual(new Set(['ooh']));
        expect(Dummy.prototype.ooh()).toEqual('hi');
    });

    it('can try to replace a `native` object property', () => {
        const Dummy: unknown[] = [];

        expect('__macros__' in Dummy).toEqual(false);
        expect(Object.getOwnPropertyNames(Dummy)).toEqual(['length']);
        expect(Dummy.length).toEqual(0);

        macro(Dummy, 'length', () => 'hi');

        expect('__macros__' in Dummy).toEqual(false);
        expect(Dummy.length).toEqual(0);

        expect(() => macro(Dummy, 'length', () => 'hi', { force: true })).toThrow('Invalid array length');

        expect('__macros__' in Dummy).toEqual(false);
        expect(Dummy.length).toEqual(0);

        expect(() => macro(Dummy, 'length', 1, { force: true })).toThrow('Cannot redefine property: length');

        expect('__macros__' in Dummy).toEqual(false);
        expect(Dummy.length).toEqual(0);

        expect(() => macro(Dummy, 'length', 1, { force: true })).toThrow('Cannot redefine property: length');

        expect('__macros__' in Dummy).toEqual(false);
        expect(Object.getOwnPropertyNames(Dummy)).toEqual(['length']);
        expect(Dummy.length).toEqual(0);

        expect('filter' in Dummy).toEqual(true);
        // @ts-expect-error shush
        expect(() => Dummy.filter()).toThrow('undefined is not a function');

        macro(Dummy, 'filter', () => 'hi');

        expect('__macros__' in Dummy).toEqual(false);
        expect('filter' in Dummy).toEqual(true);
        // @ts-expect-error shush
        expect(() => Dummy.filter()).toThrow('undefined is not a function');

        macro(Dummy, 'filter', () => 'hi', { force: true });

        expect('__macros__' in Dummy).toEqual(true);
        // @ts-expect-error shush
        expect(Dummy.__macros__).toEqual(new Set(['filter']));
        expect('filter' in Dummy).toEqual(true);
        // @ts-expect-error shush
        expect(Dummy.filter()).toEqual('hi');
    });

    it('can replace a `native` getter property', () => {
        const Dummy = makeDummyClass();

        // @ts-expect-error shush
        expect(Dummy.prototype.__macros__).toEqual(undefined);
        expect(Dummy.prototype.level).toEqual(undefined);
        expect(new Dummy().level).toEqual(7);

        macro(Dummy, 'level', 'hi');

        // @ts-expect-error shush
        expect(Dummy.prototype.__macros__).toEqual(undefined);
        expect(Dummy.prototype.level).toEqual(undefined);
        expect(new Dummy().level).toEqual(7);

        macro(Dummy, 'level', 'hi', { force: true });

        // @ts-expect-error shush
        expect(Dummy.prototype.__macros__).toEqual(new Set(['level']));
        expect(Dummy.prototype.level).toEqual('hi');
        expect(new Dummy().level).toEqual('hi');

        macro(Dummy, 'level', () => 'hi again');

        // @ts-expect-error shush
        expect(Dummy.prototype.__macros__).toEqual(new Set(['level']));
        expect(Dummy.prototype.level).toEqual('hi');
        expect(new Dummy().level).toEqual('hi');

        macro(Dummy, 'level', () => 'hi again', { force: true });

        // @ts-expect-error shush
        expect(Dummy.prototype.__macros__).toEqual(new Set(['level']));
        // @ts-expect-error shush
        expect(Dummy.prototype.level()).toEqual('hi again');
        // @ts-expect-error shush
        expect(new Dummy().level()).toEqual('hi again');

        macro(Dummy, 'level', 7, { force: true });

        // @ts-expect-error shush
        expect(Dummy.prototype.__macros__).toEqual(new Set(['level']));
        expect(Dummy.prototype.level).toEqual(7);
        expect(new Dummy().level).toEqual(7);
    });

    it('can replace a `native` static property', () => {
        const Dummy = makeDummyClass();

        expect('hi' in Dummy.prototype).toEqual(false);
        // @ts-expect-error shush
        expect(Dummy.prototype.__macros__).toEqual(undefined);
        // @ts-expect-error shush
        expect(Dummy.__macros__).toEqual(undefined);
        expect(Dummy.hi()).toEqual('hi');

        macro(Dummy, 'hi', 'howdy');

        expect('hi' in Dummy.prototype).toEqual(true);
        // @ts-expect-error shush
        expect(Dummy.prototype.__macros__).toEqual(new Set(['hi']));
        // @ts-expect-error shush
        expect(Dummy.prototype.hi).toEqual('howdy');
        // @ts-expect-error shush
        expect(new Dummy().hi).toEqual('howdy');
        // @ts-expect-error shush
        expect(Dummy.__macros__).toEqual(undefined);
        expect(Dummy.hi()).toEqual('hi');

        macro(Dummy, 'hi', 'howdy', { onFunctionPrototype: false });

        expect('hi' in Dummy.prototype).toEqual(true);
        // @ts-expect-error shush
        expect(Dummy.prototype.__macros__).toEqual(new Set(['hi']));
        // @ts-expect-error shush
        expect(Dummy.__macros__).toEqual(undefined);
        expect(Dummy.hi()).toEqual('hi');

        macro(Dummy, 'hi', "howdy y'all", { force: true, onFunctionPrototype: false });

        expect('hi' in Dummy.prototype).toEqual(true);
        // @ts-expect-error shush
        expect(Dummy.prototype.__macros__).toEqual(new Set(['hi']));
        // @ts-expect-error shush
        expect(Dummy.prototype.hi).toEqual('howdy');
        // @ts-expect-error shush
        expect(new Dummy().hi).toEqual('howdy');
        // @ts-expect-error shush
        expect(Dummy.__macros__).toEqual(new Set(['hi']));
        expect(Dummy.hi).toEqual("howdy y'all");

        macro(Dummy, 'hi', () => "howdy y'all bis!", { force: true, onFunctionPrototype: false });

        // @ts-expect-error shush
        expect(new Dummy().hi).toEqual('howdy');
        // @ts-expect-error shush
        expect(Dummy.__macros__).toEqual(new Set(['hi']));
        expect(Dummy.hi()).toEqual("howdy y'all bis!");
    });

    it('can have access to the object being macroed', () => {
        const Dummy = makeDummyClass();

        macro(Dummy, 'self', () => this);

        // @ts-expect-error shush
        expect(Dummy.prototype.self()).toEqual({});
        // @ts-expect-error shush
        expect(new Dummy().self()).toEqual({});

        macro(
            Dummy,
            'self',
            function () {
                // @ts-expect-error shush
                return this;
            },
            { force: true }
        );

        // @ts-expect-error shush
        expect(Dummy.prototype.self()).toEqual(Dummy.prototype);
        // @ts-expect-error shush
        expect(new Dummy().self()).toEqual(new Dummy());
    });

    test('the macro name can be a symbol', () => {
        const Dummy = class Dummy {};
        const THIS = Symbol('this');

        macro(
            Dummy,
            // @ts-expect-error shush
            THIS,
            function () {
                // @ts-expect-error shush
                return this;
            }
        );

        // @ts-expect-error shush
        expect(Dummy.prototype[THIS]()).toEqual(Dummy.prototype);
        // @ts-expect-error shush
        expect(new Dummy()[THIS]()).toEqual(new Dummy());

        macro(
            Dummy,
            // @ts-expect-error shush
            Symbol.toPrimitive,
            (hint: string) => {
                if (hint === 'number') {
                    return 77;
                }

                if (hint === 'string') {
                    return '!!!';
                }

                return '@';
            }
        );

        expect(+Dummy.prototype).toEqual(77);
        expect(`${Dummy.prototype}`).toEqual('!!!');
        expect(Dummy.prototype + '').toEqual('@');

        expect(+new Dummy()).toEqual(77);
        expect(`${new Dummy()}`).toEqual('!!!');
        expect(new Dummy() + '').toEqual('@');

        // @ts-expect-error shush
        expect(Dummy.prototype.__macros__).toEqual(new Set([THIS, Symbol.toPrimitive]));
    });

    test('the `__macros__` property does not contain duplicate values', () => {
        const Dummy = makeDummyClass();

        // @ts-expect-error shush
        expect(Dummy.prototype.__macros__).toEqual(undefined);

        macro(Dummy, 'hello', () => '_hello', { force: true });
        macro(Dummy, 'hi', () => '_hi', { force: true });
        macro(Dummy, 'hey', () => '_hey', { force: true });
        macro(Dummy, 'level', () => '_level', { force: true });
        macro(Dummy, 'self', () => '_self', { force: true });

        macro(Dummy, 'bye', () => '_bye', { force: true });
        macro(Dummy, 'bye', () => '__bye', { force: true });
        macro(Dummy, 'level', () => '__level', { force: true });

        // @ts-expect-error shush
        expect(Dummy.prototype.__macros__).toEqual(new Set(['hello', 'hi', 'hey', 'level', 'self', 'bye']));
        // @ts-expect-error shush
        expect(Dummy.prototype.bye()).toEqual('__bye');
        // @ts-expect-error shush
        expect(Dummy.prototype.level()).toEqual('__level');

        macro(Dummy, 'new', () => 'new', { force: true });
        macro(Dummy, 'new', () => 'newest new', { force: true });

        // @ts-expect-error shush
        expect(Dummy.prototype.__macros__).toEqual(new Set(['hello', 'hi', 'hey', 'level', 'self', 'bye', 'new']));
        // @ts-expect-error shush
        expect(Dummy.prototype.new()).toEqual('newest new');
    });

    test("the `__macros__` property's descriptor", () => {
        const Dummy = makeDummyClass();

        macro(Dummy, 'new', () => 'hello');

        expect(Object.getOwnPropertyDescriptor(Dummy.prototype, '__macros__')).toEqual({
            value: new Set(['new']),
            writable: false,
            enumerable: false,
            configurable: false,
        });

        expect(() => {
            // @ts-expect-error shush
            delete Dummy.prototype.__macros__;
        }).toThrow("Cannot delete property '__macros__' of #<Dummy>");

        expect(() => {
            // @ts-expect-error shush
            Dummy.prototype.__macros__ = 'hey';
        }).toThrow("Cannot assign to read only property '__macros__' of object '#<Dummy>'");

        for (const key in Dummy.prototype) {
            if (Object.prototype.hasOwnProperty.call(Dummy.prototype, key)) {
                expect(key).toEqual('new');
            }

            expect(key).toEqual('new');
        }

        // @ts-expect-error shush
        Dummy.prototype.__macros__.add('ooh');

        // @ts-expect-error shush
        expect(Dummy.prototype.__macros__).toEqual(new Set(['new', 'ooh']));
    });
});
