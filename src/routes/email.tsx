import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  Copy,
  Download,
  Save,
  Sparkles,
  Wand2,
  Reply,
  Languages,
  Scissors,
  Expand,
  Type,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateEmail } from "@/lib/email.functions";
import { useLocalStorage, type SavedEmail } from "@/lib/storage";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Email Generator — Copilot" },
      { name: "description", content: "Generate, rewrite, and translate professional emails." },
    ],
  }),
  component: EmailPage,
});

const TONES = [
  "Professional",
  "Formal",
  "Friendly",
  "Persuasive",
  "Apologetic",
  "Confident",
  "Diplomatic",
  "Customer Support",
  "Sales",
  "HR",
  "Executive",
] as const;

const MODES = [
  { id: "generate", label: "Generate", icon: Sparkles },
  { id: "reply", label: "Reply", icon: Reply },
  { id: "rewrite", label: "Rewrite", icon: RefreshCw },
  { id: "improve", label: "Improve", icon: Wand2 },
  { id: "translate", label: "Translate", icon: Languages },
  { id: "shorten", label: "Shorten", icon: Scissors },
  { id: "expand", label: "Expand", icon: Expand },
  { id: "subject", label: "Subject lines", icon: Type },
] as const;

type Mode = (typeof MODES)[number]["id"];

function EmailPage() {
  const generate = useServerFn(generateEmail);
  const [mode, setMode] = useState<Mode>("generate");
  const [tone, setTone] = useState<string>("Professional");
  const [language, setLanguage] = useState("English");
  const [instruction, setInstruction] = useState("");
  const [context, setContext] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [saved, setSaved] = useLocalStorage<SavedEmail[]>("copilot.savedEmails", []);

  const mutation = useMutation({
    mutationFn: async () =>
      generate({ data: { instruction, tone, mode, context, language } }),
    onSuccess: (res) => {
      setSubject(res.subject);
      setBody(res.body);
      toast.success("Draft ready");
    },
    onError: (err: Error) => toast.error(err.message || "Something went wrong"),
  });

  const needsContext = mode !== "generate" && mode !== "subject";
  const needsInstruction = mode === "generate" || mode === "reply" || mode === "subject";

  const handleCopy = async () => {
    const text = subject ? `Subject: ${subject}\n\n${body}` : body;
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const handleDownload = () => {
    const text = subject ? `Subject: ${subject}\n\n${body}` : body;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(subject || "email").slice(0, 40).replace(/[^\w-]+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    if (!body.trim()) return;
    const entry: SavedEmail = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      title: instruction.slice(0, 60) || subject || "Untitled",
      subject,
      body,
      tone,
      mode,
    };
    setSaved([entry, ...saved].slice(0, 30));
    toast.success("Saved to drafts");
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] animate-fade-in">
      {/* Left: controls */}
      <Card className="glass border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-accent" /> Compose
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
            <TabsList className="flex h-auto flex-wrap justify-start gap-1 bg-secondary/40 p-1">
              {MODES.map((m) => (
                <TabsTrigger key={m.id} value={m.id} className="gap-1 text-xs">
                  <m.icon className="h-3 w-3" />
                  {m.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TONES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {mode === "translate" && (
              <div className="space-y-2">
                <Label>Language</Label>
                <Input
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  placeholder="e.g. Spanish"
                />
              </div>
            )}
          </div>

          {needsInstruction && (
            <div className="space-y-2">
              <Label>What should this email do?</Label>
              <Textarea
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder={
                  mode === "reply"
                    ? "e.g. Politely decline and offer next week."
                    : mode === "subject"
                      ? "e.g. Product launch announcement for Q1"
                      : "e.g. Ask the client to confirm the meeting on Thursday at 3pm."
                }
                rows={4}
              />
            </div>
          )}

          {needsContext && (
            <div className="space-y-2">
              <Label>Original email / context</Label>
              <Textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Paste the email you want to reply to, rewrite, translate…"
                rows={6}
              />
            </div>
          )}

          <Button
            onClick={() => mutation.mutate()}
            disabled={
              mutation.isPending ||
              (needsInstruction && !instruction.trim()) ||
              (needsContext && !context.trim())
            }
            className="w-full gradient-brand"
            size="lg"
          >
            {mutation.isPending ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Generating…
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" /> Generate with AI
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Right: output */}
      <Card className="glass border-border/60">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg">Draft</CardTitle>
          <div className="flex flex-wrap gap-1">
            <Button size="sm" variant="ghost" onClick={handleCopy} disabled={!body}>
              <Copy className="mr-1 h-4 w-4" /> Copy
            </Button>
            <Button size="sm" variant="ghost" onClick={handleDownload} disabled={!body}>
              <Download className="mr-1 h-4 w-4" /> Download
            </Button>
            <Button size="sm" variant="ghost" onClick={handleSave} disabled={!body}>
              <Save className="mr-1 h-4 w-4" /> Save
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label>Subject</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject line will appear here"
            />
          </div>
          <div className="space-y-2">
            <Label>Body</Label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Your AI-generated email will appear here. You can edit before sending."
              rows={18}
              className="font-[450] leading-relaxed"
            />
          </div>

          {saved.length > 0 && (
            <div className="pt-2">
              <div className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                Saved drafts
              </div>
              <div className="max-h-40 space-y-1 overflow-y-auto">
                {saved.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => {
                      setSubject(e.subject);
                      setBody(e.body);
                      setTone(e.tone);
                    }}
                    className="w-full rounded-lg border border-border/50 bg-card/40 p-2 text-left text-xs hover:border-accent/50"
                  >
                    <div className="truncate font-medium text-foreground">
                      {e.subject || e.title}
                    </div>
                    <div className="text-muted-foreground">
                      {e.tone} · {new Date(e.createdAt).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
