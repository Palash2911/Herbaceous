import { useEffect, useState } from "react";
import { useTheme } from "./useTheme";

const FALLBACK = {
  bg: "#F7F5FD",
  text: "#241B3A",
  muted: "#6B6482",
  accent: "#5B3BE8",
  coral: "#E8654B",
  teal: "#12A594",
  amber: "#D98A17",
};

const TOKENS = ["bg", "text", "muted", "accent", "coral", "teal", "amber"];

export function useThemeColors() {
  const { theme } = useTheme();
  const [colors, setColors] = useState(FALLBACK);

  useEffect(() => {
    const styles = getComputedStyle(document.documentElement);
    const next = { ...FALLBACK };
    for (const token of TOKENS) {
      const value = styles.getPropertyValue(`--${token}`).trim();
      if (value) next[token] = value;
    }
    setColors(next);
  }, [theme]);

  return colors;
}
