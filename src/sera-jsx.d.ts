import { JSX as SeraJSX } from "./sera";

declare global {
  namespace JSX {
    interface Element extends SeraJSX.Element {}
    interface IntrinsicElements extends SeraJSX.IntrinsicElements {}
  }
}

export {};
