// eslint-disable-next-line @typescript-eslint/ban-types
export default function getOwnPropertyKeys(value: object, excludeList: string[] = []): (string | symbol)[] {
    if (value === null || value === undefined) {
        return [];
    }

    return [...Object.getOwnPropertyNames(value), ...Object.getOwnPropertySymbols(value)].filter(
        (key) => !excludeList.includes(key as string)
    );
}
