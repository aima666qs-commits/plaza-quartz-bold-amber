import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";

/** Нажатие: пружина Framer Motion без отскока. 160 мс, bounce 0, масштаб 0.975. */
export const pressSpring = { type: "spring" as const, duration: 0.16, bounce: 0 };

export function Tap({ children, ...props }: HTMLMotionProps<"button">) {
  const reduce = useReducedMotion();
  return (
    <motion.button
      type="button"
      {...props}
      whileTap={reduce ? undefined : { scale: 0.975 }}
      transition={pressSpring}
    >
      {children}
    </motion.button>
  );
}
