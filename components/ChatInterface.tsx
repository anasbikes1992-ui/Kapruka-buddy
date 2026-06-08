"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, MessageCircleHeart, Send, ShoppingBasket, Volume2, Heart, Sliders } from "lucide-react";

import { CartDrawer } from "@/components/CartDrawer";
import { DeliveryQuoteCard } from "@/components/DeliveryQuote";
import { ProductCarousel } from "@/components/ProductCarousel";
import { VoiceButton } from "@/components/VoiceButton";
import { useWishlist } from "@/hooks/useWishlist";
import { usePriceFilter } from "@/hooks/usePriceFilter";
import {
	type ChatMessage,
	type ConversationState,
	type DeliveryQuote,
	type OrderResult,
	type Product,
} from "@/lib/types";

const QUICK_ACTIONS = [
	"Birthday gift ideas under 7000",
	"Show flower bundles",
	"delivery quote to Kandy",
	"Track ORD-123456",
];

function createMessage(role: ChatMessage["role"], content: string): ChatMessage {
	return {
		id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
		role,
		content,
		createdAt: Date.now(),
	};
}

function resolveLocale(messages: ChatMessage[]): ConversationState["locale"] {
	const joined = messages.map((message) => message.content).join(" ");
	if (/[\u0D80-\u0DFF]/.test(joined)) {
		return "sinhala";
	}

	if (/(machan|ane|hari|akka|malli)/i.test(joined)) {
		return "tanglish";
	}

	return "english";
}

export function ChatInterface() {
	const { wishlist, isInWishlist, toggleWishlist } = useWishlist();
	const { minPrice, maxPrice, handleMinPriceChange, handleMaxPriceChange, resetPrice, isFiltered } = usePriceFilter();
	const [showFilters, setShowFilters] = useState(false);
	const [messages, setMessages] = useState<ChatMessage[]>(() => {
		if (typeof window === "undefined") {
			return [
				createMessage(
					"assistant",
					"Ayubowan! I am Kapruka Buddy. Tell me what you want to send, your budget, or the occasion, and I will shortlist the best gifts.",
				),
			];
		}

		try {
			const stored = localStorage.getItem("kapruka-buddy-state");
			if (!stored) {
				return [
					createMessage(
						"assistant",
						"Ayubowan! I am Kapruka Buddy. Tell me what you want to send, your budget, or the occasion, and I will shortlist the best gifts.",
					),
				];
			}

			const parsed = JSON.parse(stored) as { messages?: ChatMessage[] };
			return parsed.messages?.length
				? parsed.messages
				: [
						createMessage(
							"assistant",
							"Ayubowan! I am Kapruka Buddy. Tell me what you want to send, your budget, or the occasion, and I will shortlist the best gifts.",
						),
					];
		} catch {
			return [
				createMessage(
					"assistant",
					"Ayubowan! I am Kapruka Buddy. Tell me what you want to send, your budget, or the occasion, and I will shortlist the best gifts.",
				),
			];
		}
	});
	const [input, setInput] = useState("");
	const [products, setProducts] = useState<Product[]>([]);
	const [deliveryQuote, setDeliveryQuote] = useState<DeliveryQuote | null>(null);
	const [checkout, setCheckout] = useState<OrderResult | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isCartOpen, setIsCartOpen] = useState(false);
	const [state, setState] = useState<ConversationState>(() => {
		if (typeof window === "undefined") {
			return { cart: [], locale: "english" };
		}

		try {
			const stored = localStorage.getItem("kapruka-buddy-state");
			if (!stored) {
				return { cart: [], locale: "english" };
			}

			const parsed = JSON.parse(stored) as { state?: ConversationState };
			return parsed.state ?? { cart: [], locale: "english" };
		} catch {
			return { cart: [], locale: "english" };
		}
	});

	useEffect(() => {
		localStorage.setItem(
			"kapruka-buddy-state",
			JSON.stringify({
				messages,
				state,
			}),
		);
	}, [messages, state]);

	const cartSummary = useMemo(() => {
		return state.cart.reduce(
			(acc, item) => ({
				quantity: acc.quantity + item.quantity,
				total: acc.total + item.product.price * item.quantity,
			}),
			{ quantity: 0, total: 0 },
		);
	}, [state.cart]);

	const speakText = useCallback((text: string) => {
		if (typeof window === "undefined" || !("speechSynthesis" in window)) {
			return;
		}

		const utterance = new SpeechSynthesisUtterance(text);
		utterance.lang = "en-LK";
		utterance.rate = 1.02;
		window.speechSynthesis.cancel();
		window.speechSynthesis.speak(utterance);
	}, []);

	const sendMessage = useCallback(
		async (messageText: string) => {
			const cleaned = messageText.trim();
			if (!cleaned || isLoading) {
				return;
			}

			const userMessage = createMessage("user", cleaned);
			const nextMessages = [...messages, userMessage];
			setMessages(nextMessages);
			setInput("");
			setIsLoading(true);

			try {
				const response = await fetch("/api/chat", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						message: cleaned,
						state: {
							...state,
							locale: resolveLocale(nextMessages),
						},
					}),
				});

				const data = (await response.json()) as {
					reply: string;
					products?: Product[];
					deliveryQuote?: DeliveryQuote;
					checkout?: OrderResult;
					state?: ConversationState;
				};

				setMessages((prev) => [...prev, createMessage("assistant", data.reply)]);

				if (data.products) {
					setProducts(data.products);
				}

				if (data.deliveryQuote) {
					setDeliveryQuote(data.deliveryQuote);
				}

				if (data.checkout) {
					setCheckout(data.checkout);
				}

				if (data.state) {
					setState(data.state);
				}
			} catch (error) {
				const errorMsg = error instanceof Error ? error.message : String(error);
				console.error("[Chat] Error:", errorMsg);
				
				setMessages((prev) => [
					...prev,
					createMessage(
						"assistant",
						"Looks like I hit a snag. Please check your internet connection and try again. 🌐",
					),
				]);
			} finally {
				setIsLoading(false);
			}
		},
		[isLoading, messages, state],
	);

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		void sendMessage(input);
	};

	const handleAddToCart = (product: Product) => {
		setState((previous) => {
			const existing = previous.cart.find((item) => item.product.id === product.id);
			if (!existing) {
				return {
					...previous,
					cart: [...previous.cart, { product, quantity: 1 }],
				};
			}

			return {
				...previous,
				cart: previous.cart.map((item) =>
					item.product.id === product.id
						? {
								...item,
								quantity: item.quantity + 1,
							}
						: item,
				),
			};
		});

		setMessages((previous) => [
			...previous,
			createMessage("assistant", `${product.name} added to your cart. Say checkout when you are ready.`),
		]);
	};

	// Filter products by price range
	const filteredProducts = useMemo(() => {
		if (!isFiltered) {
			return products;
		}
		return products.filter((p) => p.price >= minPrice && p.price <= maxPrice);
	}, [products, minPrice, maxPrice, isFiltered]);

	// Convert wishlist to Set for faster lookup
	const wishlistIds = useMemo(() => {
		return new Set(wishlist.map((p) => p.id));
	}, [wishlist]);

	return (
		<div className="app-shell relative mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-5 px-4 py-5 md:px-6">
			<header className="glass rounded-3xl p-4 md:p-5">
				<div className="flex flex-wrap items-center justify-between gap-4">
					<div>
						<p className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.2em] text-orange-700">
							<MessageCircleHeart className="h-4 w-4" />
							Kapruka Buddy
						</p>
						<h1 className="mt-2 text-2xl font-semibold md:text-3xl">Sri Lanka&apos;s AI shopping machan</h1>
						<p className="mt-1 max-w-2xl text-sm text-stone-600">
							Search, compare, add to cart, quote delivery, and checkout in one flow.
						</p>
					</div>

					<button
						type="button"
						onClick={() => setIsCartOpen(true)}
						className="inline-flex items-center gap-2 rounded-full border bg-white/80 px-4 py-2 text-sm font-medium transition hover:bg-white"
					>
						<ShoppingBasket className="h-4 w-4" />
						Cart {cartSummary.quantity > 0 ? `(${cartSummary.quantity})` : ""}
					</button>
				</div>
			</header>

			<main className="grid flex-1 gap-5 lg:grid-cols-[1.2fr_0.8fr]">
				<section className="glass flex min-h-[60vh] flex-col rounded-3xl p-4 md:p-5">
					<div className="mb-4 flex flex-wrap gap-2">
						{QUICK_ACTIONS.map((action) => (
							<button
								key={action}
								type="button"
								onClick={() => void sendMessage(action)}
								className="rounded-full border bg-white/75 px-3 py-1.5 text-xs font-medium transition hover:bg-white"
							>
								{action}
							</button>
						))}
					</div>

					<div className="flex-1 space-y-3 overflow-y-auto pr-1">
						<AnimatePresence initial={false}>
							{messages.map((message) => (
								<motion.div
									key={message.id}
									initial={{ opacity: 0, y: 14 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: 8 }}
									className={`max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-relaxed ${
										message.role === "assistant"
											? "glass mr-auto"
											: "ml-auto bg-orange-600 text-white shadow-md"
									}`}
								>
									<p>{message.content}</p>
									{message.role === "assistant" ? (
										<button
											type="button"
											onClick={() => speakText(message.content)}
											className="mt-2 inline-flex items-center gap-1 rounded-full border bg-white/70 px-2.5 py-1 text-xs font-medium text-stone-700 hover:bg-white"
										>
											<Volume2 className="h-3.5 w-3.5" />
											Speak
										</button>
									) : null}
								</motion.div>
							))}
						</AnimatePresence>

						{isLoading ? (
							<div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 text-sm text-stone-600">
								<Loader2 className="h-4 w-4 animate-spin" />
								Thinking...
							</div>
						) : null}
					</div>

					<form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2">
						<input
							type="text"
							value={input}
							onChange={(event) => setInput(event.target.value)}
							placeholder="Ask for gifts, add P1002, quote to Kandy, checkout..."
							className="h-11 flex-1 rounded-full border bg-white/85 px-4 text-sm outline-none ring-orange-400 transition focus:ring-2"
						/>
						<VoiceButton onTranscript={(text) => setInput(text)} />
						<button
							type="submit"
							disabled={isLoading}
							className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-orange-600 text-white transition hover:bg-orange-700 disabled:opacity-60"
						>
							<Send className="h-4 w-4" />
						</button>
					</form>
				</section>

				<section className="space-y-4">
					{/* Price Filter UI */}
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						className="glass rounded-3xl p-4"
					>
						<button
							type="button"
							onClick={() => setShowFilters(!showFilters)}
							className="flex w-full items-center justify-between rounded-lg font-medium transition hover:opacity-80"
						>
							<span className="flex items-center gap-2">
								<Sliders className="h-4 w-4" />
								Price Filter
								{isFiltered ? (
									<span className="ml-2 inline-block rounded-full bg-orange-600 px-2 py-0.5 text-xs text-white">
										Active
									</span>
								) : null}
							</span>
							<span className="text-sm">{showFilters ? "Hide" : "Show"}</span>
						</button>

						<AnimatePresence>
							{showFilters ? (
								<motion.div
									initial={{ opacity: 0, height: 0 }}
									animate={{ opacity: 1, height: "auto" }}
									exit={{ opacity: 0, height: 0 }}
									className="mt-4 space-y-4 border-t border-stone-200 pt-4 dark:border-stone-700"
								>
									<div>
										<label className="block text-sm font-medium">Min: LKR {minPrice.toLocaleString()}</label>
										<input
											type="range"
											min="0"
											max="20000"
											step="100"
											value={minPrice}
											onChange={(e) => handleMinPriceChange(Number(e.target.value))}
											className="w-full"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium">Max: LKR {maxPrice.toLocaleString()}</label>
										<input
											type="range"
											min="0"
											max="20000"
											step="100"
											value={maxPrice}
											onChange={(e) => handleMaxPriceChange(Number(e.target.value))}
											className="w-full"
										/>
									</div>
									{isFiltered ? (
										<button
											type="button"
											onClick={resetPrice}
											className="w-full rounded-lg border border-orange-600 px-3 py-2 text-sm font-medium text-orange-600 transition hover:bg-orange-50 dark:hover:bg-orange-950/20"
										>
											Reset filters
										</button>
									) : null}
								</motion.div>
							) : null}
						</AnimatePresence>
					</motion.div>

					{/* Wishlist Section */}
					{wishlist.length > 0 ? (
						<motion.div
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							className="glass rounded-3xl p-4"
						>
							<h2 className="flex items-center gap-2 font-semibold">
								<Heart className="h-4 w-4 fill-current text-red-600" />
								Wishlist ({wishlist.length})
							</h2>
							<div className="mt-2 space-y-1 text-xs text-stone-600 dark:text-stone-400">
								{wishlist.slice(0, 3).map((p) => (
									<div key={p.id} className="flex justify-between">
										<span>{p.name}</span>
										<span>LKR {p.price.toLocaleString()}</span>
									</div>
								))}
								{wishlist.length > 3 ? (
									<p className="pt-2 text-center text-stone-500">+{wishlist.length - 3} more</p>
								) : null}
							</div>
						</motion.div>
					) : null}

					<ProductCarousel
						products={filteredProducts}
						onAddToCart={handleAddToCart}
						onToggleWishlist={toggleWishlist}
						wishlistIds={wishlistIds}
					/>

					{deliveryQuote ? <DeliveryQuoteCard quote={deliveryQuote} /> : null}

					<section className="glass rounded-3xl p-4">
						<h2 className="text-lg font-semibold">Checkout Status</h2>
						{checkout ? (
							<div className="mt-3 space-y-2 text-sm">
								<p>
									Order: <span className="font-semibold">{checkout.orderId}</span>
								</p>
								<a
									className="inline-flex rounded-full bg-orange-600 px-4 py-2 font-medium text-white hover:bg-orange-700"
									href={checkout.payLink}
									target="_blank"
									rel="noreferrer"
								>
									Open secure pay link
								</a>
							</div>
						) : (
							<p className="mt-2 text-sm text-stone-600">
								Once you ask for checkout, Kapruka Buddy will create your guest order and show the pay link here.
							</p>
						)}
					</section>

					<section className="glass rounded-3xl p-4 text-sm">
						<h2 className="text-lg font-semibold">Cart Snapshot</h2>
						<p className="mt-2 text-stone-700">
							{cartSummary.quantity} item(s), subtotal LKR {cartSummary.total.toLocaleString()}
						</p>
					</section>
				</section>
			</main>

			<CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={state.cart} />
		</div>
	);
}
