"use client";

import { MapPin, Truck } from "lucide-react";
import { motion } from "framer-motion";

import { type DeliveryQuote } from "@/lib/types";
import { DESIGN_TOKENS, MOTION_VARIANTS, getMotionVariant } from "@/lib/design-tokens";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface DeliveryQuoteProps {
  quote: DeliveryQuote;
}

export function DeliveryQuoteCard({ quote }: DeliveryQuoteProps) {
  const prefersReducedMotion = useReducedMotion();
  const childVariant = getMotionVariant(MOTION_VARIANTS.staggerChild, prefersReducedMotion);

  return (
    <motion.section
      variants={childVariant}
      className="glass rounded-3xl p-4"
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: DESIGN_TOKENS.duration.base,
          ease: DESIGN_TOKENS.ease.out,
        }}
        className="flex items-center justify-between gap-3"
      >
        <h2 className="text-lg font-semibold">Delivery Quote</h2>
        <motion.div
          animate={prefersReducedMotion ? {} : { y: [0, -4, 0] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Truck className="h-5 w-5 text-orange-700 dark:text-orange-400" />
        </motion.div>
      </motion.div>
      <motion.div
        className="mt-3 grid grid-cols-2 gap-3 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: DESIGN_TOKENS.duration.base,
          delay: 0.1,
        }}
      >
        <motion.div
          whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
          className="rounded-2xl bg-white/70 p-3 transition-colors hover:bg-white dark:bg-stone-900/70 dark:hover:bg-stone-800/70"
        >
          <p className="text-xs uppercase tracking-[0.14em] text-stone-500 dark:text-stone-400">City</p>
          <p className="mt-1 inline-flex items-center gap-1 font-medium">
            <MapPin className="h-4 w-4" />
            {quote.city}
          </p>
        </motion.div>
        <motion.div
          whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
          className="rounded-2xl bg-white/70 p-3 transition-colors hover:bg-white dark:bg-stone-900/70 dark:hover:bg-stone-800/70"
        >
          <p className="text-xs uppercase tracking-[0.14em] text-stone-500 dark:text-stone-400">Fee</p>
          <p className="mt-1 font-medium text-orange-700 dark:text-orange-400">
            LKR {quote.fee.toLocaleString()}
          </p>
        </motion.div>
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: DESIGN_TOKENS.duration.base,
          delay: 0.2,
        }}
        className="mt-3 text-sm text-stone-700 dark:text-stone-300"
      >
        ETA: {quote.eta}
      </motion.p>
    </motion.section>
  );
}
