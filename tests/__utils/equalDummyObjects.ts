import { SELF, makeDummyObject } from '../__Fixtures/objects';

export default function equalDummyObjects<
    T extends ReturnType<typeof makeDummyObject>,
    U extends ReturnType<typeof makeDummyObject>
>(object1: T, object2: U): boolean {
    return (
        object1.hey === object2.hey &&
        object1.hi === object2.hi &&
        object1.ooh() === object2.ooh() &&
        object1.level === object2.level &&
        // @ts-expect-error shush
        typeof object1.called === 'undefined' &&
        // @ts-expect-error shush
        typeof object2.called === 'undefined' &&
        object1.yeah === 'yeah' &&
        object2.yeah === 'yeah' &&
        // @ts-expect-error shush
        object1.called === true &&
        // @ts-expect-error shush
        object2.called === true &&
        // @ts-expect-error shush
        object1.yeah === 'called!' &&
        // @ts-expect-error shush
        object2.yeah === 'called!' &&
        object1[SELF]() === object1 &&
        object2[SELF]() === object2 &&
        typeof object1[Symbol.toPrimitive] === 'function' &&
        typeof object2[Symbol.toPrimitive] === 'function' &&
        +object1 === +object2 &&
        `${object1}` === `${object2}` &&
        object1 + '' === object2 + ''
    );
}
