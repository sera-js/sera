declare module "sera" {
    /**
     * Creates a reactive signal with a getter and setter
     * @param value - Initial value of the signal
     * @returns A tuple containing a getter function and setter function
     */
    export function setSignal<T>(value: T): [() => T, (newValue: T | ((prev: T) => T)) => void];

    /**
     * Creates a side effect that automatically tracks reactive dependencies
     * @param fn - Function to run as an effect
     */
    export function setEffect(fn: () => void): void;

    /**
     * Creates a memoized value that updates when its dependencies change
     * @param fn - Function that computes the memoized value
     * @returns A getter function for the memoized value
     */
    export function setMemo<T>(fn: () => T): () => T;

    /**
     * Props for JSX components
     */
    interface Props {
        [key: string]: any;
        children?: any;
        ref?: (el: Element) => void;
    }

    /**
     * Fragment component for grouping elements without a wrapper
     * @param props - Component props
     * @returns DocumentFragment
     */
    export function Fragment(props: Props): DocumentFragment;

    /**
     * JSX factory function for creating DOM elements
     * @param type - Element tag name or component function
     * @param props - Element properties
     * @returns DOM element or component result
     */
    export function jsx<P extends Props = Props>(
        type: string | ((props: P) => any),
        props?: P
    ): Element | DocumentFragment | any;

    /**
     * Hyperscript function for creating DOM elements
     * @param type - Element tag name or component function
     * @param props - Element properties
     * @param children - Child elements
     * @returns DOM element or component result
     */
    export function h<P extends Props = Props>(
        type: string | ((props: P) => any),
        props?: P,
        ...children: any[]
    ): Element | DocumentFragment | any;

    /**
     * Default export containing all Sera.js functions
     */
    const sera: {
        setSignal: typeof setSignal;
        setEffect: typeof setEffect;
        setMemo: typeof setMemo;
        jsx: typeof jsx;
        h: typeof h;
        Fragment: typeof Fragment;
    };
}

export { }
