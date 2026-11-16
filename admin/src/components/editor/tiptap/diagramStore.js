export function createDiagramStore(initial = []) {
  let diagrams = initial;
  const listeners = new Set();

  return {
    getSnapshot() {
      return diagrams;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    set(next) {
      if (next === diagrams) return;
      diagrams = next;
      listeners.forEach((listener) => listener());
    },
  };
}
