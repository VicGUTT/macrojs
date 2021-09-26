import values from '../__Fixtures/values';
import isMacroed from '../../src/is/isMacroed';

describe('is:isMacroed', () => {
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

        expect(isMacroed(Yolo)).toEqual(false);
        expect(isMacroed(Yolo.prototype)).toEqual(false);

        Object.entries(values).forEach(([, items]) => {
            items()
                .filter((value) => value?.constructor !== Set)
                .forEach((value) => {
                    // @ts-expect-error shush
                    Yolo.prototype.__macros__ = value;
                    // @ts-expect-error shush
                    Yolo.__macros__ = value;

                    expect(isMacroed(Yolo)).toEqual(false);
                    expect(isMacroed(Yolo.prototype)).toEqual(false);
                });
        });

        expect(isMacroed(Yolo)).toEqual(false);
        expect(isMacroed(Yolo.prototype)).toEqual(false);

        // @ts-expect-error shush
        Yolo.prototype.__macros__ = new Set();

        expect(isMacroed(Yolo)).toEqual(false);
        expect(isMacroed(Yolo.prototype)).toEqual(true);

        // @ts-expect-error shush
        Yolo.__macros__ = new Set();
        // @ts-expect-error shush
        delete Yolo.prototype.__macros__;

        expect(isMacroed(Yolo)).toEqual(true);
        expect(isMacroed(Yolo.prototype)).toEqual(false);

        // @ts-expect-error shush
        Yolo.prototype.__macros__ = new Set();
        // @ts-expect-error shush
        Yolo.__macros__ = new Set();

        expect(isMacroed(Yolo)).toEqual(true);
        expect(isMacroed(Yolo.prototype)).toEqual(true);
    });

    it('works - bis', () => {
        Object.entries(values).forEach(([, items]) => {
            items().forEach((value) => {
                expect(isMacroed(value)).toEqual(false);

                if (!value || !['object', 'function'].includes(typeof value)) {
                    return;
                }

                Object.entries(values).forEach(([, _items]) => {
                    _items()
                        .filter((_value) => _value?.constructor !== Set)
                        .forEach((_value) => {
                            value.__macros__ = _value;

                            expect(isMacroed(value)).toEqual(false);
                        });
                });

                expect(isMacroed(value)).toEqual(false);

                value.__macros__ = new Set();

                expect(isMacroed(value)).toEqual(true);
            });
        });
    });
});
