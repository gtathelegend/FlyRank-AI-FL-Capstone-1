import { NextResponse } from "next/server";
import { getAggregatedKnowledge } from "@/lib/ask/knowledgeAggregator";
import { answerQuestion } from "@/lib/ask/askEngine";

export const dynamic = "force-dynamic";

/**
 * Builds system prompt for external LLM API (Groq/Gemini/OpenAI) using dynamic RAG knowledge
 */
function buildSystemPrompt(kb) {
  return `You are Ask Vedaang, an AI assistant representing Vedaang Sharma's engineering portfolio.
Answer questions accurately, concisely, and professionally using ONLY the provided portfolio context below.
Always maintain an encouraging, technical, and precise tone.
When referencing specific projects, include markdown links in the format [Project Title](/projects/slug).
When referencing research, cite the paper title and venue.

PORTFOLIO KNOWLEDGE BASE CONTEXT:
${JSON.stringify(kb, null, 2)}`;
}

/**
 * Attempts to query Groq API if GROQ_API_KEY is configured
 */
async function callGroqLLM(userMessage, kb) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: buildSystemPrompt(kb) },
          { role: "user", content: userMessage },
        ],
        temperature: 0.3,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      console.warn("[callGroqLLM] Groq API returned status:", response.status);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    return content || null;
  } catch (err) {
    console.error("[callGroqLLM] Error reaching Groq API:", err);
    return null;
  }
}

/**
 * Attempts to query Gemini API if GEMINI_API_KEY is configured
 */
async function callGeminiLLM(userMessage, kb) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) return null;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: buildSystemPrompt(kb) }]
        },
        contents: [
          { parts: [{ text: userMessage }] }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1024,
        }
      }),
    });

    if (!response.ok) {
      console.warn("[callGeminiLLM] Gemini API status:", response.status);
      return null;
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return content || null;
  } catch (err) {
    console.error("[callGeminiLLM] Error calling Gemini API:", err);
    return null;
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { message: "Query message is required." },
        { status: 400 }
      );
    }

    const kb = await getAggregatedKnowledge();

    // 1. Check for external LLM API integration (Groq or Gemini)
    let answer = await callGroqLLM(message, kb);
    if (!answer) {
      answer = await callGeminiLLM(message, kb);
    }

    // 2. Fallback to Grounded RAG Knowledge Synthesizer if no LLM key or request failed
    if (!answer || typeof answer !== "string" || !answer.trim()) {
      answer = answerQuestion(message, kb);
    }

    // Double guard: Ensure answer is never blank
    if (!answer || !answer.trim()) {
      answer = "Hello! I am **Ask Vedaang**, an AI guide to Vedaang Sharma's engineering portfolio. Ask me about his projects, technical stack, research, or experience!";
    }

    // Support streaming responses via ReadableStream for real-time typing effect
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const chunks = answer.split(" ");
        for (let i = 0; i < chunks.length; i++) {
          const word = (i === 0 ? "" : " ") + chunks[i];
          controller.enqueue(encoder.encode(word));
          await new Promise((r) => setTimeout(r, 15));
        }
        controller.close();
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("[POST /api/ask]", error);
    return NextResponse.json(
      { message: "An error occurred while processing your request." },
      { status: 500 }
    );
  }
}
