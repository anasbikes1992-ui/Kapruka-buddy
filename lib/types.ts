export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  currency: "LKR";
  category: string;
  description?: string;
  stock?: number;
  imageUrl?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface DeliveryQuote {
  city: string;
  fee: number;
  eta: string;
}

export interface OrderResult {
  orderId: string;
  payLink: string;
}

export interface TrackingResult {
  orderId: string;
  status: string;
  latestUpdate: string;
}

export interface ConversationState {
  cart: CartItem[];
  locale: "english" | "tanglish" | "sinhala";
  checkoutDraft?: {
    recipientName?: string;
    recipientPhone?: string;
    address?: string;
    city?: string;
    giftMessage?: string;
  };
}

export interface AgentResponse {
  reply: string;
  products?: Product[];
  cities?: string[];
  deliveryQuote?: DeliveryQuote;
  checkout?: OrderResult;
  tracking?: TrackingResult;
  state: ConversationState;
}
