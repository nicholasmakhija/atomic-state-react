type AtomGetter<T> = () => T;

export type AtomSetter<T> = (newValue: T) => void;

export type AtomUpdater<T> = (newValue: T) => T;

export interface Atom<T> {
  id: string;
  get: AtomGetter<T>;
  set: AtomSetter<unknown>;
  subscribe: (callback: AtomSetter<T>) => () => void;
}

export type AtomReader<AtomType> = (
  get: <Target>(a: Atom<Target>) => Target
) => AtomType;

export interface StoreActions<T> {
  getId: () => string;
  getValue: AtomGetter<T>;
  setValue: AtomSetter<unknown>;
}
