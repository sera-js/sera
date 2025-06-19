import { describe, it, expect } from 'vitest';
import { jsx, Fragment } from '../src/sera.js';

describe('Fragment', () => {
    it('should create a DocumentFragment', () => {
        const frag = jsx(Fragment, { children: ['a', 'b', 'c'] });
        expect(frag).toBeInstanceOf(DocumentFragment);
    });

    it('should contain all children as nodes', () => {
        const frag = jsx(Fragment, { children: ['a', 'b', 'c'] });
        const texts = Array.from(frag.childNodes).map((node: any) => node.textContent);
        expect(texts).toEqual(['a', 'b', 'c']);
    });

    it('should support nested fragments', () => {
        const frag = jsx(Fragment, {
            children: [
                'x',
                jsx(Fragment, { children: ['y', 'z'] })
            ]
        });
        const texts = Array.from(frag.childNodes).map((node: any) => node.textContent);
        expect(texts).toEqual(['x', 'y', 'z']);
    });

    it('should ignore null, undefined, and boolean children', () => {
        const frag = jsx(Fragment, { children: [null, undefined, false, 'ok'] });
        const texts = Array.from(frag.childNodes).map((node: any) => node.textContent);
        expect(texts).toEqual(['ok']);
    });
});
