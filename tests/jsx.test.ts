import { describe, it, expect, vi } from "vitest";
import { jsx, Fragment, setSignal } from "../src/sera.js";

describe("jsx", () => {
    it("should create a DOM element for a string type", () => {
        const el = jsx("div", { id: "test", children: "hello" });
        expect(el).toBeInstanceOf(HTMLElement);
        expect(el.tagName.toLowerCase()).toBe("div");
        expect(el.id).toBe("test");
        expect(el.textContent).toBe("hello");
    });

    it("should set properties and event listeners", () => {
        const onClick = vi.fn();
        const el = jsx("button", { className: "btn", onClick, children: "Click" });
        expect(el.className).toBe("btn");
        el.click();
        expect(onClick).toHaveBeenCalled();
    });

    it("should handle style as an object", () => {
        const el = jsx("div", {
            style: { color: "red", fontWeight: "bold" },
            children: "styled",
        });
        expect(el.style.color).toBe("red");
        expect(el.style.fontWeight).toBe("bold");
    });

    it("should support ref callback", () => {
        let refNode = null;
        const el = jsx("span", {
            ref: (el) => {
                refNode = el;
            },
            children: "ref",
        });
        expect(refNode).toBe(el);
    });

    it("should support Fragment", () => {
        const frag = jsx(Fragment, { children: ["a", "b"] });
        expect(frag).toBeInstanceOf(DocumentFragment);

        const texts = Array.from(frag.childNodes).map((n: any) => n.textContent);
        expect(texts).toEqual([
            "a",
            "b",
        ]);
    });

    it("should support function components", () => {
        function MyComp(props) {
            return jsx("div", { children: props.text });
        }
        const el = jsx(MyComp, { text: "component" });
        expect(el.textContent).toBe("component");
    });

    it("should handle nested elements", () => {
        const el = jsx("div", {
            children: [jsx("span", { children: "nested" }), " text"],
        });
        expect(el.textContent).toBe("nested text");
    });

    it("should support reactive children (function)", () => {
        const [getValue, setValue] = setSignal("A") as [
            () => string,
            (value: string) => void
        ];
        const el = jsx("div", { children: getValue });
        expect(el.textContent).toBe("A");
        setValue("B");
        // The effect system should update the DOM
        expect(el.textContent).toBe("B");
    });

    it("should render a Card component with props and children", () => {
        function Card({ title, children }) {
            return jsx("div", {
                className: "card",
                children: [
                    jsx("h2", { children: title }),
                    jsx("div", { className: "card-content", children }),
                ],
            });
        }
        const frag = jsx(Card, { title: "My Card", children: "Card content here" });
        // Card returns a div, but jsx wraps function components in a DocumentFragment
        // The first child is a comment, so find the first element node
        let el = null;
        for (const node of frag.childNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
                el = node;
                break;
            }
        }
        expect(el).not.toBeNull();
        const cardEl = el as unknown as HTMLElement;
        expect(cardEl.className).toBe("card");
        expect(cardEl.querySelector("h2")?.textContent).toBe("My Card");
        expect(cardEl.querySelector(".card-content")?.textContent).toBe(
            "Card content here"
        );
    });

    it("should render a CardComponent with props and handle button click", () => {
        // Simulate TSX/JSX with plain JS and sera's jsx

        function CardComponent(props) {
            const { title, content, onButtonClick } = props;
            return jsx("div", {
                className: "card",
                children: [
                    jsx("h2", { className: "card-title", children: title }),
                    jsx("p", { className: "card-content", children: content }),
                    jsx("button", {
                        className: "card-button",
                        onClick: onButtonClick,
                        children: "Click Me",
                    }),
                ],
            });
        }

        const onButtonClick = vi.fn();
        const frag = jsx(CardComponent, {
            title: "Test Title",
            content: "Test Content",
            onButtonClick,
        });
        // Find the card element in the fragment
        let card = null;
        for (const node of frag.childNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
                card = node;
                break;
            }
        }
        expect(card).not.toBeNull();
        const cardEl = card as unknown as HTMLElement;
        expect(cardEl.className).toBe("card");
        expect(cardEl.querySelector(".card-title")?.textContent).toBe("Test Title");
        expect(cardEl.querySelector(".card-content")?.textContent).toBe(
            "Test Content"
        );
        const button = cardEl.querySelector(".card-button");
        expect(button).not.toBeNull();
        (button as HTMLButtonElement).click();
        expect(onButtonClick).toHaveBeenCalled();
    });
});
