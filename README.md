# AI Workspace — Chief Mind Assistant

An AI-powered personal workspace featuring a professional **Email Generator**, a streaming **AI Chat** assistant, and a **Smart Dashboard** — all wrapped in a Copilot-inspired glass-gradient UI.

Live: https://chief-mind-assistant.lovable.app

## Features

- ✉️ **Email Generator** — turn short instructions into polished emails. Pick tone (formal, friendly, persuasive, concise, etc.) and mode (generate, reply, rewrite, improve, shorten, expand). Copy, download, or save drafts locally.
- 💬 **AI Chat** — streaming chat assistant with persistent conversation history and suggested prompts.
- 📊 **Dashboard** — activity stats, quick actions, and your recent saved emails at a glance.
- 🎨 **Copilot Glass UI** — dark theme with sky-cyan (`#38bdf8`) and violet (`#a78bfa`) gradients and glassmorphism.
- 💾 **Local-first** — single user, no accounts. Emails and chats persist in `localStorage`.

## Tech Stack

- **Framework:** TanStack Start (React 19 + Vite 8, SSR-ready)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui + Radix primitives
- **AI:** Vercel `ai` SDK v7 + `@ai-sdk/react`, streamed via the **Lovable AI Gateway** (OpenAI-compatible)
- **Icons:** lucide-react

## Project Structure

```
src/
├── routes/
│   ├── __root.tsx           # App shell (sidebar + glass header)
│   ├── index.tsx            # Dashboard
│   ├── chat.tsx             # AI Chat
│   ├── email.tsx            # Email Generator
│   └── api/chat.ts          # Streaming chat endpoint
├── lib/
│   ├── ai-gateway.server.ts # Lovable AI Gateway provider
│   ├── email.functions.ts   # Server fn: generate emails
│   └── storage.ts           # useLocalStorage hook
├── components/
│   └── app-sidebar.tsx
└── styles.css               # Theme tokens + glass utility
```

## Getting Started

```bash
bun install
bun dev
```

Open http://localhost:8080.

### Build

```bash
bun run build      # production
bun run preview    # preview production build
```

## Environment

The app calls AI models through the Lovable AI Gateway. When running on Lovable, credentials are injected automatically. For local runs, set:

```
LOVABLE_API_KEY=your_key
```

## Deployment

Deployed via Lovable. Any push to `main` (Lovable ↔ GitHub two-way sync) redeploys the app.

## License

MIT
