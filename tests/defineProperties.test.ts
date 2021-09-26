import mixin from '../src/mixin';
import defineProperties from '../src/defineProperties';

describe('defineProperties', () => {
    it('works', () => {
        expect(defineProperties).toEqual(mixin);
    });
});
