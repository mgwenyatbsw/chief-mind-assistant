import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { Chat, DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { Send, Sparkles, Trash2, User, Bot, StopCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "copilot.chat.messages";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Chat — Copilot" },
      { name: "description", content: "Chat with Copilot, your AI workplace assistant." },
    ],
  }),
  component: ChatPage,
});

const suggestions = [
  "Summarize the key points of my last meeting notes.",
  "Draft a project update email for stakeholders.",
  "Brainstorm 5 ways to improve our onboarding flow.",
  "Explain OKRs simply, with an example.",
];

function ChatPage() {
  // One-time hydration from localStorage (client-only)
  const [initial] = useState<UIMessage[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as UIMessage[]) : [];
    } catch {
      return [];
    }
  });
  const [resetKey, setResetKey] = useState(0);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const chat = useMemo(
    () =>
      new Chat<UIMessage>({
        id: `copilot-${resetKey}`,
        transport: new DefaultChatTransport({ api: "/api/chat" }),
        messages: resetKey === 0 ? initial : [],
      }),
    [resetKey, initial],
  );

  const { messages, sendMessage, status, stop } = useChat({ chat });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, [status, resetKey]);

  const isBusy = status === "submitted" || status === "streaming";

  const handleSend = async (text?: string) => {
    const value = (text ?? input).trim();
    if (!value || isBusy) return;
    setInput("");
    await sendMessage({ text: value });
  };

  const handleClear = () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setResetKey((k) => k + 1);
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-56px)] max-w-4xl flex-col px-4 py-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">
            <span className="gradient-text">Copilot</span> Chat
          </h1>
          <p className="text-xs text-muted-foreground">
            Your work assistant · remembers the current conversation
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={handleClear} disabled={messages.length === 0}>
          <Trash2 className="mr-1 h-4 w-4" /> Clear
        </Button>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto rounded-2xl border border-border/50 bg-background/30 p-4 backdrop-blur-xl"
      >
        {messages.length === 0 ? (
          <div className="mx-auto flex h-full max-w-xl flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl gradient-brand shadow-glow">
              <Sparkles className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-semibold">How can I help today?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Draft, brainstorm, summarize, plan — just ask.
            </p>
            <div className="mt-6 grid w-full gap-2 sm:grid-cols-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="rounded-xl border border-border/60 bg-card/40 p-3 text-left text-sm transition-all hover:border-accent/50 hover:bg-card/70"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
            {status === "submitted" && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground animate-fade-in">
                <Bot className="h-4 w-4 text-accent" />
                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-accent" />
                Thinking…
              </div>
            )}
          </div>
        )}
      </div>

      <Card className="glass mt-3 border-border/60 p-3">
        <div className="flex items-end gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask Copilot anything…"
            className="min-h-[52px] resize-none border-0 bg-transparent focus-visible:ring-0"
          />
          {isBusy ? (
            <Button size="icon" variant="secondary" onClick={() => stop()}>
              <StopCircle className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              size="icon"
              onClick={() => handleSend()}
              disabled={!input.trim()}
              className="gradient-brand"
            >
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

function MessageBubble({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";
  const text = message.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join("");

  return (
    <div className={cn("flex gap-3 animate-fade-in", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          isUser ? "bg-secondary text-secondary-foreground" : "gradient-brand",
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
      </div>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2 text-sm leading-relaxed",
          isUser
            ? "gradient-brand text-accent-foreground"
            : "border border-border/60 bg-card/60 text-foreground",
        )}
      >
        {isUser ? (
          <div className="whitespace-pre-wrap">{text}</div>
        ) : (
          <div className="prose prose-sm prose-invert max-w-none prose-p:my-2 prose-pre:my-2 prose-headings:mt-3 prose-headings:mb-1">
            <ReactMarkdown>{text}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
