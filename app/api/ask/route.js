import { NextResponse } from "next/server";
import { classifyIntent } from "@/lib/rag/intent";
import { semanticSearch } from "@/lib/rag/search";
import { answerQuestion } from "@/lib/ask/askEngine";

export const dynamic = "force-dynamic";

/**
 * Builds dynamic grounded system prompt for LLM API (Groq/Gemini/OpenAI).
 * CRITICAL: Instructs model to speak as Vedaang Sharma in FIRST PERSON with zero internal jargon leakage.
 */
function buildGroundedSystemPrompt(retrievedContext) {
  return `You are Vedaang Sharma. You are chatting directly with visitors on your personal engineering portfolio website.

IDENTITY & PERSONALITY:
- Identify yourself naturally as Vedaang ("I'm Vedaang").
- ALWAYS speak in FIRST PERSON ("I", "my", "me", "I built", "I developed", "My research", "I documented").
- Personality: Friendly, approachable, professional, humble, curious, technically strong, and enthusiastic about software engineering and research.
- Never sound like a robot, search engine, documentation, or an AI assistant relaying third-party info.

STRICT SYSTEM SECRECY & JARGON PROHIBITION:
- NEVER mention internal mechanics or tools under any circumstances.
- DO NOT use words like: "portfolio records", "knowledge base", "database", "Supabase", "retrieved documents", "vector search", "RAG", "embeddings", "prompt", "LLM", "context", "provided information", "according to the records".
- Act as if you are recalling your own real-world engineering experiences.

STRICT GROUNDING GUARANTEE:
1. Every detail must come strictly from the background information provided below. Never hallucinate, fabricate, or exaggerate.
2. If asked about something not covered in the background details, respond truthfully in first person:
   "I don't currently have that information documented in my portfolio."
   (Then offer to discuss your documented projects, research, or contact information).

RESPONSE STRUCTURE:
Structure your response naturally:
1. Short conversational introduction (e.g., "Posture Sense is one of my favorite projects because...")
2. Direct answer with precise technical details
3. Interesting engineering insight or decision
4. Lessons learned or trade-offs (when relevant)
5. Natural invitation for follow-up (e.g., "Feel free to ask if you'd like to explore the backend architecture further!")

CITATIONS & LINKS:
- Include natural markdown links for referenced projects: e.g. [Posture Sense](/projects/posture-sense)
- Citing research papers: e.g. [Paper Title](/research)
- Resume: [Download Resume](/api/resume)
- Contact: [Contact Page](/contact)

BACKGROUND INFORMATION (MY WORK & EXPERIENCES):
${retrievedContext || "No relevant details found."}`;
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
 * Main RAG Ask API POST handler with Intent Classification Layer
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

    // 1. INTENT CLASSIFICATION LAYER: Evaluate conversational vs portfolio query
    const intentResult = classifyIntent(message);

    // Helper to build stream response with metadata headers
    const buildStreamResponse = (text, metadata = {}) => {
      const encoder = new TextEncoder();
      const finalAnswer = (text || "").trim();
      const stream = new ReadableStream({
        async start(controller) {
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
          "X-RAG-Bypass": metadata.bypass ? "true" : "false",
          "X-RAG-Confidence-Score": String(metadata.confidenceScore ?? 0.0),
          "X-RAG-Confidence-Level": metadata.confidenceLevel || "None",
          "X-RAG-Retrieved-Count": String(metadata.retrievedCount ?? 0),
          "X-Intent-Category": metadata.intentCategory || "portfolio_query",
        },
      });
    };

    // If intent is conversational (greetings, farewells, gratitude, etc.): BYPASS RAG completely
    if (intentResult.bypassRag && intentResult.response) {
      return buildStreamResponse(intentResult.response, {
        bypass: true,
        confidenceScore: 0.0,
        confidenceLevel: "None",
        retrievedCount: 0,
        intentCategory: intentResult.category,
      });
    }

    // 2. RAG PIPELINE: Question -> Embedding -> Semantic search with confidence threshold
    const searchResult = await semanticSearch(message, { limit: 5, threshold: 0.20 });
    const retrievedContext = searchResult.context;
    const documents = searchResult.documents || [];
    const count = searchResult.count || 0;
    const confidenceScore = searchResult.confidenceScore || 0.0;
    const confidenceLevel = searchResult.confidenceLevel || "None";

    // 3. Prompt builder with ONLY retrieved context
    const systemPrompt = buildGroundedSystemPrompt(retrievedContext);

    // 4. Query LLM (Groq -> Gemini)
    let answer = await callGroqLLM(message, systemPrompt);
    if (!answer) {
      answer = await callGeminiLLM(message, systemPrompt);
    }

    // 5. Grounded fallback synthesizer if external LLM keys are absent/failed
    if (!answer || typeof answer !== "string" || !answer.trim()) {
      answer = answerQuestion(message, { documents, context: retrievedContext });
    }

    // 6. Guarantee non-empty response
    let finalAnswer = (answer || "").trim();
    if (!finalAnswer) {
      finalAnswer = `I don't currently have that information documented in my portfolio.

Feel free to explore my work:
- **Projects**: Learn about [Posture Sense](/projects/posture-sense) or explore [All Projects](/projects)
- **Research**: Read my published papers on the [Research Page](/research)
- **Skills**: Check out my backend & AI skills on the [Skills Page](/skills)
- **Resume & Contact**: Download my [Resume PDF](/api/resume) or send me a message on my [Contact Page](/contact)`;
    }

    return buildStreamResponse(finalAnswer, {
      bypass: false,
      confidenceScore,
      confidenceLevel,
      retrievedCount: count,
      intentCategory: "portfolio_query",
    });
  } catch (error) {
    console.error("[POST /api/ask]", error);
    return NextResponse.json(
      { message: "An error occurred while processing your request." },
      { status: 500 }
    );
  }
}
