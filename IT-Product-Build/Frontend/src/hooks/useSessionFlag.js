import { useCallback, useEffect, useState } from "react";

export function useSessionFlag(key) {
  const [ready, setReady] = useState(false);
  const [value, setValue] = useState(false);

  useEffect(() => {
    try {
      setValue(window.sessionStorage.getItem(key) === "1");
    } catch {
      setValue(false);
    }
    setReady(true);
  }, [key]);

  const mark = useCallback(() => {
    try {
      window.sessionStorage.setItem(key, "1");
    } catch (e) {
      console.log(e);
    }
    setValue(true);
  }, [key]);

  return { ready, value, mark };
}
