/**
 * Design Token System
 * Central source of truth for all UI values
 * Follow ECC web/coding-style and web/design-quality standards
 */

export const DESIGN_TOKENS = {
  // Animation easings - cubic-bezier standard
  ease: {
    out: [0.22, 1, 0.36, 1] as const,
    spring: { type: "spring" as const, stiffness: 400, damping: 25 },
  },

  // Duration scales
  duration: {
    fast: 150,
    base: 300,
    slow: 500,
  },

  // Spacing scale (4px base)
  space: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "2.5rem",
    "3xl": "3rem",
  },

  // Radius
  radius: {
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    full: "9999px",
  },

  // Z-index layers
  zIndex: {
    base: 0,
    dropdown: 100,
    modal: 500,
    tooltip: 1000,
  },
} as const;

/**
 * Motion variants following ECC web/patterns#animation
 */
export const MOTION_VARIANTS = {
  // Page-level entry
  pageIn: {
    hidden: { opacity: 0, y: 32 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: DESIGN_TOKENS.duration.base,
        ease: DESIGN_TOKENS.ease.out,
      },
    },
    exit: {
      opacity: 0,
      y: -16,
      transition: { duration: DESIGN_TOKENS.duration.fast },
    },
  },

  // Stagger list
  staggerContainer: {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.07,
      },
    },
  },

  staggerChild: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: DESIGN_TOKENS.duration.base,
        ease: DESIGN_TOKENS.ease.out,
      },
    },
  },

  // Drawer slide from right
  drawerSlide: {
    hidden: { x: "100%" },
    visible: {
      x: 0,
      transition: {
        duration: DESIGN_TOKENS.duration.base,
        ease: DESIGN_TOKENS.ease.out,
      },
    },
    exit: {
      x: "100%",
      transition: { duration: DESIGN_TOKENS.duration.fast },
    },
  },

  // Smooth fade
  fadeInOut: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: DESIGN_TOKENS.duration.base },
    },
    exit: { opacity: 0, transition: { duration: DESIGN_TOKENS.duration.fast } },
  },

  // Scale pulse
  pulse: {
    initial: { scale: 1 },
    animate: { scale: 1.05 },
    transition: { duration: DESIGN_TOKENS.duration.fast, yoyo: Infinity },
  },
} as const;

/**
 * Reduce motion support - returns instant transitions when preferred
 */
export function getMotionVariant(
  variant: typeof MOTION_VARIANTS[keyof typeof MOTION_VARIANTS],
  prefersReducedMotion: boolean
) {
  if (!prefersReducedMotion) return variant;

  // Return instant versions
  return Object.entries(variant).reduce(
    (acc, [key, state]: [string, any]) => {
      if (typeof state !== "object" || state === null) return { ...acc, [key]: state };
      
      const { transition, ...props } = state as { transition?: any; [key: string]: any };
      return {
        ...acc,
        [key]: {
          ...props,
          transition: { duration: 0 },
        },
      };
    },
    {} as Record<string, any>
  );
}
