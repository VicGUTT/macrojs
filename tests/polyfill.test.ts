import polyfill from '../src/polyfill';

describe('polyfill', () => {
    it('works', () => {
        class Arr {
            private _values: unknown[];

            constructor(values: unknown[]) {
                this._values = values;
            }

            at(index: number) {
                return this._values[index];
            }
            push(value: unknown) {
                this._values.push(value);
            }
        }

        const arr = new Arr([3, 4, 5, 'abc', 'def', true, new Map(), 'ghi']);

        polyfill(Arr, [
            // @ts-expect-error shush
            {},
            // @ts-expect-error shush
            {
                property: 'reverse',
                needed: true,
            },
            {
                property: 'pop',
                needed: true,
                implemention: null,
            },
            {
                property: 'concat',
                needed: true,
                implemention: undefined,
            },
            {
                property: 'indexOf',
                needed: true,
                implemention: 'yolo',
            },
            {
                property: 'shift',
                needed: false,
                implemention: Array.prototype.shift,
            },
            {
                property: 'filter',
                needed: true,
                get implemention() {
                    return Array.prototype.filter;
                },
            },
            {
                property: 'push',
                needed: true,
                get implemention() {
                    return 'Salt-N-Pepa - Push It | https://www.youtube.com/watch?v=vCadcBR95oU';
                },
            },
            {
                property: 'self1',
                needed: true,
                implemention: () => this,
            },
            {
                property: 'self2',
                needed: true,
                implemention: function () {
                    return this;
                },
            },
            {
                property: 'self3',
                needed: true,
                implemention() {
                    return this;
                },
            },
            {
                property: 'join',
                needed: true,
                implemention: function (separator?: string): string {
                    // @ts-expect-error shush
                    return this._values.filter((value: unknown) => typeof value === 'string').join(separator);
                },
            },
        ]);

        expect(Object.keys(Arr.prototype)).toEqual([
            'push',
            'pop',
            'concat',
            'indexOf',
            'filter',
            'self1',
            'self2',
            'self3',
            'join',
        ]);

        // @ts-expect-error shush
        expect(Arr.prototype.pop).toEqual(null);
        // @ts-expect-error shush
        expect(Arr.prototype.concat).toEqual(undefined);
        // @ts-expect-error shush
        expect(Arr.prototype.indexOf).toEqual('yolo');
        expect(Arr.prototype.push).toEqual('Salt-N-Pepa - Push It | https://www.youtube.com/watch?v=vCadcBR95oU');
        // @ts-expect-error shush
        expect(Arr.prototype.filter).toEqual(Array.prototype.filter);

        // @ts-expect-error shush
        expect(Arr.prototype.self1()).toEqual({});
        // @ts-expect-error shush
        expect(Arr.prototype.self2()).toEqual(Arr.prototype);
        // @ts-expect-error shush
        expect(Arr.prototype.self3()).toEqual(Arr.prototype);

        // @ts-expect-error shush
        expect(arr.pop).toEqual(null);
        // @ts-expect-error shush
        expect(arr.concat).toEqual(undefined);
        // @ts-expect-error shush
        expect(arr.indexOf).toEqual('yolo');
        expect(arr.push).toEqual('Salt-N-Pepa - Push It | https://www.youtube.com/watch?v=vCadcBR95oU');
        // @ts-expect-error shush
        expect(arr.filter).toEqual(Array.prototype.filter);

        // @ts-expect-error shush
        expect(arr.self1()).toEqual({});
        // @ts-expect-error shush
        expect(arr.self2()).toEqual(arr);
        // @ts-expect-error shush
        expect(arr.self3()).toEqual(arr);

        // @ts-expect-error shush
        expect(arr.join('---')).toEqual('abc---def---ghi');

        expect(arr.at(3)).toEqual('abc');

        polyfill(Arr, {
            property: 'at',
            needed: true,
            implemention(index: number) {
                // @ts-expect-error shush
                return this._values[index + 1];
            },
        });

        expect(arr.at(3)).toEqual('def');
        expect(arr.at(33)).toEqual(undefined);
    });
});
