"use client";

import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { type CartItem } from "@/lib/types";
import { DESIGN_TOKENS, MOTION_VARIANTS, getMotionVariant } from "@/lib/design-tokens";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
}

export function CartDrawer({ isOpen, onClose, items }: CartDrawerProps) {
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const prefersReducedMotion = useReducedMotion();

  const drawerVariant = getMotionVariant(MOTION_VARIANTS.drawerSlide, prefersReducedMotion);
  const staggerVariant = getMotionVariant(MOTION_VARIANTS.staggerContainer, prefersReducedMotion);
  const childVariant = getMotionVariant(MOTION_VARIANTS.staggerChild, prefersReducedMotion);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DESIGN_TOKENS.duration.fast }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.aside
            variants={drawerVariant}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md border-l bg-[var(--surface)] p-5 shadow-2xl sm:w-[380px]"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
          >
            {/* Header */}
            <motion.div
              variants={childVariant}
              className="flex items-center justify-between"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Your cart</p>
                <h2 className="text-2xl font-semibold">{count} items</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border p-2 transition-colors hover:bg-stone-100 dark:hover:bg-stone-800"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </button>
            </motion.div>

            {/* Cart Items */}
            <motion.div
              className="mt-5 space-y-3 overflow-y-auto pr-1"
              variants={staggerVariant}
              initial="hidden"
              animate="visible"
            >
              {items.length === 0 ? (
                <motion.p
                  variants={childVariant}
                  className="rounded-2xl border border-dashed p-4 text-sm text-stone-600"
                >
                  No items yet. Ask Kapruka Buddy for gift ideas and add by product code.
                </motion.p>
              ) : (
                items.map((item) => (
                  <motion.div
                    key={item.product.id}
                    variants={childVariant}
                    className="rounded-2xl bg-white/70 p-4 dark:bg-stone-900/70"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{item.product.name}</p>
                        <p className="text-xs text-stone-500">{item.product.id}</p>
                      </div>
                      <p className="text-sm font-medium">x{item.quantity}</p>
                    </div>
                    <p className="mt-2 text-sm text-orange-700">
                      LKR {(item.product.price * item.quantity).toLocaleString()}
                    </p>
                  </motion.div>
                ))
              )}
            </motion.div>

            {/* Summary */}
            <motion.div
              variants={childVariant}
              className="mt-5 rounded-2xl bg-white/70 p-4 dark:bg-stone-900/70"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-500">Subtotal</span>
                <span className="font-semibold">LKR {total.toLocaleString()}</span>
              </div>
            </motion.div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
