import { useEffect, useState } from 'react';

import type {
  Atom,
  AtomReader,
  AtomSetter,
  AtomUpdater,
  StateDispatcher,
  StoreActions
} from './types';

const isFunction = <T>(value: unknown): value is T =>
  typeof value === 'function';

const dataStore = new Map();
const createStoreActions = (): StoreActions => {
  const key = `atom-${dataStore.size}`;

  return {
    getId: () => key,
    getValue: () => dataStore.get(key),
    setValue: (newValue) => {
      dataStore.set(key, newValue);
    }
  };
};

export function createAtom<T>(
  initialValue: T | AtomReader<T>
): Atom<T> {
  const {
    getId,
    getValue,
    setValue
  } = createStoreActions();
  const isAtomGetter = isFunction<AtomReader<T>>(initialValue);
  const subscribers = new Set<StateDispatcher<T>>();
  const subscribed = new Set<string>();

  const updateSubscribers = (updatedValue: T): void => {
    setValue(updatedValue);

    subscribers.forEach((callback) => callback(updatedValue));
  };

  const get = <Target>(atom: Atom<Target>): Target => {
    let currentValue = atom.get();

    if (!subscribed.has(atom.id)) {
      subscribed.add(atom.id);

      atom.subscribe((newValue) => {
        if (currentValue !== newValue) {
          currentValue = newValue;

          computeValue();
        }
      });
    }

    return currentValue;
  };

  const computeValue = (): T => {
    const newValue = isAtomGetter ? initialValue(get) : getValue<T>();

    if (isFunction((newValue as Promise<T>).then)) {
      (newValue as Promise<T>).then(updateSubscribers);
    } else {
      updateSubscribers(newValue);
    }

    return newValue;
  };

  // set value when "atom" is created
  setValue(isAtomGetter ? computeValue() : initialValue);

  return {
    id: getId(),
    get: getValue,
    set: (newValue) => {
      const nextValue = isFunction<AtomUpdater<T>>(newValue)
        ? newValue(getValue())
        : newValue;

      updateSubscribers(nextValue);
    },
    subscribe: (callback) => {
      subscribers.add(callback);

      return () => {
        subscribers.delete(callback);
      };
    }
  };
}

export function useAtom<T>(atom: Atom<T>): [T, AtomSetter<T>] {
  const [value, setValue] = useState(atom.get());

  useEffect(() => {
    const unsubscribe = atom.subscribe(setValue);

    return unsubscribe;
  }, [atom]);

  return [value, atom.set];
}

export function useAtomValue<T>(atom: Atom<T>): T {
  const [value] = useAtom(atom);

  return value;
}
