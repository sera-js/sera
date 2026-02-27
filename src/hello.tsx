import { createElement } from "./sera";

type HelloProps = {
  name: string;
  children?: JSX.Element | string;
};

export default function Hello({ name, children }: HelloProps) {
  return (
    <h1>
      {name} {children}
    </h1>
  );
}
