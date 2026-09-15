type Registry = Pick<CustomElementRegistry, "get" | "define">;

/**
 * Defines the card's elements, and defines them again whenever the page swaps
 * in a different element registry.
 *
 * Some dashboard cards bring the scoped custom element registry polyfill, which
 * replaces `window.customElements` when it loads. Anything defined before that
 * is in the browser's registry but not in the new one, so Home Assistant cannot
 * find `vurio-card` and draws "Configuration error". Which loads first is a
 * race: over a fast local connection the card wins it.
 *
 * Checked once a second by identity only, so a registry that refuses an element
 * is not asked again.
 */
export function keepDefined(
  elements: [name: string, element: CustomElementConstructor][],
  registry: () => Registry = () => window.customElements,
  schedule: (check: () => void) => void = (check) => void setInterval(check, 1000),
): void {
  let seen: Registry | undefined;
  const check = () => {
    const current = registry();
    if (current === seen) return;
    seen = current;
    for (const [name, element] of elements) {
      if (current.get(name)) continue;
      try {
        current.define(name, element);
      } catch {
        // The constructor is already known to this registry; a subclass is a
        // new one with the same behaviour.
        try {
          current.define(name, class extends (element as new () => HTMLElement) {});
        } catch {
          // The name is taken by something else; nothing to do about that here.
        }
      }
    }
  };
  check();
  schedule(check);
}
