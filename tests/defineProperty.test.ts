import macro from '../src/macro';
import defineProperty from '../src/defineProperty';

describe('defineProperty', () => {
    it('works', () => {
        expect(defineProperty).toEqual(macro);
    });
});
