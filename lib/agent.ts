import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

import { KaprukaClient } from "@/lib/mcp-client";
import {
  type AgentResponse,
  type CartItem,
  type ConversationState,
  type Product,
} from "@/lib/types";

const kaprukaClient = new KaprukaClient();

function detectLocale(text: string): ConversationState["locale"] {
  if (/[\u0D80-\u0DFF]/.test(text)) {
    return "sinhala";
  }

  const lower = text.toLowerCase();
  if (["machan", "ane", "hari", "akka", "malli"].some((token) => lower.includes(token))) {
    return "tanglish";
  }

  return "english";
}

function addToCart(cart: CartItem[], product: Product, quantity: number): CartItem[] {
  const existing = cart.find((item) => item.product.id === product.id);
  if (!existing) {
    return [...cart, { product, quantity }];
  }

  return cart.map((item) =>
    item.product.id === product.id
      ? {
          ...item,
          quantity: item.quantity + quantity,
        }
      : item,
  );
}

function summarizeCart(cart: CartItem[]): { count: number; total: number } {
  return cart.reduce(
    (acc, item) => ({
      count: acc.count + item.quantity,
      total: acc.total + item.product.price * item.quantity,
    }),
    { count: 0, total: 0 },
  );
}

async function getSystemPrompt(): Promise<string> {
  const path = join(process.cwd(), "prompts", "system.md");
  return readFile(path, "utf-8");
}

async function styleReply(base: string, locale: ConversationState["locale"]): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return base;
  }

  try {
    const systemPrompt = await getSystemPrompt();
    const model = openai(process.env.OPENAI_MODEL ?? "gpt-4o-mini");

    const { text } = await generateText({
      model,
      system: systemPrompt,
      prompt: `Locale: ${locale}\n\nTurn this shopping assistant summary into a warm and conversational user message:\n${base}`,
      temperature: 0.8,
    });

    return text.trim();
  } catch {
    return base;
  }
}

function extractCity(message: string, cities: string[]): string | null {
  const lower = message.toLowerCase();
  const match = cities.find((city) => lower.includes(city.toLowerCase()));
  return match ?? null;
}

function extractOrderId(message: string): string | null {
  const found = message.match(/ORD-\d{4,}/i);
  return found?.[0] ?? null;
}

function extractProductId(message: string): string | null {
  const found = message.match(/P\d{4,}/i);
  return found?.[0] ?? null;
}

function parseCheckoutDetails(message: string): ConversationState["checkoutDraft"] {
  const name = message.match(/name\s*:\s*([^,\n]+)/i)?.[1]?.trim();
  const phone = message.match(/phone\s*:\s*([^,\n]+)/i)?.[1]?.trim();
  const address = message.match(/address\s*:\s*([^\n]+)/i)?.[1]?.trim();
  const city = message.match(/city\s*:\s*([^,\n]+)/i)?.[1]?.trim();
  const giftMessage = message.match(/gift\s*:\s*([^\n]+)/i)?.[1]?.trim();

  return {
    recipientName: name,
    recipientPhone: phone,
    address,
    city,
    giftMessage,
  };
}

function hasValidPhone(value: string): boolean {
  const normalized = value.replace(/[\s-]/g, "");
  return /^\+94\d{9}$/.test(normalized) || /^0\d{9}$/.test(normalized);
}

export async function processUserMessage(input: {
  message: string;
  state: ConversationState;
}): Promise<AgentResponse> {
  const message = input.message.trim();
  const lower = message.toLowerCase();
  const locale = detectLocale(message) ?? input.state.locale;
  let nextState: ConversationState = {
    ...input.state,
    locale,
  };

  if (!message) {
    const reply = await styleReply("Tell me what gift vibe you want and I will find the best picks immediately.", locale);
    return { reply, state: nextState };
  }

  if (lower.includes("track")) {
    const orderId = extractOrderId(message);
    if (!orderId) {
      const reply = await styleReply("Share your order ID like ORD-123456 and I will track it for you.", locale);
      return { reply, state: nextState };
    }

    const tracking = await kaprukaClient.trackOrder(orderId);
    const reply = await styleReply(
      `Order ${tracking.orderId} is ${tracking.status}. Latest update: ${tracking.latestUpdate}`,
      locale,
    );

    return { reply, tracking, state: nextState };
  }

  if (
    !lower.includes("checkout") &&
    !lower.includes("place order") &&
    !lower.includes("pay") &&
    (lower.includes("city") || lower.includes("delivery cities") || lower.includes("where do you deliver"))
  ) {
    const cities = await kaprukaClient.listDeliveryCities();
    const reply = await styleReply(
      `We currently support deliveries to many cities including ${cities.slice(0, 8).join(", ")}. Tell me your city and I can quote instantly.`,
      locale,
    );

    return { reply, cities, state: nextState };
  }

  if (lower.includes("quote") || lower.includes("delivery fee") || lower.includes("shipping")) {
    if (nextState.cart.length === 0) {
      const reply = await styleReply("Add at least one product to cart first and then ask for the delivery quote.", locale);
      return { reply, state: nextState };
    }

    const cities = await kaprukaClient.listDeliveryCities();
    const city = extractCity(message, cities);
    if (!city) {
      const reply = await styleReply(
        `Tell me the city name for delivery. Popular options are ${cities.slice(0, 6).join(", ")}.`,
        locale,
      );
      return { reply, cities, state: nextState };
    }

    const deliveryQuote = await kaprukaClient.checkDelivery(
      city,
      nextState.cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
    );

    const summary = summarizeCart(nextState.cart);
    const reply = await styleReply(
      `Delivery to ${deliveryQuote.city} is LKR ${deliveryQuote.fee.toLocaleString()} and ETA is ${deliveryQuote.eta}. Cart total is LKR ${summary.total.toLocaleString()} for ${summary.count} item(s).`,
      locale,
    );

    return { reply, deliveryQuote, state: nextState };
  }

  if (lower.includes("checkout") || lower.includes("place order") || lower.includes("pay")) {
    if (nextState.cart.length === 0) {
      const reply = await styleReply("Your cart is empty right now. Let me find some gift options first.", locale);
      return { reply, state: nextState };
    }

    const incomingDraft = parseCheckoutDetails(message);
    const mergedDraft = {
      ...nextState.checkoutDraft,
      ...incomingDraft,
    };

    nextState = {
      ...nextState,
      checkoutDraft: mergedDraft,
    };

    if (!mergedDraft.recipientName || !mergedDraft.recipientPhone || !mergedDraft.address) {
      const reply = await styleReply(
        "Almost done. Please share checkout details in one line: name: <full name>, phone: <+94...>, address: <delivery address>, city: <city name>, gift: <optional message>.",
        locale,
      );
      return { reply, state: nextState };
    }

    if (!hasValidPhone(mergedDraft.recipientPhone)) {
      const reply = await styleReply(
        "Please provide a valid Sri Lankan phone number like +94771234567 or 0771234567.",
        locale,
      );
      return { reply, state: nextState };
    }

    const cities = await kaprukaClient.listDeliveryCities();
    const city =
      mergedDraft.city ??
      extractCity(message, cities) ??
      extractCity(mergedDraft.address, cities) ??
      "Colombo";

    const checkout = await kaprukaClient.createOrder({
      recipientName: mergedDraft.recipientName,
      recipientPhone: mergedDraft.recipientPhone,
      city,
      address: mergedDraft.address,
      giftMessage: mergedDraft.giftMessage ?? "Sent with Kapruka Buddy",
      items: nextState.cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
    });

    const summary = summarizeCart(nextState.cart);
    const reply = await styleReply(
      `Checkout ready. Order ${checkout.orderId} created for LKR ${summary.total.toLocaleString()}. Use the secure pay link to complete payment.`,
      locale,
    );

    return { reply, checkout, state: nextState };
  }

  if (lower.includes("add") || lower.includes("cart")) {
    const productId = extractProductId(message);
    if (!productId) {
      const reply = await styleReply("Tell me the product code like P1002 and quantity to add to cart.", locale);
      return { reply, state: nextState };
    }

    const product = await kaprukaClient.getProduct(productId);
    if (!product) {
      const reply = await styleReply(`I could not find ${productId}. Try a quick search and pick from those results.`, locale);
      return { reply, state: nextState };
    }

    const quantityMatch = message.match(/(?:x|qty|quantity)\s*(\d+)/i) ?? message.match(/\b(\d+)\b/);
    const quantity = quantityMatch ? Math.max(1, Number(quantityMatch[1])) : 1;

    nextState = {
      ...nextState,
      cart: addToCart(nextState.cart, product, quantity),
    };

    const summary = summarizeCart(nextState.cart);
    const reply = await styleReply(
      `${product.name} added x${quantity}. Cart now has ${summary.count} item(s), total LKR ${summary.total.toLocaleString()}.`,
      locale,
    );

    return { reply, state: nextState };
  }

  if (lower.includes("category") || lower.includes("categories")) {
    const categories = await kaprukaClient.listCategories();
    const reply = await styleReply(
      `Here are popular categories: ${categories.join(", ")}. Tell me what mood or budget and I will shortlist the best picks.`,
      locale,
    );
    return { reply, state: nextState };
  }

  const products = await kaprukaClient.searchProducts(message);

  if (products.length === 0) {
    const reply = await styleReply(
      "Aiyo, no exact matches right now. Try a broader keyword like cake, flowers, hamper, or birthday.",
      locale,
    );

    return { reply, products: [], state: nextState };
  }

  const top = products[0];
  const reply = await styleReply(
    `I found ${products.length} options. Top match is ${top.name} at LKR ${top.price.toLocaleString()}. Say 'add ${top.id}' to cart or ask for more ideas.`,
    locale,
  );

  return { reply, products, state: nextState };
}
