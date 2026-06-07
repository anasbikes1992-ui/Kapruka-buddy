# Kapruka Buddy

Kapruka Buddy is an immersive, Sri Lankan-flavored AI shopping companion built with Next.js, TypeScript, Tailwind, Framer Motion, and Kapruka MCP.
## Features

- Full-screen conversational shopping UI
- Product discovery cards and carousel
- Cart drawer with local persistence
- Delivery quote flow by city
- Guest checkout handoff with pay link
- Order tracking intent
- Voice input (Web Speech API) and assistant voice output
- English + Tanglish + Sinhala language heuristics

## Tech Stack
- Next.js 16 App Router + TypeScript
- Tailwind CSS v4 + shadcn setup metadata
- Framer Motion + Lucide
- Vercel AI SDK (`ai`) + OpenAI provider
- MCP HTTP tool calling wrapper

## Quick Start
1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env.local
```

3. Edit `.env.local` with your keys:
- `OPENAI_API_KEY`
- `OPENAI_MODEL` (default: `gpt-4o-mini`)
- `KAPRUKA_MCP_URL` (default: `https://mcp.kapruka.com/mcp`)
4. Run dev server:

```bash
npm run dev
```

5. Open http://localhost:3000

## Project Structure
- `app/page.tsx`: Main screen shell
- `app/api/chat/route.ts`: Agent endpoint
- `components/`: Chat, cards, carousel, cart, quote, voice UI
- `lib/mcp-client.ts`: MCP tool wrapper with mock fallback
- `lib/agent.ts`: Shopping agent flow logic
- `prompts/system.md`: Persona and behavior constraints
- `scripts/test-mcp.js`: MCP smoke test

## MCP Tool Mapping
Kapruka Buddy currently maps these tools:

- `kapruka_search_products`
- `kapruka_get_product`
- `kapruka_list_categories`
- `kapruka_list_delivery_cities`
- `kapruka_check_delivery`
- `kapruka_create_order`
- `kapruka_track_order`

If MCP is unavailable, the app falls back to local mock data so UI and flow remain testable.

## MCP Smoke Test

```bash
npm run test:mcp
```

The script calls categories, product search, and delivery cities and logs raw results.

## Notes

- For production, replace placeholder guest checkout details in `lib/agent.ts` with collected user inputs.
- For contest polish, refine the prompt in `prompts/system.md` and add robust language detection and ranking.
