const MCP_URL = process.env.KAPRUKA_MCP_URL || "https://mcp.kapruka.com/mcp";

async function callTool(name, args = {}) {
  const response = await fetch(MCP_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      method: "tools/call",
      params: {
        name,
        arguments: args,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${name}`);
  }

  return response.json();
}

async function main() {
  console.log("Testing MCP endpoint:", MCP_URL);

  const categories = await callTool("kapruka_list_categories");
  console.log("\n1) Categories:");
  console.dir(categories, { depth: 4 });

  const search = await callTool("kapruka_search_products", { query: "cake" });
  console.log("\n2) Search 'cake':");
  console.dir(search, { depth: 4 });

  const cities = await callTool("kapruka_list_delivery_cities");
  console.log("\n3) Delivery cities:");
  console.dir(cities, { depth: 4 });

  console.log("\nMCP smoke test complete.");
}

main().catch((error) => {
  console.error("MCP smoke test failed:", error.message);
  process.exit(1);
});
