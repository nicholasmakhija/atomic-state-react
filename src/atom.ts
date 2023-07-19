import { useEffect, useState } from 'react';

import type {
  Atom,
  AtomDerivedSetter,
  AtomGetter,
  AtomSetter,
  StoreActions
} from './types';

const isFunction = (value: unknown): boolean =>
  typeof value === 'function';

const dataStore = new Map();
const createStoreActions = <T>(value: T): StoreActions<T> => {
  const key = `atom-${dataStore.size}`;

  dataStore.set(key, value);

  return {
    getId: () => key,
    getValue: () => dataStore.get(key),
    setValue: (newValue) => {
      dataStore.set(key, newValue);
    }
  };
};

export function createAtom<T>(
  initialValue: T | AtomGetter<T>
): Atom<T> {
  const isComputed = isFunction(initialValue);
  const value = isComputed
    ? (undefined as T)
    : initialValue as T;

  const {
    getId,
    getValue,
    setValue
  } = createStoreActions(value);
  const subscribers = new Set<AtomSetter>();
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

  const computeValue = (): void => {
    const newValue = isComputed
      ? (initialValue as AtomGetter<T>)(get)
      : getValue();

    if (isFunction((newValue as Promise<T>).then)) {
      (newValue as Promise<T>).then(updateSubscribers);
    } else {
      updateSubscribers(newValue);
    }
  };

  if (isComputed) computeValue();

  return {
    id: getId(),
    get: getValue,
    set: (newValue) => {
      const nextValue = isFunction(newValue)
        ? (newValue as AtomDerivedSetter)(getValue())
        : newValue as T;

      updateSubscribers(nextValue);
    },
    subscribe: (callback) => {
      subscribers.add(callback as AtomSetter);

      return () => {
        subscribers.delete(callback as AtomSetter);
      };
    }
  };
}

export function useAtom<T>(atom: Atom<T>): [T, AtomSetter] {
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
