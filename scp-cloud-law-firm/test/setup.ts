import { vi } from "vitest";

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
// @ts-expect-error - test polyfill
global.ResizeObserver = ResizeObserverStub;

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),
});

// Radix Popper/pointer-capture APIs not implemented in jsdom
// @ts-expect-error - test polyfill
Element.prototype.hasPointerCapture = Element.prototype.hasPointerCapture ?? (() => false);
// @ts-expect-error - test polyfill
Element.prototype.setPointerCapture = Element.prototype.setPointerCapture ?? (() => {});
// @ts-expect-error - test polyfill
Element.prototype.releasePointerCapture = Element.prototype.releasePointerCapture ?? (() => {});
// @ts-expect-error - test polyfill
Element.prototype.scrollIntoView = Element.prototype.scrollIntoView ?? (() => {});
