const SELF = Symbol('self');

const makeDummyClass = () => { // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
    return class Dummy {
        hey = 'hey';
        state = {
            level: 7,
        };
        static hi() {
            return 'hi';
        }
        ooh() {
            return 'ooh';
        }
        set level(value: number) {
            if (!this.state) {
                return;
            }

            this.state.level = value * 2;
        }
        get level() {
            return this.state?.level;
        }
        get yeah() {
            // @ts-expect-error shush
            if (this.called) {
                return 'called!';
            }

            // @ts-expect-error shush
            this.called = true;

            return 'yeah';
        }
        [SELF]() {
            return this;
        }
        [Symbol.toPrimitive](hint: string) {
            if (hint === 'number') {
                return 42;
            }

            if (hint === 'string') {
                return '---';
            }

            return '🤷‍♂️';
        }
    };
};
const makeDummyObject = () => { // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
    return {
        hey: 'hey',
        hi: 'hi',
        state: {
            level: 7,
        },
        ooh() {
            return 'ooh';
        },
        set level(value: number) {
            this.state.level = value * 2;
        },
        get level() {
            return this.state.level;
        },
        get yeah() {
            // @ts-expect-error shush
            if (this.called) {
                return 'called!';
            }

            // @ts-expect-error shush
            this.called = true;

            return 'yeah';
        },
        [SELF]() {
            return this;
        },
        [Symbol.toPrimitive](hint: string) {
            if (hint === 'number') {
                return 42;
            }

            if (hint === 'string') {
                return '---';
            }

            return '🤷‍♂️';
        },
    };
};
// const makeDummyFunction = () => { // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
//     function DummyFunction(): void {
//         // @ts-expect-error shush
//         this.hey = 'hey';
//         // @ts-expect-error shush
//         this.state = {
//             level: 7,
//         };
//     }

//     DummyFunction.hi = function () {
//         return 'hi';
//     }

//     DummyFunction.prototype.ooh = function() {
//         return 'ooh';
//     }
//     DummyFunction.prototype[SELF] = function() {
//         return this;
//     }
//     DummyFunction.prototype[Symbol.toPrimitive] = function(hint: string) {
//         if (hint === 'number') {
//             return 42;
//         }

//         if (hint === 'string') {
//             return '---';
//         }

//         return '🤷‍♂️';
//     }

//     Object.defineProperty(DummyFunction.prototype, 'level', {
//         set(value: number) {
//             if (!this.state) {
//                 return;
//             }

//             this.state.level = value * 2;
//         },
//         get() {
//             return this.state?.level;
//         }
//     });
//     Object.defineProperty(DummyFunction.prototype, 'yeah', {
//         get() {
//             if (this.called) {
//                 return 'called!';
//             }

//             this.called = true;

//             return 'yeah';
//         }
//     });

//     return DummyFunction;
// };

const DummyClass = makeDummyClass();
const DummyObject = makeDummyObject();
// const DummyFunction = makeDummyFunction();

export {
    SELF,
    makeDummyClass,
    makeDummyObject,
    // makeDummyFunction,
    DummyClass,
    DummyObject,
    // DummyFunction,
 };