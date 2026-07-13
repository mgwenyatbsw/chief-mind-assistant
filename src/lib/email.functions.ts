import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";

const EmailInput = z.object({
  instruction: z.string().min(1),
  tone: z.string().min(1),
  mode: z.enum(["generate", "reply", "rewrite", "improve", "translate", "shorten", "expand", "subject"]),
  context: z.string().optional().default(""),
  language: z.string().optional().default("English"),
});

function buildPrompt(data: z.infer<typeof EmailInput>) {
  const { mode, instruction, tone, context, language } = data;
  const ctx = context ? `\n\nOriginal email / context:\n"""${context}"""` : "";
  switch (mode) {
    case "generate":
      return `Write a ${tone} email based on this instruction:\n"${instruction}"${ctx}\n\nReturn only the email body with a suitable Subject line on the first line prefixed with "Subject:".`;
    case "reply":
      return `Write a ${tone} reply to the email below. Instruction from the user: "${instruction}".${ctx}\n\nReturn only the reply body with a "Subject:" line first.`;
    case "rewrite":
      return `Rewrite the email below in a ${tone} tone. Preserve meaning. User note: "${instruction}".${ctx}\n\nReturn only the rewritten email with a "Subject:" line first.`;
    case "improve":
      return `Improve the grammar, clarity, and flow of the email below without changing meaning. Keep tone ${tone}.${ctx}\n\nReturn only the improved email with a "Subject:" line first.`;
    case "translate":
      return `Translate the email below into ${language}. Keep tone ${tone} and formatting.${ctx}\n\nReturn only the translated email with a "Subject:" line first.`;
    case "shorten":
      return `Shorten the email below by ~50% while keeping tone ${tone} and all key points.${ctx}\n\nReturn only the shortened email with a "Subject:" line first.`;
    case "expand":
      return `Expand the email below with helpful detail and warmth, keeping tone ${tone}.${ctx}\n\nReturn only the expanded email with a "Subject:" line first.`;
    case "subject":
      return `Suggest 5 excellent ${tone} subject lines for the email below or the instruction: "${instruction}".${ctx}\n\nReturn a numbered list only.`;
  }
}

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => EmailInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const gateway = createLovableAiGatewayProvider(key);
    const { text } = await generateText({
      model: gateway("openai/gpt-5.5"),
      system:
        "You are an expert executive email writer. Always match the requested tone precisely and produce polished, ready-to-send emails.",
      prompt: buildPrompt(data),
    });

    let subject = "";
    let body = text.trim();
    const m = body.match(/^\s*Subject:\s*(.+)$/im);
    if (m) {
      subject = m[1].trim();
      body = body.replace(m[0], "").trim();
    }
    return { subject, body, raw: text };
  });
