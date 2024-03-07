# Introduction:

Atomic state management for React with a similar API similar to [Jotai](https://jotai.org/).

There are 3 main pieces:

## createAtom:

This function creates a piece of state.

```typescript
import { createAtom } from 'path/to/module';

const booleanAtom = createAtom(false);
const numberAtom = createAtom(100);
const stringAtom = createAtom('loading');
const objectAtom = createAtom({
  id: 007,
  name: {
    first: 'James',
    last: 'Bond'
  }
});
```

You can even create atoms dependent on other atoms, just pass a `get` function which will read the value of the dependant atom.

```typescript
import { createAtom } from 'path/to/module';

const salaryAtom = createAtom(100_000);
const bonusAtom = createAtom(10_000);
const totalSalaryAtom = createAtom(
  (get) => get(salaryAtom) + get(bonusAtom)
);

// or fetch some data
const starWarsSpaceShips = createAtom(() => 
  fetch('https://swapi.dev/api/starships')
    .then((res) => res.json())
);
const starWarsShipNames = createAtom(
  (get) => Object.keys(get(starWarsSpaceShips) ?? [])
);
```

## useAtom:

The `useAtom` hook consumes piece of state created by `createAtom`, it returns a tuple _(state, stateSetter)_ similar to React's useState which is used internally.

```typescript
import { createAtom, useAtom } from 'path/to/module';

const salaryAtom = createAtom(100_000);

const Input = () => {
  const [value, setValue] = useAtom(salaryAtom);

  const onChangeHandler = (e: Event) => {
    setValue((e.target as HTMLInputElement).valueAsNumber || 0);
  };

  return (
    <div>
      <input
        type='number'
        value={value}
        onChange={onChangeHandler}
      />
    <div>
  );
}
```

## useAtomValue:

Similar to the `useAtom` hook, but this function provides a read-only value.

```typescript
import { createAtom, useAtomValue } from 'path/to/module';

const salaryAtom = createAtom(100_000);

const DisplaySalary = () => {
  const value = useAtomValue(salaryAtom);

  return (
    <div>{ `$${value.toFixed(2)}` }<div>
  );
}
```



