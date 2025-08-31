import { useEffect } from "react";

// A custom hook that triggers `handler` when clicking outside the `ref` element
function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      // If clicking inside the element, do nothing
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      // Otherwise, trigger handler
      handler(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

export default useOnClickOutside;
