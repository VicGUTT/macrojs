# Easily assign properties and methods to an object/function

Ever wanted a piece of functionality on an object or function that doesn't exist?
Inspired by [Laravel](https://laravel.com/docs/master#meet-laravel), "macros" makes it a breeze to add on custom functionality to a given object or function.

Here's a quick example:

```js
import { is, macro } from '@vicgutt/macrojs';

const target = [];

is.macroed(target); // false

macro(target, 'isEmpty', function () {
    return this.length === 0;
});

is.macroed(target); // true

target.isEmpty(); // true
target.push(123);
target.isEmpty(); // false
```

## Installation

Install the package via NPM _(or yarn)_:

```bash
npm i @vicgutt/macrojs
```

```bash
yarn add @vicgutt/macrojs
```

**Note**: This library is very "future facing" in the code that is distributed _(dist folder)_, meaning it requires at least Node14+ and ES2020/ES2021 support from your JS compiler/bundler or browser.

## Available functions

<!-- {{ CONTENT }} -->

### • **assign** _([Source](https://github.com/VicGUTT/macrojs/blob/main/src/utils/assign.ts) | [Tests](https://github.com/VicGUTT/macrojs/blob/main/tests/utils/assign.test.ts))_

The `assign()` function copies all enumerable own properties from one source
object to a target object. It returns the modified target object.

Properties in the target object are overwritten by properties in the source
if they have the same key. Later source's properties overwrite earlier ones.

This function intends to work similarly but NOT identically to the native
`Object.assign()` method.

They differ in that this function does NOT invoke getters and setters but rather
copy their definition _(just like any other property)_ to the target object by
using `Object.getOwnPropertyDescriptor()` and `Object.defineProperties()`.

This function accepts a callback as 3rd argument.
If the callback returns`false`, the ongoing copying task will be interrupted but
previously copied properties will remain.

**Note**

-   Both String and Symbol properties are copied.
-   This function will throw on a non object target and on a `null` or `undefined` source.
-   Properties on the prototype chain and non-enumerable properties cannot be copied.
-   Functions and their prototype can be used as target and/or source.
-   If the source value is a reference to an object, it only copies the reference _(unsuitable for "deep cloning")_.

```js
import { assign } from '@vicgutt/macrojs';

const source = { name: 'Bob', age: 77 };

assign({}, source); // { name: 'Bob', age: 77 }
assign({}, source, () => {}); // { name: 'Bob', age: 77 }
assign({}, source, (propertyKey) => {
    if (propertyKey === 'age') {
        return false;
    }
}); // { name: 'Bob' }

assign({}, source, (propertyKey, propertydescriptor, assignedDescriptors, index, propertyKeys) => {
    assignedDescriptors[`--${String(propertyKey)}`] = {
        value: `${index} | ${String(propertyKey)} | ${propertyKeys}`,
        configurable: true,
        enumerable: propertyKey === 'name',
        writable: true,
    };
}); // { '--name': '0 | name | name,age', name: 'Bob', age: 77 }
```

### • **macro** _([Source](https://github.com/VicGUTT/macrojs/blob/main/src/macro.ts) | [Tests](https://github.com/VicGUTT/macrojs/blob/main/tests/macro.test.ts))_

Register a custom macro on a given target.

A `macro` is simply the term used to define custom properties
and methods that should be copied/cloned over into a given target.

A `macro` consist of a "name" _(the identifier)_ and a "value" _(the implementation)_.

This function, also called `macro` allows us to register a custom property on a given target.

It has the following signature:

-   **target** (`unknown`): The object/function onto which the new property/method should be added.
-   **propertyName** (`string`): The property/method name that should be registered onto the target.
-   **propertyValue** (`unknown`): The property/method implementation that should be registered for the given name.
-   **options** (`MacroOptions`):
    -   **force** (`boolean` | defaults to `false`): Force replace existing properties and/or properties previously added via macro.
    -   **onFunctionPrototype** (`boolean` | defaults to `true`): When the target is a function, should the new property be
        added to the target's prototype or to the target directly,
        essentially making it a static property.

```js
import { macro } from '@vicgutt/macrojs';

const target = [];

macro(target, 'hello', () => 'hello!');

target.hello(); // 'hello!'

macro(target, 'isEmpty', function () {
    return this.length === 0;
});

target.isEmpty(); // true
```

### • **mixin** _([Source](https://github.com/VicGUTT/macrojs/blob/main/src/mixin.ts) | [Tests](https://github.com/VicGUTT/macrojs/blob/main/tests/mixin.test.ts))_

Register a collection of macros on a given target.

This function, as opposed to the `macro()` function, allows us
to register multiple properties/methods at once on a given target.

It has the following signature:

-   **target** (`unknown`): The object/function onto which the new properties/methods should be added.
-   **properties** (`object`|`function`):
    -   If an object, the keys will be used for the property name and it's value for the property's implementation.
    -   If a function, all it's static and prototype enumerable own properties will be copied over onto the target.
-   **callback** (`function` | `null`): A function, when present, gives us full control over how we'd like the copying to proceed.
-   **options** (`MacroOptions`):
    -   **force** (`boolean` | defaults to `false`): Force replace existing properties and/or properties previously added via macro.
    -   **onFunctionPrototype** (`boolean` | defaults to `true`): When the target is a function, should the new property be
        added to the target's prototype or to the target directly,
        essentially making it a static property.

```js
import { mixin } from '@vicgutt/macrojs';

const target = [];

mixin(target, {
    hello: () => 'hello!',
    isEmpty() {
        return this.length === 0;
    },
});

target.hello(); // 'hello!'
target.isEmpty(); // true

mixin(
    { name: 'Bob', age: NaN },
    {
        isHuman: '🤔',
        isTroubleMaker: '👀',
    },
    (propertyKey, target, properties, options) => {
        console.log(propertyKey, target, properties, options);
    }
);

// isHuman { name: 'Bob', age: NaN } { isHuman: '🤔', isTroubleMaker: '👀' } { force: false, onFunctionPrototype: true }
// isTroubleMaker { name: 'Bob', age: NaN } { isHuman: '🤔', isTroubleMaker: '👀' } { force: false, onFunctionPrototype: true }
```

### • **polyfill** _([Source](https://github.com/VicGUTT/macrojs/blob/main/src/polyfill.ts) | [Tests](https://github.com/VicGUTT/macrojs/blob/main/tests/polyfill.test.ts))_

Register a collection of macros on a given target based on a defined condition.

It has the following signature:

-   **target** (`unknown`): The object/function onto which the new properties/methods should be added.
-   **objects** (`PolyfillObject` | `PolyfillObject[]`):
    -   **property** (`string`): The property/method name that should be registered onto the target.
    -   **needed** (`boolean`): Determines if the polyfill is needed. If `falsy`, the property/method will be discarded.
    -   **implemention** (`unknown`): The property/method implementation that should be registered for the given name.

```js
import { polyfill } from '@vicgutt/macrojs';

polyfill(Array.prototype, [
    {
        property: 'at',
        needed: !('at' in Array.prototype),
        implemention() {
            //
        },
    },
    {
        property: 'isEmpty',
        needed: !('isEmpty' in Array.prototype),
        implemention() {
            return this.length === 0;
        },
    },
    {
        property: 'isNotEmpty',
        needed: !('isNotEmpty' in Array.prototype),
        implemention() {
            return !this.isEmpty();
        },
    },
    {
        property: 'push',
        needed: true, // will overwrite the existing method
        implemention() {
            return 'hijacked 😱';
        },
    },
]);

[].isEmpty(); // true
[].isNotEmpty(); // false
[].push(123); // 'hijacked 😱'
['hey'].at(0); // 'hey'
['hey'].at(-1); // 'hey'
['hey'].at(1); // undefined
```

### • **macroable** _([Source](https://github.com/VicGUTT/macrojs/blob/main/src/macroable.ts) | [Tests](https://github.com/VicGUTT/macrojs/blob/main/tests/macroable.test.ts))_

Make an object/function "macroable".

A "macroable"d object or function is an object/function that implements
the following methods:

-   **hasMacro**: behaves exactly like the `isMacroedWith()` function, and where the "target" is the object/function itself.
-   **macro**: behaves exactly like the `macro()` function, and where the "target" is the object/function itself.
-   **mixin**: behaves exactly like the `mixin()` function, and where the "target" is the object/function itself.

```js
import { macroable } from '@vicgutt/macrojs';

class Week {}

macroable(Week);

Week.prototype.macro('totalDays', 7);
Week.prototype.mixin({
    days: ['monday', '...'],
    firstDay(country, _default = 'monday') {
        if (country === 'US') {
            return 'sunday';
        }

        if (country === 'FR') {
            return 'monday';
        }

        return _default;
    },
});

Week.prototype.hasMacro('totalDays'); // true
Week.prototype.hasMacro('days'); // true
Week.prototype.hasMacro('firstDay'); // true
Week.prototype.hasMacro('nope'); // false

Week.prototype.firstDay('FR'); // 'monday'
new Week().firstDay('FR'); // 'monday'
```

### • **defineProperty** _([Source](https://github.com/VicGUTT/macrojs/blob/main/src/defineProperty.ts) | [Tests](https://github.com/VicGUTT/macrojs/blob/main/tests/defineProperty.test.ts))_

This function is an alias of the [`macro`](#-macro-source--tests) function.

### • **defineProperties** _([Source](https://github.com/VicGUTT/macrojs/blob/main/src/defineProperties.ts) | [Tests](https://github.com/VicGUTT/macrojs/blob/main/tests/defineProperties.test.ts))_

This function is an alias of the [`mixin`](#-mixin-source--tests) function.

### • **is.macroable / isMacroable** _([Source](https://github.com/VicGUTT/macrojs/blob/main/src/is/isMacroable.ts) | [Tests](https://github.com/VicGUTT/macrojs/blob/main/tests/is/isMacroable.test.ts))_

Determines whether the given value is "macroable".

The term "macroable" is used to identify objects or
functions that can be extended using the `macro()`
and `mixin()` functions.

A value is considered "macroable" if:

-   The value is NOT null
-   The value is an object or a function
-   The value's extension is NOT prevented _`(Object.isExtensible(value) === true)`_
-   The value is NOT "sealed" _`(Object.isSealed(value) === false)`_
-   The value is NOT "frozen" _`(Object.isFrozen(value) === false)`_

```js
import { isMacroable } from '@vicgutt/macrojs';

isMacroable(null); // false
isMacroable('hello'); // false
isMacroable(Object.seal({})); // false
isMacroable([]); // true
isMacroable({}); // true
isMacroable(Array); // true
isMacroable(() => {}); // true
isMacroable(document.querySelectorAll('body')); // true
```

### • **is.macroabled / isMacroabled** _([Source](https://github.com/VicGUTT/macrojs/blob/main/src/is/isMacroabled.ts) | [Tests](https://github.com/VicGUTT/macrojs/blob/main/tests/is/isMacroabled.test.ts))_

Determines whether the given value is "macroabled".

The term "macroabled" is used to identify objects or
functions that have been extended using the `macroable()` function.
All "macroabled" values are both `macroable` and `macroed` values.

A value is considered "macroabled" if:

-   The value implements a `hasMacro` method, where the "target" is the value itself and that behaves exactly like the `isMacroedWith()` function.
-   The value implements a `macro` method, where the "target" is the value itself and that behaves exactly like the `macro()` function.
-   The value implements a `mixin` method, where the "target" is the value itself and that behaves exactly like the `mixin()` function.

```js
import { isMacroabled } from '@vicgutt/macrojs';

isMacroabled({ hasMacro() {}, macro() {}, mixin() {} }); // false
isMacroabled({ hasMacro: isMacroedWith, macro: macro, mixin: mixin }); // false
isMacroabled(macroable({})); // true
```

### • **is.macroed / isMacroed** _([Source](https://github.com/VicGUTT/macrojs/blob/main/src/is/isMacroed.ts) | [Tests](https://github.com/VicGUTT/macrojs/blob/main/tests/is/isMacroed.test.ts))_

Determines whether the given value is "macroed".

The term "macroed" is used to identify objects or
functions that have been extended using either the `macro()`
or the `mixin()` function.

```js
import { isMacroed } from '@vicgutt/macrojs';

const value = [];

// Example 1

mixin(Array, {});
mixin(value, {});

isMacroed(Array); // false
isMacroed(Array.prototype); // false
isMacroed(value); // false

// Example 2

mixin(Array, { yolo: 'best word ever!' });

isMacroed(Array); // false
isMacroed(Array.prototype); // true
isMacroed(value); // true

// Example 3

mixin(value, { yolo: 'best word ever!' });

isMacroed(Array); // false
isMacroed(Array.prototype); // false
isMacroed(value); // true
```

### • **is.macroedWith / isMacroedWith** _([Source](https://github.com/VicGUTT/macrojs/blob/main/src/is/isMacroedWith.ts) | [Tests](https://github.com/VicGUTT/macrojs/blob/main/tests/is/isMacroedWith.test.ts))_

Determines whether the given value has been "macroed"
with a set of given properties.

```js
import { isMacroedWith } from '@vicgutt/macrojs';

const value = [];

macro(value, 'prop1', 'value1');
mixin(value, {
    prop2: 'value2',
    prop3: 'value3',
});

isMacroedWith(value, 'prop1'); // true
isMacroedWith(value, ['prop1', 'prop2']); // true
isMacroedWith(value, ['prop1', 'prop2', 'prop3']); // true
isMacroedWith(value, ['prop1', 'prop2', 'prop3', 'prop4']); // false
isMacroedWith(value, 'prop'); // false
```

<!-- /{{ CONTENT }} -->

<!-- ## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information what has changed recently. -->

## Contributing

If you're interested in contributing to the project, please read our [contributing docs](https://github.com/VicGUTT/macrojs/blob/main/.github/CONTRIBUTING.md) **before submitting a pull request**.

The _"Available functions"_ portion of this README is generated by parsing each function's jsDoc.

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.
