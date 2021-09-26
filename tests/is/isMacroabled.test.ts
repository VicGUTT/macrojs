import { macro, mixin } from '../../src';
import isMacroabled from '../../src/is/isMacroabled';
import isMacroedWith from '../../src/is/isMacroedWith';
import macroable from '../../src/macroable';

describe('is:isMacroabled', () => {
    it('works', () => {
        class Yolo {
            hey = 'hey';
            ooh(): string {
                return 'ooh';
            }
            get length(): number {
                return 7;
            }
        }

        expect(isMacroabled(Yolo)).toEqual(false);
        expect(isMacroabled(Yolo.prototype)).toEqual(false);

        // @ts-expect-error shush
        Yolo.prototype.__macros__ = new Set();
        // @ts-expect-error shush
        Yolo.__macros__ = new Set();

        expect(isMacroabled(Yolo)).toEqual(false);
        expect(isMacroabled(Yolo.prototype)).toEqual(false);

        // @ts-expect-error shush
        Yolo.prototype.__macros__.add('hasMacro');
        // @ts-expect-error shush
        Yolo.__macros__.add('hasMacro');

        expect(isMacroabled(Yolo)).toEqual(false);
        expect(isMacroabled(Yolo.prototype)).toEqual(false);

        // @ts-expect-error shush
        Yolo.prototype.__macros__.add('macro');
        // @ts-expect-error shush
        Yolo.__macros__.add('macro');

        expect(isMacroabled(Yolo)).toEqual(false);
        expect(isMacroabled(Yolo.prototype)).toEqual(false);

        // @ts-expect-error shush
        Yolo.prototype.__macros__.add('mixin');
        // @ts-expect-error shush
        Yolo.__macros__.add('mixin');

        expect(isMacroabled(Yolo)).toEqual(false);
        expect(isMacroabled(Yolo.prototype)).toEqual(false);

        // @ts-expect-error shush
        Yolo.prototype.__macros__.clear();
        // @ts-expect-error shush
        Yolo.__macros__.clear();

        expect(isMacroabled(Yolo)).toEqual(false);
        expect(isMacroabled(Yolo.prototype)).toEqual(false);

        macroable(Yolo);
        macroable(Yolo, null, { onFunctionPrototype: false });

        expect(isMacroabled(Yolo)).toEqual(true);
        expect(isMacroabled(Yolo.prototype)).toEqual(true);

        // eslint-disable-next-line @typescript-eslint/no-empty-function
        expect(isMacroabled({ hasMacro() {}, macro() {}, mixin() {} })).toEqual(false);
        expect(isMacroabled({ hasMacro: isMacroedWith, macro: macro, mixin: mixin })).toEqual(false);
        expect(isMacroabled(macroable({}))).toEqual(true);
    });
});
