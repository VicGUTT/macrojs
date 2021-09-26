import { AssignCallback, AnyFunction } from '../../src/types';
import assign from '../../src/utils/assign';

// eslint-disable-next-line @typescript-eslint/ban-types
export default function functionToObject<T>(value: AnyFunction, callback: AssignCallback = null): T {
    const result = {};

    assign(result, value, callback);

    if (value.prototype) {
        assign(result, value.prototype, callback);
    }

    return result as T;
}
