import { createEffect, createMemo, createSignal, untrack } from "./reactive";

const [count, setCount] = createSignal(0);
const [count2, setCount2] = createSignal(2);
// const [show, setShow] = createSignal(true);

const sum = createMemo(() => count() + count2());

createEffect(() => {
  console.log(untrack(() => count()));
});

setCount(10);
