export const createStore = (
  dataStore = new Map()
) => (key = `atom-${dataStore.size}`) => ({
  getId: (): string => key,
  getValue: <T>(): T => dataStore.get(key),
  setValue: <T>(newValue: T): void => {
    dataStore.set(key, newValue);
  }
});

export const isFunction = <T>(value: unknown): value is T =>
  typeof value === 'function';
