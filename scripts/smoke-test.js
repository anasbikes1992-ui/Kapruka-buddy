/* eslint-disable no-console */

const BASE_URL = process.env.SMOKE_BASE_URL || "http://localhost:3000";

async function chat(message, state) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);

  const response = await fetch(`${BASE_URL}/api/chat`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ message, state }),
    signal: controller.signal,
  });

  clearTimeout(timer);

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Request failed (${response.status}): ${body}`);
  }

  return response.json();
}

async function run() {
  let state = { cart: [], locale: "english" };

  console.log("Step 1: search");
  const r1 = await chat("birthday cake", state);
  state = r1.state;

  console.log("Step 2: add item");
  const r2 = await chat("add P1001 x2", state);
  state = r2.state;

  console.log("Step 3: delivery quote");
  const r3 = await chat("delivery quote to Kandy", state);
  state = r3.state;

  console.log("Step 4: checkout");
  const r4 = await chat(
    "checkout name: Nimal Perera, phone: +94771234567, address: 12 Flower Road, Kandy, city: Kandy, gift: Happy Birthday",
    state,
  );
  state = r4.state;

  console.log("Step 5: tracking");
  const r5 = await chat("track ORD-123456", state);

  console.log("SEARCH_REPLY=", r1.reply);
  console.log("ADD_REPLY=", r2.reply);
  console.log("QUOTE_REPLY=", r3.reply);
  console.log("CHECKOUT_ORDER=", r4.checkout?.orderId ?? "none");
  console.log("CHECKOUT_LINK=", r4.checkout?.payLink ?? "none");
  console.log("TRACK_STATUS=", r5.tracking?.status ?? "none");
}

run().catch((error) => {
  console.error("SMOKE TEST FAILED:", error);
  process.exit(1);
});
