"use client";

import { MapPin, Truck } from "lucide-react";

import { type DeliveryQuote } from "@/lib/types";

interface DeliveryQuoteProps {
  quote: DeliveryQuote;
}

export function DeliveryQuoteCard({ quote }: DeliveryQuoteProps) {
  return (
    <section className="glass rounded-3xl p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Delivery Quote</h2>
        <Truck className="h-5 w-5 text-orange-700" />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl bg-white/70 p-3">
          <p className="text-xs uppercase tracking-[0.14em] text-stone-500">City</p>
          <p className="mt-1 inline-flex items-center gap-1 font-medium">
            <MapPin className="h-4 w-4" />
            {quote.city}
          </p>
        </div>
        <div className="rounded-2xl bg-white/70 p-3">
          <p className="text-xs uppercase tracking-[0.14em] text-stone-500">Fee</p>
          <p className="mt-1 font-medium text-orange-700">LKR {quote.fee.toLocaleString()}</p>
        </div>
      </div>
      <p className="mt-3 text-sm text-stone-700">ETA: {quote.eta}</p>
    </section>
  );
}
