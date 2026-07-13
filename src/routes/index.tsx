import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Sparkles,
  Mail,
  MessageSquare,
  ArrowRight,
  Clock,
  TrendingUp,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SavedEmail } from "@/lib/storage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Copilot" },
      { name: "description", content: "Your AI workspace at a glance." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [emails, setEmails] = useState<SavedEmail[]>([]);
  const [chatCount, setChatCount] = useState(0);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("copilot.savedEmails");
      if (raw) setEmails(JSON.parse(raw) as SavedEmail[]);
      const chat = window.localStorage.getItem("copilot.chat.messages");
      if (chat) setChatCount((JSON.parse(chat) as unknown[]).length);
    } catch {
      // ignore
    }
  }, []);

  const stats = [
    { label: "Saved Emails", value: emails.length, icon: Mail },
    { label: "Chat Messages", value: chatCount, icon: MessageSquare },
    { label: "AI Actions Today", value: emails.length + Math.floor(chatCount / 2), icon: Sparkles },
  ];

  const quick = [
    {
      title: "Draft an email",
      desc: "Generate a polished email from a one-line brief.",
      to: "/email",
      icon: Mail,
    },
    {
      title: "Ask Copilot",
      desc: "Brainstorm, summarize, or plan with your AI chief of staff.",
      to: "/chat",
      icon: MessageSquare,
    },
  ] as const;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 space-y-10 animate-fade-in">
      <section className="space-y-3">
        <Badge variant="outline" className="border-accent/40 text-accent">
          <Sparkles className="mr-1 h-3 w-3" /> Welcome back
        </Badge>
        <h1 className="text-4xl font-semibold tracking-tight">
          Your AI <span className="gradient-text">chief of staff</span>
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          One workspace to draft communications, think through problems, and move faster on the
          work that matters.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label} className="glass border-border/50">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl gradient-brand">
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-semibold">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {quick.map((q) => (
          <Link key={q.to} to={q.to} className="group">
            <Card className="glass h-full border-border/50 transition-all group-hover:border-accent/50 group-hover:shadow-glow">
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15 text-accent">
                    <q.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{q.title}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">{q.desc}</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-accent" />
              </CardHeader>
            </Card>
          </Link>
        ))}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent emails</h2>
          <Link to="/email" className="text-sm text-accent hover:underline">
            Open generator
          </Link>
        </div>
        {emails.length === 0 ? (
          <Card className="glass border-border/50">
            <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
              <FileText className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No saved emails yet. Generate one and hit Save to see it here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {emails.slice(0, 4).map((e) => (
              <Card key={e.id} className="glass border-border/50">
                <CardContent className="p-4">
                  <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(e.createdAt).toLocaleString()}
                    <Badge variant="secondary" className="ml-auto text-[10px]">
                      {e.tone}
                    </Badge>
                  </div>
                  <div className="truncate text-sm font-medium">{e.subject || e.title}</div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{e.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <Card className="glass border-border/50">
          <CardContent className="flex items-center gap-4 p-5">
            <TrendingUp className="h-5 w-5 text-accent" />
            <p className="text-sm text-muted-foreground">
              Tip — Give Copilot context (who, why, desired outcome) for sharper drafts.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
