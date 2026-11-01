export const ease = [0.22, 1, 0.36, 1];

export const softSpring = {
  type: "spring",
  stiffness: 220,
  damping: 26,
  mass: 0.9,
};

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.6, ease } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.6, ease } },
};

export function stagger(delayChildren = 0.05, staggerChildren = 0.08) {
  return {
    hidden: {},
    show: { transition: { delayChildren, staggerChildren } },
  };
}

export const pageTransition = {
  initial: { opacity: 0, y: 12 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.3, ease } },
};

export const viewportOnce = { once: true, amount: 0.25 };

export const pageMotion = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.28, ease },
};

export const listContainer = {
  animate: { transition: { staggerChildren: 0.05 } },
};

export const listItem = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};
