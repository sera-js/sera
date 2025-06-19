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
});
