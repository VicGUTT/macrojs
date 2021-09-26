import is from '../src/is';
import isMacroable from '../src/is/isMacroable';
import isMacroed from '../src/is/isMacroed';
import isMacroedWith from '../src/is/isMacroedWith';
import isMacroabled from '../src/is/isMacroabled';
import macro from '../src/macro';
import mixin from '../src/mixin';
import polyfill from '../src/polyfill';
import macroable from '../src/macroable';
import defineProperty from '../src/defineProperty';
import defineProperties from '../src/defineProperties';
import assign from '../src/utils/assign';
import {
    is as _is,
    isMacroable as _isMacroable,
    isMacroed as _isMacroed,
    isMacroedWith as _isMacroedWith,
    isMacroabled as _isMacroabled,
    assign as _assign,
    macro as _macro,
    mixin as _mixin,
    polyfill as _polyfill,
    macroable as _macroable,
    defineProperty as _defineProperty,
    defineProperties as _defineProperties,
} from '../src';

describe('index', () => {
    it('works', () => {
        expect(_is).toEqual(is);
        expect(_isMacroable).toEqual(isMacroable);
        expect(_isMacroed).toEqual(isMacroed);
        expect(_isMacroedWith).toEqual(isMacroedWith);
        expect(_isMacroabled).toEqual(isMacroabled);
        expect(_assign).toEqual(assign);
        expect(_macro).toEqual(macro);
        expect(_mixin).toEqual(mixin);
        expect(_polyfill).toEqual(polyfill);
        expect(_macroable).toEqual(macroable);
        expect(_defineProperty).toEqual(defineProperty);
        expect(_defineProperties).toEqual(defineProperties);
    });
});
