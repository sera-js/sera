import { describe, it, expect, vi } from 'vitest';
import { setSignal, setEffect } from '../src/sera.js';

describe('setEffect', () => {
    it('should run the effect immediately', () => {
        const spy = vi.fn();
        setEffect(spy);
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should re-run the effect when a dependency changes', () => {
        const [get, set] = setSignal(1);
        const spy = vi.fn();
        setEffect(() => {
            get();
            spy();
        });
        expect(spy).toHaveBeenCalledTimes(1);
        set(2);
        expect(spy).toHaveBeenCalledTimes(2);
        set(3);
        expect(spy).toHaveBeenCalledTimes(3);
    });

    it('should track dependencies dynamically', () => {
        const [getA, setA] = setSignal(1);
        const [getB, setB] = setSignal(10);
        let useA = true;
        const spy = vi.fn();
        setEffect(() => {
            spy();
            if (useA) {
                getA();
            } else {
                getB();
            }
        });

        expect(spy).toHaveBeenCalledTimes(1);
        setA(2);
        expect(spy).toHaveBeenCalledTimes(2);
        useA = false;
        // Force effect to re-run and pick up new dependency
        setA(3); // This triggers the effect, which now tracks getB
        expect(spy).toHaveBeenCalledTimes(3);
        setB(20);
        expect(spy).toHaveBeenCalledTimes(4);
        setA(4); // Should not trigger effect now
        expect(spy).toHaveBeenCalledTimes(5);
    });

    it('should allow multiple effects to run independently', () => {
        const [get, set] = setSignal(0);
        const spy1 = vi.fn();
        const spy2 = vi.fn();
        setEffect(() => {
            get();
            spy1();
        });
        setEffect(() => {
            get();
            spy2();
        });
        expect(spy1).toHaveBeenCalledTimes(1);
        expect(spy2).toHaveBeenCalledTimes(1);
        set(1);
        expect(spy1).toHaveBeenCalledTimes(2);
        expect(spy2).toHaveBeenCalledTimes(2);
    });
});
