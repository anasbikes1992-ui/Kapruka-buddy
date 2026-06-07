"use client";

import { X } from "lucide-react";

import { type CartItem } from "@/lib/types";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
}

export function CartDrawer({ isOpen, onClose, items }: CartDrawerProps) {
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <aside
      className={`fixed right-0 top-0 z-50 h-full w-full max-w-md transform border-l bg-[var(--surface)] p-5 shadow-2xl transition-transform duration-300 sm:w-[380px] ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
      aria-hidden={!isOpen}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Your cart</p>
          <h2 className="text-2xl font-semibold">{count} items</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border p-2 transition hover:bg-stone-100"
          aria-label="Close cart"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-5 space-y-3 overflow-y-auto pr-1">
        {items.length === 0 ? (
          <p className="rounded-2xl border border-dashed p-4 text-sm text-stone-600">No items yet. Ask Kapruka Buddy for gift ideas and add by product code.</p>
        ) : (
          items.map((item) => (
            <div key={item.product.id} className="rounded-2xl bg-white/70 p-4">
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
            </div>
          ))
        )}
      </div>

      <div className="mt-5 rounded-2xl bg-white/70 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-stone-500">Subtotal</span>
          <span className="font-semibold">LKR {total.toLocaleString()}</span>
        </div>
      </div>
    </aside>
  );
}
