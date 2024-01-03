import * as React from "react"

export default function useClickOutside(
  ref: React.MutableRefObject<any>,
  onClickOutside: (event: MouseEvent) => any
) {
  function handleClickOutside(event: MouseEvent) {
    if (ref.current && !ref.current.contains(event.target)) {
      onClickOutside(event);
    }
  }

  React.useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);
}