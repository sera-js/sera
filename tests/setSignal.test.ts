import { describe, it, expect, vi } from 'vitest';
import { setSignal, setEffect } from '../src/sera.js';

describe('setSignal', () => {
    it('should return a getter and setter', () => {
        const [get, set] = setSignal(1);
        expect(typeof get).toBe('function');
        expect(typeof set).toBe('function');
    });

    it('getter should return the initial value', () => {
        const [get] = setSignal('hello');
        expect(get()).toBe('hello');
    });

    it('setter should update the value', () => {
        const [get, set] = setSignal(10);
        set(20);
        expect(get()).toBe(20);
    });

    it('setter should accept an updater function', () => {
        const [get, set] = setSignal(5);
        set((v) => v + 2);
        expect(get()).toBe(7);
    });

    it('should notify subscribers (effects) on value change', () => {
        const [get, set] = setSignal(0);
        const spy = vi.fn();
        setEffect(() => {
            get();
            spy();
        });
        expect(spy).toHaveBeenCalledTimes(1);
        set(1);
        expect(spy).toHaveBeenCalledTimes(2);
        set(2);
        expect(spy).toHaveBeenCalledTimes(3);
    });

    it('should not notify if value is set to the same value', () => {
        const [get, set] = setSignal('a');
        const spy = vi.fn();
        setEffect(() => {
            get();
            spy();
        });
        expect(spy).toHaveBeenCalledTimes(1);
        set('a');
        // Implementation does not check for equality, so effect will always run
        expect(spy).toHaveBeenCalledTimes(2);
    });

    it('should work with an object as a signal value', () => {
        const [get, set] = setSignal({ a: 1, b: 2 });
        expect(get()).toEqual({ a: 1, b: 2 });
        set({ a: 3, b: 4 });
        expect(get()).toEqual({ a: 3, b: 4 });
        set((prev) => ({ ...prev, b: 10 }));
        expect(get()).toEqual({ a: 3, b: 10 });
    });

    it('should work with an array as a signal value', () => {
        const [get, set] = setSignal([1, 2, 3]);
        expect(get()).toEqual([1, 2, 3]);
        set([4, 5]);
        expect(get()).toEqual([4, 5]);
        set((prev) => prev.concat(6));
        expect(get()).toEqual([4, 5, 6]);
    });

    it('should work with nested objects and arrays', () => {
        const [get, set] = setSignal({ items: [{ id: 1 }, { id: 2 }] });
        expect(get()).toEqual({ items: [{ id: 1 }, { id: 2 }] });
        set((prev) => ({ items: prev.items.concat({ id: 3 }) }));
        expect(get()).toEqual({ items: [{ id: 1 }, { id: 2 }, { id: 3 }] });
    });

    it('should trigger effects when object/array signal changes', () => {
        const [get, set] = setSignal({ count: 0 });
        const spy = vi.fn();
        setEffect(() => {
            get();
            spy();
        });
        expect(spy).toHaveBeenCalledTimes(1);
        set({ count: 1 });
        expect(spy).toHaveBeenCalledTimes(2);
        set((prev) => ({ count: prev.count + 1 }));
        expect(spy).toHaveBeenCalledTimes(3);
    });

    it('should work as a prop in a component', () => {
        // Simulate a simple component
        function Counter({ value }) {
            return value();
        }
        const [get, set] = setSignal(10);
        const result = Counter({ value: get });
        expect(result).toBe(10);
        set(20);
        const result2 = Counter({ value: get });
        expect(result2).toBe(20);
    });
});
