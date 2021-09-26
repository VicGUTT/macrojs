import isMacroed from '../src/is/isMacroed';
import macroable from '../src/macroable';
import macro from '../src/macro';
import { makeDummyClass, makeDummyObject } from './__Fixtures/objects';

describe('macroable', () => {
    it('works with classes/functions', () => {
        const Dummy = macroable(makeDummyClass());
        const instance = new Dummy() as typeof Dummy['prototype'];

        expect(isMacroed(Dummy)).toEqual(false);
        expect(isMacroed(Dummy.prototype)).toEqual(true);
        expect(isMacroed(instance)).toEqual(true);

        expect(Dummy.prototype.__macros__).toEqual(new Set(['hasMacro', 'macro', 'mixin']));
        expect(instance.__macros__).toEqual(new Set(['hasMacro', 'macro', 'mixin']));

        expect(typeof Dummy.prototype.hasMacro).toEqual('function');
        expect(typeof Dummy.prototype.macro).toEqual('function');
        expect(typeof Dummy.prototype.mixin).toEqual('function');
        expect(typeof instance.hasMacro).toEqual('function');
        expect(typeof instance.macro).toEqual('function');
        expect(typeof instance.mixin).toEqual('function');

        expect(Dummy.prototype.hasMacro('hasMacro')).toEqual(true);
        expect(Dummy.prototype.hasMacro('macro')).toEqual(true);
        expect(Dummy.prototype.hasMacro('mixin')).toEqual(true);
        expect(instance.hasMacro('hasMacro')).toEqual(true);
        expect(instance.hasMacro('macro')).toEqual(true);
        expect(instance.hasMacro('mixin')).toEqual(true);

        // Macro tests

        Dummy.prototype.macro('$hello', () => 'hello!');

        expect(Dummy.prototype.hasMacro('$hello')).toEqual(true);
        expect(instance.hasMacro('$hello')).toEqual(true);

        // @ts-expect-error shush
        expect(Dummy.$hello).toEqual(undefined);
        // @ts-expect-error shush
        expect(Dummy.prototype.$hello()).toEqual('hello!');
        // @ts-expect-error shush
        expect(instance.$hello()).toEqual('hello!');

        instance.macro('$hola', () => 'hola!');

        expect(Dummy.prototype.hasMacro('$hola')).toEqual(true);
        expect(instance.hasMacro('$hola')).toEqual(true);

        // @ts-expect-error shush
        expect(Dummy.$hola).toEqual(undefined);
        // @ts-expect-error shush
        expect(Dummy.prototype.$hola).toEqual(undefined);
        // @ts-expect-error shush
        expect(instance.$hola()).toEqual('hola!');

        // Mixin tests

        Dummy.prototype.mixin({
            $1: '$1',
            get $2() {
                return '$2';
            },
        });

        ['$1', '$2'].forEach((key) => {
            expect(Dummy.prototype.hasMacro(key)).toEqual(true);
            expect(instance.hasMacro(key)).toEqual(true);

            // @ts-expect-error shush
            expect(Dummy[key]).toEqual(undefined);
            // @ts-expect-error shush
            expect(Dummy.prototype[key]).toEqual(key);
            // @ts-expect-error shush
            expect(instance[key]).toEqual(key);
        });

        instance.mixin({
            $3: '$3',
            get $4() {
                return '$4';
            },
        });

        ['$3', '$4'].forEach((key) => {
            expect(Dummy.prototype.hasMacro(key)).toEqual(true);
            expect(instance.hasMacro(key)).toEqual(true);

            // @ts-expect-error shush
            expect(Dummy[key]).toEqual(undefined);
            // @ts-expect-error shush
            expect(Dummy.prototype[key]).toEqual(undefined);
            // @ts-expect-error shush
            expect(instance[key]).toEqual(key);
        });
    });

    it('works with objects', () => {
        const dummy = macroable(makeDummyObject());

        expect(isMacroed(dummy)).toEqual(true);
        expect(dummy.__macros__).toEqual(new Set(['hasMacro', 'macro', 'mixin']));

        expect(typeof dummy.hasMacro).toEqual('function');
        expect(typeof dummy.macro).toEqual('function');
        expect(typeof dummy.mixin).toEqual('function');

        expect(dummy.hasMacro('hasMacro')).toEqual(true);
        expect(dummy.hasMacro('macro')).toEqual(true);
        expect(dummy.hasMacro('mixin')).toEqual(true);

        // Macro tests

        dummy.macro('$hey', () => 'hey!');

        // @ts-expect-error shush
        expect(dummy.$hey()).toEqual('hey!');
        expect(dummy.hasMacro('$hey')).toEqual(true);

        // Mixin tests

        dummy.mixin({
            $1: '$1',
            get $2() {
                return '$2';
            },
        });

        ['$1', '$2'].forEach((key) => {
            expect(dummy.hasMacro(key)).toEqual(true);

            // @ts-expect-error shush
            expect(dummy[key]).toEqual(key);
        });
    });

    it('can make use of a callback as a 2nd parameter', () => {
        [makeDummyClass(), makeDummyObject()].forEach((Dummy) => {
            const isFunction = typeof Dummy === 'function';
            const keys = ['hasMacro', 'macro', 'mixin'];

            let i = 0;

            macroable(
                Dummy,
                (name, self, mixin, options) => {
                    expect(keys.includes(name as string)).toEqual(true);
                    expect(self).toEqual(Dummy);
                    expect(Object.keys(mixin)).toEqual(keys);
                    expect(options).toEqual({ force: true, onFunctionPrototype: true, yolo: 'yolo' });

                    expect(keys[i]).toEqual(name);

                    i++;
                },
                // @ts-expect-error shush
                { force: true, onFunctionPrototype: true, yolo: 'yolo' }
            );

            expect(i > 0).toEqual(true);
            expect(i).toEqual(keys.length);

            // @ts-expect-error shush
            expect(isFunction ? Dummy.prototype.__macros__ : Dummy.__macros__).toEqual(undefined);

            macroable(Dummy, (name, self) => {
                if (name !== 'hasMacro') {
                    return;
                }

                if (isFunction) {
                    // @ts-expect-error shush
                    self.prototype[name] = (value: string) => `${value}<--`;
                    // @ts-expect-error shush
                    self.prototype.yolo = 'yolo!';
                } else {
                    // @ts-expect-error shush
                    self[name] = (value: string) => `${value}<--`;
                    // @ts-expect-error shush
                    self.yolo = 'yolo!';
                }
            });

            // @ts-expect-error shush
            expect(isFunction ? Dummy.prototype.__macros__ : Dummy.__macros__).toEqual(undefined);

            // @ts-expect-error shush
            expect((isFunction ? Dummy.prototype : Dummy).hasMacro('hey')).toEqual('hey<--');
            // @ts-expect-error shush
            expect((isFunction ? Dummy.prototype : Dummy).yolo).toEqual('yolo!');

            macroable(Dummy, (name, self, mixin) => {
                // @ts-expect-error shush
                macro(self, name, mixin[name]);
            });

            // @ts-expect-error shush
            expect(isFunction ? Dummy.prototype.__macros__ : Dummy.__macros__).toEqual(new Set(['macro', 'mixin']));

            // @ts-expect-error shush
            expect((isFunction ? Dummy.prototype : Dummy).hasMacro('hey')).toEqual('hey<--');

            macroable(Dummy, (name, self, mixin) => {
                // @ts-expect-error shush
                macro(self, name, mixin[name], { force: true });
            });

            // @ts-expect-error shush
            expect(isFunction ? Dummy.prototype.__macros__ : Dummy.__macros__).toEqual(new Set(keys));

            // @ts-expect-error shush
            expect((isFunction ? Dummy.prototype : Dummy).hasMacro('hey')).toEqual(false);
            // @ts-expect-error shush
            expect((isFunction ? Dummy.prototype : Dummy).hasMacro('hasMacro')).toEqual(true);
        });
    });
});
