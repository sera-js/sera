import { describe, expect, it } from 'vitest';
import * as sera from '../src/sera.js';

describe('sera.js exports', () => {
    it('should export setSignal as a function', () => {
        expect(typeof sera.setSignal).toBe('function');
    });

    it('should export setEffect as a function', () => {
        expect(typeof sera.setEffect).toBe('function');
    });

    it('should export setMemo as a function', () => {
        expect(typeof sera.setMemo).toBe('function');
    });

    it('should export jsx as a function', () => {
        expect(typeof sera.jsx).toBe('function');
    });

    it('should export h as a function', () => {
        expect(typeof sera.h).toBe('function');
    });

    it('should export Fragment as a symbol', () => {
        expect(typeof sera.Fragment).toBe('symbol');
    });

    it('should export default as an object with all main functions', () => {
        expect(typeof sera.default).toBe('object');
        expect(typeof sera.default.setSignal).toBe('function');
        expect(typeof sera.default.setEffect).toBe('function');
        expect(typeof sera.default.setMemo).toBe('function');
        expect(typeof sera.default.jsx).toBe('function');
        expect(typeof sera.default.h).toBe('function');
        expect(typeof sera.default.Fragment).toBe('symbol');
    });
});
