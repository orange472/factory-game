import React from "react";

/**
 * Use when state needs to be referenced in a function outside of useEffect
 * @param {Type} initialValue
 * @returns An array containing the state, dispatcher, and ref object
 */
export default function useStateRef<Type>(
  initialValue?: Type
): [
  value: Type,
  setValue: React.Dispatch<Type>,
  ref: React.MutableRefObject<Type>
] {
  const [value, setValue] = React.useState(initialValue as Type);

  const ref = React.useRef<Type>(value);

  React.useEffect(() => {
    ref.current = value;
  }, [value]);

  return [value, setValue, ref];
}
