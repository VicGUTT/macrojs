/* eslint-disable @typescript-eslint/no-array-constructor */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

export const nil = () => [null, undefined];

export const booleans = () => [true, false];

export const integers = () => [0, 1, 999, +0, +1, +999, -0, -1, -999, 0x10];

export const floats = () => [0.5, 7.5, 67890.735, -0.5, -7.5, +67890.735, -67890.735];

export const numbers = () => [NaN, Infinity, ...integers(), ...floats()];

export const bigInts = () => [
    10n,
    9007199254740991n,
    BigInt(10),
    BigInt(9007199254740991),
    BigInt('10'),
    BigInt('9007199254740991'),
    BigInt('0x1fffffffffffff'),
    BigInt('0o377777777777777777'),
    BigInt('0b11111111111111111111111111111111111111111111111111111'),

    0n,

    -10n,
    -9007199254740991n,
    BigInt(-10),
    BigInt(-9007199254740991),
    BigInt('-10'),
    BigInt('-9007199254740991'),
];

export const strings = () => [
    '',
    ' ',
    'null',
    'undefined',
    '0',
    '1',
    '-0',
    '-1',
    '1.8',
    '-1.8',
    'true',
    'false',
    '[]',
    '{}',
    'Hey',

    String(),
    String('hey'),
];

export const symbols = () => [Symbol(), Symbol('hey')];

export const arrays = () => [
    [],
    [1, 2, 4.8],
    ['hey', '2.4'],
    [[]],
    [{}],
    [Map],
    [new Map()],

    Array(),
    Array('hey'),

    Object.assign([], { a: 1, b: 2 }),
];

export const elements = () => [
    document.createElement('a'),
    document.createElement('button'),
    document.createElement('div'),
    document.createElement('img'),
    document.createElement('input'),
    document.createElement('footer'),
    document.createElement('br'),
];

document.body.innerHTML = `
    <div></div>
    <div></div>
    <div></div>
`;

export const nodeLists = () => [
    document.querySelectorAll('a'), // empty
    document.querySelectorAll('div'), // length = 3
];

export const functions = () => [
    (): void => {},
    function(): void {},
    function hello(): void {},

    (): string => 'hey',
    function(): string {
        return 'hey';
    },
    function hello(): string {
        return 'hey';
    },

    Function(),
    new Function(),

    Function('hey'),
    new Function('hey'),
];

export const classes = () => [
    class Hello {},
    class Hello {
        hey = 'hi';
    },
    class Hello {
        hey(): string {
            return 'hi';
        }
    },
    class Hello {
        espanol = 'si hombre';
        hey(): string {
            return 'hi';
        }
    },
];

export const constructors = () => [
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

export const invokedConstructors = () => [
    Boolean(),
    Number(),
    String(),
    Array(),
    Function(),
    Date(),
];

export const instances = () => [
    new Boolean(),
    new Number(),
    new String(),
    new Array(),
    new Function(),
    new Map(),
    new Set(),
    new WeakMap(),
    new WeakSet(),
    new Date(),
    new Float32Array(),
    new Promise(() => {}),
    new (class Hey {})(),
    new Map().set('hey', 'hello'),
    new Set('hey'),
    new Event('hey'),
    new String('hey'),
    new Array('hey'),
    new Object('hey'),
    Object('hey'),
    ...classes().map((item) => new item()),
    ...constructors().map((item) => {
        try {
            // @ts-expect-error shush
            return new item();
        } catch (error) {
            return null;
        }
    }).filter(item => item && typeof item === 'object' && item.constructor !== Object && !Array.isArray(item))
];


export const objects = () => [
    Object(),
    new Object(),

    {},
    { constructor: 'foo' },
    { hey: undefined },
    { hey: null },
    { hey: '' },
    { hey: 'hello' },
    { hey: ['hello'] },
    // // Iterable (Implementing the "iterable protocol")
    // {
    //     [Symbol.iterator]: function(): unknown { return this; }
    // },
    // // Iterator (Implementing the "iterator protocol")
    // {
    //     next: function(): void {
    //         // ...
    //     },
    // },
    // Both  "iterable" & "iterator"
    {
        next: function(): void {
            // ...
        },
        [Symbol.iterator]: function(): unknown { return this; }
    },

    Object.create({ a: 1, b: 2 }),
    Object.create(null),
];

export const all = [
    nil(),
    booleans(),
    integers(),
    floats(),
    numbers(),
    bigInts(),
    strings(),
    symbols(),
    arrays(),
    elements(),
    nodeLists(),
    functions(),
    classes(),
    constructors(),
    invokedConstructors(),
    instances(),
    objects(),
];

export default {
    nil,
    booleans,
    integers,
    floats,
    numbers,
    bigInts,
    strings,
    symbols,
    arrays,
    elements,
    nodeLists,
    functions,
    classes,
    constructors,
    invokedConstructors,
    instances,
    objects,
};

/* eslint-enable @typescript-eslint/no-array-constructor */
/* eslint-enable @typescript-eslint/no-empty-function */
/* eslint-enable @typescript-eslint/explicit-module-boundary-types */
