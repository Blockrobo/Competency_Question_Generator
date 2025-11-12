import { NextRequest, NextResponse } from "next/server";
import { openai, MODEL } from "@/lib/openai";
import systemPrompt from "@/ai/systemPrompt";
import { ChatTurn } from "@/types/questions";

// Build Inputs for Responses API from system + history + current user turn
function buildInputs(history: ChatTurn[], userTurn: string) {
  const messages = [
    { role: "system" as const, content: [{ type: "input_text" as const, text: systemPrompt }] },
    ...history.map((t) => ({
      role: t.role,
      content: [{ type: "input_text" as const, text: t.content }],
    })),
    { role: "user" as const, content: [{ type: "input_text" as const, text: userTurn }] },
  ];
  return messages;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { history = [], userTurn } = body as { history: ChatTurn[]; userTurn: string };

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
    }

    const input = buildInputs(history, userTurn);

    const resp = await openai.responses.create({
      model: MODEL,
      input,
      // Optional: force JSON vibes with guidance (model still returns text)
      // metadata: { app: "sot-competency-chat" },
    });

    // Find the text output
    const text =
      resp.output_text ??
      (resp.output && Array.isArray(resp.output) && "content" in (resp.output[0] as any)
        ? (resp.output[0] as any).content[0]?.text
        : "");

    if (!text) {
      return NextResponse.json({ error: "Empty model response" }, { status: 500 });
    }

    // The model outputs JSON first. Split optional teacher notes after JSON.
    let jsonPart = text.trim();
    let notesPart = "";
    const notesIdx = text.indexOf("## Teacher Notes");
    if (notesIdx >= 0) {
      jsonPart = text.slice(0, notesIdx).trim();
      notesPart = text.slice(notesIdx).trim();
    }

    // Try parse JSON
    let parsed;
    try {
      parsed = JSON.parse(jsonPart);
    } catch (e) {
      // Return raw for debugging
      return NextResponse.json({ raw: text, parseError: String(e) }, { status: 200 });
    }

    return NextResponse.json({ 
      data: parsed, 
      notes: notesPart,
      metadata: {
        model: MODEL,
        generatedAt: new Date().toISOString(),
      }
    }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}

