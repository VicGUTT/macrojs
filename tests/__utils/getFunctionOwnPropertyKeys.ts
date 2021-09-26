import { DEFAULT_FUNCTION_PROPERTIES } from '../../src/constants/functionDefaultProperties';
import getOwnPropertyKeys from './getOwnPropertyKeys';

// eslint-disable-next-line @typescript-eslint/ban-types
export default function getFunctionOwnPropertyKeys(value: Function, withoutDefaults = false): (string | symbol)[] {
    const keys = [...getOwnPropertyKeys(value), ...getOwnPropertyKeys(value.prototype)];

    return withoutDefaults ? keys.filter((key) => !DEFAULT_FUNCTION_PROPERTIES.includes(key as string)) : keys;
}
