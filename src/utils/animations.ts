
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility for merging class names
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Stagger children animations
export function stagger(delayMs = 50, from = 0) {
  return (i: number) => {
    return {
      animationDelay: `${from + i * delayMs}ms`,
    };
  };
}

// Animation variants for framer-motion (if we need them later)
export const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

export const fadeInRight = {
  hidden: { opacity: 0, x: 10 },
  visible: { opacity: 1, x: 0 }
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 }
};
