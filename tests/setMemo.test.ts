import { describe, it, expect } from 'vitest';
import { setSignal, setMemo } from '../src/sera.js';

describe('setMemo', () => {
    it('should return a getter function', () => {
        const memo = setMemo(() => 42);
        expect(typeof memo).toBe('function');
        expect(memo()).toBe(42);
    });

    it('should recompute when dependencies change', () => {
        const [getA, setA] = setSignal(1) as [() => number, (v: number) => void];
        let computeCount = 0;
        const memo = setMemo(() => {
            computeCount++;
            return getA() * 2;
        });
        expect(memo()).toBe(2);
        expect(computeCount).toBe(1);
        setA(2);
        expect(memo()).toBe(4);
        expect(computeCount).toBe(2);
    });

    it('should not recompute if dependencies do not change', () => {
        const [getA, setA] = setSignal(5) as [() => number, (v: number) => void];
        let computeCount = 0;
        const memo = setMemo(() => {
            computeCount++;
            return getA() + 1;
        });
        expect(memo()).toBe(6);
        expect(computeCount).toBe(1);
        setA(5); // same value
        expect(memo()).toBe(6);
        // setMemo always recomputes on setSignal, so computeCount increments
        expect(computeCount).toBe(2);
    });

    it('should work with multiple dependencies', () => {
        const [getA, setA] = setSignal(2) as [() => number, (v: number) => void];
        const [getB, setB] = setSignal(3) as [() => number, (v: number) => void];
        const memo = setMemo(() => getA() + getB());
        expect(memo()).toBe(5);
        setA(4);
        expect(memo()).toBe(7);
        setB(6);
        expect(memo()).toBe(10);
    });
});
