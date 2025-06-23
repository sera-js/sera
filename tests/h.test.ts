import { describe, it, expect, vi } from 'vitest';
import { h, Fragment, setSignal } from '../src/sera.js';

describe('h', () => {
    it('should create a DOM element for a string type', () => {
        const el = h('div', { id: 'test' }, 'hello');
        expect(el).toBeInstanceOf(HTMLElement);
        expect(el.tagName.toLowerCase()).toBe('div');
        expect(el.id).toBe('test');
        expect(el.textContent).toBe('hello');
    });

    it('should set properties and event listeners', () => {
        const onClick = vi.fn();
        const el = h('button', { className: 'btn', onClick }, 'Click');
        expect(el.className).toBe('btn');
        el.click();
        expect(onClick).toHaveBeenCalled();
    });

    it('should handle style as an object', () => {
        const el = h('div', { style: { color: 'red', fontWeight: 'bold' } }, 'styled');
        expect(el.style.color).toBe('red');
        expect(el.style.fontWeight).toBe('bold');
    });

    it('should support ref callback', () => {
        let refNode = null;
        const el = h('span', { ref: (el) => { refNode = el; } }, 'ref');
        expect(refNode).toBe(el);
    });

    it('should support Fragment', () => {
        const frag = h(Fragment, null, 'a', 'b');
        expect(frag).toBeInstanceOf(DocumentFragment);
        expect(Array.from(frag.childNodes).map((n: any) => n.textContent)).toEqual(['a', 'b']);
    });

    it('should support function components', () => {
        function MyComp(props) {
            return h('div', null, props.text);
        }
        const el = h(MyComp, { text: 'component' });
        expect(el.textContent).toBe('component');
    });

    it('should support reactive children (function)', () => {
        const [getValue, setValue] = setSignal('A');
        const el = h('div', null, getValue);
        expect(el.textContent).toBe('A');
        setValue('B');
        expect(el.textContent).toBe('B');
    });
});
