import { prefersReducedMotionNow } from "@/hooks/useReducedMotion";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

const IntroContext = createContext({ introReady: true, markIntroReady: () => {} });

export function IntroProvider({ children }) {
  const [introReady, setIntroReady] = useState(() => prefersReducedMotionNow());

  const markIntroReady = useCallback(() => setIntroReady(true), []);

  const value = useMemo(
    () => ({ introReady, markIntroReady }),
    [introReady, markIntroReady],
  );

  return <IntroContext.Provider value={value}>{children}</IntroContext.Provider>;
}

export function useIntro() {
  return useContext(IntroContext);
}
