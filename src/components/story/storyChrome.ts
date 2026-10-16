type Listener = () => void;

let hidden = false;
const listeners = new Set<Listener>();

export function setStoryHeaderHidden(next: boolean) {
  if (hidden === next) return;
  hidden = next;
  listeners.forEach((listener) => listener());
}

export function subscribeStoryHeader(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

export function getStoryHeaderHidden() {
  return hidden;
}
