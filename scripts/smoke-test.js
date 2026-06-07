/* eslint-disable no-console */

const BASE_URL = process.env.SMOKE_BASE_URL || "http://localhost:3000";

async function chat(message, state) {
  const response = await fetch(`${BASE_URL}/api/chat`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ message, state }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Request failed (${response.status}): ${body}`);
  }

  return response.json();
}

async function run() {
  let state = { cart: [], locale: "english" };

  const r1 = await chat("birthday cake", state);
  state = r1.state;

  const r2 = await chat("add P1001 x2", state);
  state = r2.state;

  const r3 = await chat("delivery quote to Kandy", state);
  state = r3.state;

  const r4 = await chat(
    "checkout name: Nimal Perera, phone: +94771234567, address: 12 Flower Road, Kandy, city: Kandy, gift: Happy Birthday",
    state,
  );
  state = r4.state;

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
