import isMacroedWith from '../../src/is/isMacroedWith';

describe('is:isMacroedWith', () => {
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

        expect(isMacroedWith(Yolo, 'newProp')).toEqual(false);
        expect(isMacroedWith(Yolo.prototype, 'newProp')).toEqual(false);

        // @ts-expect-error shush
        Yolo.prototype.__macros__ = new Set();
        // @ts-expect-error shush
        Yolo.__macros__ = new Set();

        expect(isMacroedWith(Yolo, 'newProp')).toEqual(false);
        expect(isMacroedWith(Yolo.prototype, 'newProp')).toEqual(false);

        // @ts-expect-error shush
        Yolo.prototype.__macros__.add('otherProp');
        // @ts-expect-error shush
        Yolo.__macros__.add('otherProp');

        expect(isMacroedWith(Yolo, 'newProp')).toEqual(false);
        expect(isMacroedWith(Yolo.prototype, 'newProp')).toEqual(false);

        expect(isMacroedWith(Yolo, 'otherProp')).toEqual(true);
        expect(isMacroedWith(Yolo.prototype, 'otherProp')).toEqual(true);

        // @ts-expect-error shush
        Yolo.prototype.__macros__.add('newProp');
        // @ts-expect-error shush
        Yolo.__macros__.add('newProp');

        expect(isMacroedWith(Yolo, 'newProp')).toEqual(true);
        expect(isMacroedWith(Yolo.prototype, 'newProp')).toEqual(true);

        expect(isMacroedWith(Yolo, 'otherProp')).toEqual(true);
        expect(isMacroedWith(Yolo.prototype, 'otherProp')).toEqual(true);
    });

    it('accepts an array as 2nd parameter', () => {
        class Yolo {
            hey = 'hey';
            ooh(): string {
                return 'ooh';
            }
            get length(): number {
                return 7;
            }
        }

        expect(isMacroedWith(Yolo, 'newProp')).toEqual(false);
        expect(isMacroedWith(Yolo, ['newProp', 'otherProp'])).toEqual(false);
        expect(isMacroedWith(Yolo.prototype, 'newProp')).toEqual(false);
        expect(isMacroedWith(Yolo.prototype, ['newProp', 'otherProp'])).toEqual(false);

        // @ts-expect-error shush
        Yolo.prototype.__macros__ = new Set();
        // @ts-expect-error shush
        Yolo.__macros__ = new Set();

        expect(isMacroedWith(Yolo, 'newProp')).toEqual(false);
        expect(isMacroedWith(Yolo, 'otherProp')).toEqual(false);
        expect(isMacroedWith(Yolo.prototype, 'newProp')).toEqual(false);
        expect(isMacroedWith(Yolo.prototype, 'otherProp')).toEqual(false);

        // @ts-expect-error shush
        Yolo.prototype.__macros__.add('otherProp');
        // @ts-expect-error shush
        Yolo.__macros__.add('otherProp');

        expect(isMacroedWith(Yolo, 'newProp')).toEqual(false);
        expect(isMacroedWith(Yolo, 'otherProp')).toEqual(true);
        expect(isMacroedWith(Yolo, ['newProp', 'otherProp'])).toEqual(false);
        expect(isMacroedWith(Yolo.prototype, 'otherProp')).toEqual(true);
        expect(isMacroedWith(Yolo.prototype, 'newProp')).toEqual(false);
        expect(isMacroedWith(Yolo.prototype, ['newProp', 'otherProp'])).toEqual(false);

        // @ts-expect-error shush
        Yolo.prototype.__macros__.add('newProp');
        // @ts-expect-error shush
        Yolo.__macros__.add('newProp');

        expect(isMacroedWith(Yolo, 'newProp')).toEqual(true);
        expect(isMacroedWith(Yolo, 'otherProp')).toEqual(true);
        expect(isMacroedWith(Yolo, ['newProp', 'otherProp'])).toEqual(true);
        expect(isMacroedWith(Yolo.prototype, 'otherProp')).toEqual(true);
        expect(isMacroedWith(Yolo.prototype, 'newProp')).toEqual(true);
        expect(isMacroedWith(Yolo.prototype, ['newProp', 'otherProp'])).toEqual(true);
    });
});
