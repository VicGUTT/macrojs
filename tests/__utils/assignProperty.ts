export default function assignProperty<T, S>(target: T, source: S, propertyNames: PropertyKey | PropertyKey[]): T {
    if (!Array.isArray(propertyNames)) {
        propertyNames = [propertyNames];
    }

    return Object.defineProperties(
        target,
        propertyNames.reduce((acc, name) => {
            acc[name as string] = Object.getOwnPropertyDescriptor(source, name) as PropertyDescriptor;

            return acc;
        }, {} as PropertyDescriptorMap)
    );
}
