import { randomUUID } from "node:crypto";

import {
  type DeliveryQuote,
  type OrderResult,
  type Product,
  type TrackingResult,
} from "@/lib/types";
import {
  filterByPrice,
  searchByCategory,
  searchProducts as utilSearchProducts,
} from "@/lib/search-utils";

const MOCK_PRODUCTS: Product[] = [
  {
    id: "P1001",
    name: "Chocolate Celebration Cake",
    price: 6900,
    currency: "LKR",
    category: "Cakes",
    stock: 24,
    imageUrl:
      "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&w=900&q=80",
    description: "Rich chocolate sponge with silky ganache.",
  },
  {
    id: "P1002",
    name: "Red Roses Gift Bundle",
    price: 8500,
    currency: "LKR",
    category: "Flowers",
    stock: 17,
    imageUrl:
      "https://images.unsplash.com/photo-1556801712-76c8eb07bbc9?auto=format&fit=crop&w=900&q=80",
    description: "Dozen roses with Ferrero gift box.",
  },
  {
    id: "P1003",
    name: "Kottu Night Family Pack",
    price: 4200,
    currency: "LKR",
    category: "Food",
    stock: 31,
    imageUrl:
      "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=900&q=80",
    description: "Chicken, cheese, and veg kottu combo for four.",
  },
  {
    id: "P1004",
    name: "Avurudu Kevili Hamper",
    price: 5600,
    currency: "LKR",
    category: "Seasonal",
    stock: 13,
    imageUrl:
      "https://images.unsplash.com/photo-1617103996702-96ff29b1c467?auto=format&fit=crop&w=900&q=80",
    description: "Traditional sweetmeats with kavum, kokis, and aluwa.",
  },
  {
    id: "P1005",
    name: "Luxury Fruit Basket",
    price: 7700,
    currency: "LKR",
    category: "Gifts",
    stock: 19,
    imageUrl:
      "https://images.unsplash.com/photo-1571575173700-afb9492e6a50?auto=format&fit=crop&w=900&q=80",
    description: "Premium imported and local fruits in a woven basket.",
  },
  {
    id: "P1006",
    name: "Birthday Spark Pack",
    price: 3900,
    currency: "LKR",
    category: "Party",
    stock: 40,
    imageUrl:
      "https://images.unsplash.com/photo-1464349153735-7db50ed83c84?auto=format&fit=crop&w=900&q=80",
    description: "Candles, balloons, confetti, and birthday topper set.",
  },
];

const MOCK_CITIES = [
  "Colombo",
  "Kandy",
  "Galle",
  "Kurunegala",
  "Negombo",
  "Matara",
  "Jaffna",
  "Batticaloa",
];

function readTextContent(content: unknown): string {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((entry) => {
        if (typeof entry === "string") {
          return entry;
        }

        if (typeof entry === "object" && entry && "text" in entry) {
          const text = (entry as { text?: string }).text;
          return typeof text === "string" ? text : "";
        }

        return "";
      })
      .join("\n");
  }

  return "";
}

function parsePayload<T>(payload: unknown, fallback: T | null): T | null {
  if (payload && typeof payload === "object") {
    return payload as T;
  }

  const text = readTextContent(payload);
  if (!text) {
    return fallback;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

async function postToolCall<T>(name: string, args: Record<string, unknown>): Promise<T | null> {
  const mcpUrl = process.env.KAPRUKA_MCP_URL;
  if (!mcpUrl) {
    console.warn(`[MCP] Endpoint not configured, using mock data`);
    return null;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000); // Increased from 8s to 12s

    const response = await fetch(mcpUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: randomUUID(),
        method: "tools/call",
        params: {
          name,
          arguments: args,
        },
      }),
      cache: "no-store",
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    if (!response.ok) {
      console.warn(`[MCP] Request failed with status ${response.status}, using mock data`);
      return null;
    }

    const json = (await response.json()) as {
      error?: { message?: string };
      result?: { content?: unknown; structuredContent?: unknown };
    };

    if (json.error) {
      console.warn(`[MCP] Error: ${json.error.message}, using mock data`);
      return null;
    }

    if (json.result?.structuredContent) {
      return parsePayload<T>(json.result.structuredContent, null as T | null);
    }

    if (json.result?.content) {
      return parsePayload<T>(json.result.content, null as T | null);
    }

    console.warn(`[MCP] No result in response, using mock data`);
    return null;
  } catch (error) {
    console.warn(`[MCP] Request failed: ${error instanceof Error ? error.message : String(error)}, using mock data`);
    return null;
  }
}

function mockSearchProducts(query: string): Product[] {
  // Use improved search utilities with fuzzy matching and multiple strategies
  const results = utilSearchProducts(MOCK_PRODUCTS, query);
  console.log(`[Search] Query: "${query}" → Found ${results.length} products`);
  return results;
}

function mockSearchByCategory(category: string): Product[] {
  const results = searchByCategory(MOCK_PRODUCTS, category);
  console.log(`[Search] Category: "${category}" → Found ${results.length} products`);
  return results;
}

function mockFilterByPrice(minPrice: number, maxPrice: number): Product[] {
  const results = filterByPrice(MOCK_PRODUCTS, minPrice, maxPrice);
  console.log(`[Search] Price range: LKR ${minPrice}-${maxPrice} → Found ${results.length} products`);
  return results;
}

function mockDelivery(city: string): DeliveryQuote {
  const cleanCity = city.trim();
  const isMetro = ["colombo", "negombo"].includes(cleanCity.toLowerCase());

  return {
    city: cleanCity,
    fee: isMetro ? 950 : 1450,
    eta: isMetro ? "Same day before 8 PM" : "Next day before 6 PM",
  };
}

export class KaprukaClient {
  async searchProducts(query: string): Promise<Product[]> {
    const live = await postToolCall<Product[]>("kapruka_search_products", { query });
    return live ?? mockSearchProducts(query);
  }

  async searchByCategory(category: string): Promise<Product[]> {
    const live = await postToolCall<Product[]>("kapruka_search_by_category", { category });
    return live ?? mockSearchByCategory(category);
  }

  async filterByPrice(minPrice: number, maxPrice: number): Promise<Product[]> {
    const live = await postToolCall<Product[]>("kapruka_filter_by_price", { minPrice, maxPrice });
    return live ?? mockFilterByPrice(minPrice, maxPrice);
  }

  async getProduct(productId: string): Promise<Product | null> {
    const live = await postToolCall<Product>("kapruka_get_product", { productId });
    if (live) {
      return live;
    }

    return MOCK_PRODUCTS.find((product) => product.id.toLowerCase() === productId.toLowerCase()) ?? null;
  }

  async listCategories(): Promise<string[]> {
    const live = await postToolCall<string[]>("kapruka_list_categories", {});
    if (live && live.length > 0) {
      return live;
    }

    return [...new Set(MOCK_PRODUCTS.map((product) => product.category))];
  }

  async listDeliveryCities(): Promise<string[]> {
    const live = await postToolCall<string[]>("kapruka_list_delivery_cities", {});
    return live && live.length > 0 ? live : MOCK_CITIES;
  }

  async checkDelivery(city: string, cartItems: Array<{ productId: string; quantity: number }>): Promise<DeliveryQuote> {
    const live = await postToolCall<DeliveryQuote>("kapruka_check_delivery", {
      city,
      items: cartItems,
    });

    return live ?? mockDelivery(city);
  }

  async createOrder(payload: {
    recipientName: string;
    recipientPhone: string;
    city: string;
    address: string;
    giftMessage?: string;
    items: Array<{ productId: string; quantity: number }>;
  }): Promise<OrderResult> {
    const live = await postToolCall<OrderResult>("kapruka_create_order", payload);
    if (live) {
      return live;
    }

    return {
      orderId: `ORD-${Math.floor(Math.random() * 900000 + 100000)}`,
      payLink: "https://www.kapruka.com/pay/mock-order",
    };
  }

  async trackOrder(orderId: string): Promise<TrackingResult> {
    const live = await postToolCall<TrackingResult>("kapruka_track_order", { orderId });
    if (live) {
      return live;
    }

    return {
      orderId,
      status: "In transit",
      latestUpdate: "Rider assigned. Delivery expected in 3-5 hours.",
    };
  }
}
