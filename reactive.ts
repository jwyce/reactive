type Effect = {
  execute: () => void;
  dependencies: Set<Set<Effect>>;
};
let context: Effect[] = [];

export function untrack(fn: () => void) {
  const prevContext = context;
  context = [];
  const res = fn();
  context = prevContext;
  return res;
}

function cleanup(observer: Effect) {
  for (const dep of observer.dependencies) {
    dep.delete(observer);
  }

  observer.dependencies.clear();
}

function subscribe(observer: Effect, subs: Set<Effect>) {
  subs.add(observer);
  observer.dependencies.add(subs);
}

export function createSignal<T>(
  value: T,
): [() => T, (v: T) => void] {
  const subscriptions = new Set<Effect>();

  const read = () => {
    const observer = context[context.length - 1];
    if (observer) subscribe(observer, subscriptions);
    return value;
  };

  const write = (newValue: T) => {
    value = newValue;
    for (const observer of [...subscriptions]) {
      observer.execute();
    }
  };

  return [read, write];
}

export function createEffect(fn: () => void) {
  const effect: Effect = {
    execute() {
      cleanup(effect);
      context.push(effect);
      fn();
      context.pop();
    },
    dependencies: new Set(),
  };

  effect.execute();
}

export function createMemo<T extends () => ReturnType<T>>(fn: T) {
  const [signal, setSignal] = createSignal(fn());
  createEffect(() => setSignal(fn()));
  return signal;
}
