export type AtomUpdater<T> = (newValue: T) => T;

export type AtomSetter<T> = (
  arg: T | AtomUpdater<T>
) => void;

export type StateDispatcher<T> = (newValue: T) => void;

export interface Atom<T> {
  id: string;
  get: () => T;
  set: AtomSetter<T>;
  subscribe: (callback: StateDispatcher<T>) => () => void;
}

export type AtomReader<AtomType> = (
  get: <Target>(a: Atom<Target>) => Target
) => AtomType;
