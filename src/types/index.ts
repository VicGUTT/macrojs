/*
 *--------------------------------------------------------------------------
 * General Types
 *--------------------------------------------------------------------------
 *
 * Complementing the default, "everyday", global TypeScript types.
 */

export type AnyObject = Object; // eslint-disable-line @typescript-eslint/ban-types
export type AnyFunction = Function; // eslint-disable-line @typescript-eslint/ban-types

export type UnknownObject = Record<string | number | symbol, unknown>;
export type UnknownFunction = () => void;

/*
 *--------------------------------------------------------------------------
 * Domain specific Types
 *--------------------------------------------------------------------------
 */

export type Macroable = UnknownObject | UnknownFunction;
export type Macroed = { readonly __macros__: Set<string> };
export type PossiblyMacroedObject = Partial<Macroed>;

export type MacroOptions = {
    /**
     * Force replace existing properties and/or properties
     * previously added via macro.
     *
     * @default false
     */
    force?: boolean;
    /**
     * When the target is a function, should the new property be
     * added to the target's prototype or to the target directly,
     * essentially making it a static property.
     *
     * @default true
     */
    onFunctionPrototype?: boolean;
};
export type MacroProperties = unknown;
export type MacroCallback<T, P> =
    | ((propertyKey: AssignedPropertyKey, target: T | Macroable, properties: P, options: MacroOptions) => void)
    | null;

export type AssignedPropertyKey = string | symbol;
export type AssignedDescriptors = Record<string | symbol, PropertyDescriptor>;
export type AssignCallback =
    | ((
          propertyKey: AssignedPropertyKey,
          propertydescriptor: PropertyDescriptor | undefined,
          assignedDescriptors: AssignedDescriptors,
          index: number,
          propertyKeys: AssignedPropertyKey[]
      ) => false | void)
    | null;

export type PolyfillObject = {
    /**
     * The property/method name that should be registered onto the target.
     */
    readonly property: string;
    /**
     * Determined if the polyfill is needed. If `falsy`, the property/method will be discarded.
     */
    readonly needed: boolean;
    /**
     * The property/method implementation that should be registered for the given name.
     */
    readonly implemention: unknown;
};

export type MacroabledProperties = {
    __macros__: typeof Set;
    hasMacro: (name: string | symbol) => boolean;
    macro: (propertyName: string, propertyValue: unknown, options?: MacroOptions) => void;
    mixin: <T, P>(properties: P, callback?: MacroCallback<T, P>, options?: MacroOptions) => void;
};
export type Macroabled<T> = T extends Function // eslint-disable-line @typescript-eslint/ban-types
    ? {
          prototype: MacroabledProperties & T['prototype'];
      }
    : MacroabledProperties;
