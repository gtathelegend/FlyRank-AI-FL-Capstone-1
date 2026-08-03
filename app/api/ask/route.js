import { NextResponse } from "next/server";
import { semanticSearch } from "@/lib/rag/search";
import { answerQuestion } from "@/lib/ask/askEngine";

export const dynamic = "force-dynamic";

/**
 * Builds dynamic grounded system prompt for LLM API (Groq/Gemini/OpenAI).
 * CRITICAL: Never sends the entire database. Only incorporates top 5 retrieved context documents.
 */
function buildGroundedSystemPrompt(retrievedContext) {
  return `You are Ask Vedaang, an AI assistant representing Vedaang Sharma's engineering portfolio.

STRICT GROUNDING & CITATION RULES:
1. Answer the user's question accurately, concisely, and professionally using ONLY the RETRIEVED PORTFOLIO CONTEXT provided below.
2. Ground every answer. Do NOT hallucinate, invent, or assume any facts outside the provided retrieved context.
3. If the user's question cannot be answered using the provided context, state clearly and honestly: "I don't have that specific information in Vedaang's portfolio records. You can explore his work on the [Projects Page](/projects), read published papers on the [Research Page](/research), or send a message on the [Contact Page](/contact)."
4. CITATION REQUIREMENT:
   - For projects, include markdown links: e.g. [Project Title](/projects/slug) or [Project Title](url).
   - For research papers, cite titles and venues: e.g. [Paper Title](/research).
   - For resume or CV, cite [Download Resume](/api/resume).
   - For contact information, cite email and [Contact Page](/contact).
5. Output clean GitHub Flavored Markdown.

RETRIEVED PORTFOLIO CONTEXT (Top 5 Relevant Documents):
${retrievedContext || "No relevant documents found."}`;
}

/**
 * Attempts to query Groq API (llama-3.3-70b-versatile)
 */
async function callGroqLLM(userMessage, systemPrompt) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.2,
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
 * Attempts to query Gemini API (gemini-1.5-flash)
 */
async function callGeminiLLM(userMessage, systemPrompt) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) return null;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [{ parts: [{ text: userMessage }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1024,
        },
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

/**
 * Main RAG Ask API POST handler
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const message = (body.message || body.question || body.prompt || "").trim();

    if (!message) {
      return NextResponse.json(
        { message: "Query message is required." },
        { status: 400 }
      );
    }

    // 1. Question -> Embedding -> Semantic search -> Top 5 documents
    const searchResult = await semanticSearch(message, { limit: 5 });
    const retrievedContext = searchResult.context;
    const documents = searchResult.documents || [];

    // 2. Prompt builder with ONLY retrieved context (Never send entire database)
    const systemPrompt = buildGroundedSystemPrompt(retrievedContext);

    // 3. Query LLM (Groq -> Gemini)
    let answer = await callGroqLLM(message, systemPrompt);
    if (!answer) {
      answer = await callGeminiLLM(message, systemPrompt);
    }

    // 4. Grounded fallback synthesizer if external LLM keys are absent/failed
    if (!answer || typeof answer !== "string" || !answer.trim()) {
      answer = answerQuestion(message, { documents, context: retrievedContext });
    }

    // 5. Streaming response guarantee: Never produce blank responses
    let finalAnswer = (answer || "").trim();
    if (!finalAnswer) {
      finalAnswer = `I couldn't find specific information matching your question in Vedaang's portfolio records.

Explore key sections:
- **Projects**: Learn about [Aegis Care](/projects/aegis-care) or explore [All Projects](/projects)
- **Research**: Read published papers on the [Research Page](/research)
- **Skills**: View backend & AI capabilities on the [Skills Page](/skills)
- **Resume**: Download [Vedaang's Resume PDF](/api/resume) or connect via the [Contact Page](/contact)`;
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Stream text smoothly preserving whitespace and markdown chunks
        const chunks = finalAnswer.split(/(\s+)/);
        for (const chunk of chunks) {
          if (chunk) {
            controller.enqueue(encoder.encode(chunk));
            await new Promise((r) => setTimeout(r, 8));
          }
        }
        controller.close();
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Content-Type-Options": "nosniff",
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
