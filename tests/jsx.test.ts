import { describe, it, expect, vi } from 'vitest';
import { jsx, Fragment, setSignal } from '../src/sera.js';

describe('jsx', () => {
    it('should create a DOM element for a string type', () => {
        const el = jsx('div', { id: 'test', children: 'hello' });
        expect(el).toBeInstanceOf(HTMLElement);
        expect(el.tagName.toLowerCase()).toBe('div');
        expect(el.id).toBe('test');
        expect(el.textContent).toBe('hello');
    });

    it('should set properties and event listeners', () => {
        const onClick = vi.fn();
        const el = jsx('button', { className: 'btn', onClick, children: 'Click' });
        expect(el.className).toBe('btn');
        el.click();
        expect(onClick).toHaveBeenCalled();
    });

    it('should handle style as an object', () => {
        const el = jsx('div', { style: { color: 'red', fontWeight: 'bold' }, children: 'styled' });
        expect(el.style.color).toBe('red');
        expect(el.style.fontWeight).toBe('bold');
    });

    it('should support ref callback', () => {
        let refNode = null;
        const el = jsx('span', { ref: (el) => { refNode = el; }, children: 'ref' });
        expect(refNode).toBe(el);
    });

    it('should support Fragment', () => {
        const frag = jsx(Fragment, { children: ['a', 'b'] });
        expect(frag).toBeInstanceOf(DocumentFragment);
        expect(Array.from(frag.childNodes).map((n: any) => n.textContent)).toEqual(['a', 'b']);
    });

    it('should support function components', () => {
        function MyComp(props) {
            return jsx('div', { children: props.text });
        }
        const el = jsx(MyComp, { text: 'component' });
        expect(el.textContent).toBe('component');
    });

    it('should handle nested elements', () => {
        const el = jsx('div', { children: [jsx('span', { children: 'nested' }), ' text'] });
        expect(el.textContent).toBe('nested text');
    });

    it('should support reactive children (function)', () => {
        const [getValue, setValue] = setSignal('A') as [() => string, (value: string) => void];
        const el = jsx('div', { children: getValue });
        expect(el.textContent).toBe('A');
        setValue('B');
        // The effect system should update the DOM
        expect(el.textContent).toBe('B');
    });
});
