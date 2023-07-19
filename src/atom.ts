import { useEffect, useState } from 'react';

import type {
  Atom,
  AtomReader,
  AtomSetter,
  AtomUpdater,
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
  initialValue: T | AtomReader<T>
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
  const subscribers = new Set<AtomSetter<T>>();
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
      ? (initialValue as AtomReader<T>)(get)
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
        ? (newValue as AtomUpdater<T>)(getValue())
        : newValue as T;

      updateSubscribers(nextValue);
    },
    subscribe: (callback) => {
      subscribers.add(callback as AtomSetter<T>);

      return () => {
        subscribers.delete(callback as AtomSetter<T>);
      };
    }
  };
}

export function useAtom<T>(atom: Atom<T>): [T, AtomSetter<unknown>] {
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
