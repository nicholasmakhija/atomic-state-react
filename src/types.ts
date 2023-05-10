export type AtomDerivedSetter = <T>(newValue: T) => T;

export type AtomSetter = <T>(
  newValue: T | AtomDerivedSetter
) => void;

export interface Atom<T> {
  id: string;
  get: () => T;
  set: AtomSetter
  subscribe: (callback: (newValue: T) => void) => () => void;
}

export type AtomGetter<AtomType> = (
  get: <Target>(a: Atom<Target>) => Target
) => AtomType;

export interface StoreActions<T> {
  getId: () => string;
  getValue: () => T;
  setValue: (newValue: T) => void;
}
