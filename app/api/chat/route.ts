import { NextResponse } from "next/server";
import { z } from "zod";

import { processUserMessage } from "@/lib/agent";
import { type ConversationState } from "@/lib/types";

const requestSchema = z.object({
  message: z.string().min(1),
  state: z.object({
    locale: z.enum(["english", "tanglish", "sinhala"]).default("english"),
    checkoutDraft: z
      .object({
        recipientName: z.string().optional(),
        recipientPhone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        giftMessage: z.string().optional(),
      })
      .optional(),
    cart: z
      .array(
        z.object({
          product: z.object({
            id: z.string(),
            name: z.string(),
            price: z.number(),
            currency: z.literal("LKR"),
            category: z.string(),
            description: z.string().optional(),
            stock: z.number().optional(),
            imageUrl: z.string().optional(),
          }),
          quantity: z.number().int().positive(),
        }),
      )
      .default([]),
  }),
});

export async function POST(request: Request) {
  try {
    const json = (await request.json()) as unknown;
    const parsed = requestSchema.parse(json);

    const state: ConversationState = {
      cart: parsed.state.cart,
      locale: parsed.state.locale,
      checkoutDraft: parsed.state.checkoutDraft,
    };

    const response = await processUserMessage({
      message: parsed.message,
      state,
    });

    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json(
      {
        reply: "Something broke while chatting with Kapruka Buddy. Please try again in a moment.",
        error: message,
      },
      { status: 400 },
    );
  }
}
