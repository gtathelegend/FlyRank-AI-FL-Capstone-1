/**
 * Dynamic Embedding Provider Module for RAG Pipeline
 * Supports Gemini (text-embedding-004), OpenAI (text-embedding-3-small), and local deterministic fallback vectors.
 */

export interface EmbeddingOptions {
  dimensions?: number;
}

/**
 * Generates a deterministic normalized pseudo-random vector based on string hash.
 * Ensures local development and tests work out-of-the-box when external LLM keys are unconfigured.
 */
function generateDeterministicFallbackVector(text: string, dimensions = 768): number[] {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }

  const vector: number[] = new Array(dimensions);
  let norm = 0;
  for (let i = 0; i < dimensions; i++) {
    const val = Math.sin(hash + i * 0.1);
    vector[i] = val;
    norm += val * val;
  }

  const mag = Math.sqrt(norm) || 1;
  return vector.map((v) => v / mag);
}

/**
 * Invokes Gemini Embedding API (text-embedding-004)
 */
async function callGeminiEmbeddingApi(text: string, apiKey: string): Promise<number[] | null> {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "models/text-embedding-004",
        content: { parts: [{ text }] },
      }),
    });

    if (!response.ok) {
      console.warn("[embed] Gemini embedding API returned status:", response.status);
      return null;
    }

    const data = await response.json();
    const values = data.embedding?.values;
    if (Array.isArray(values) && values.length > 0) {
      return values;
    }
    return null;
  } catch (err) {
    console.error("[embed] Error reaching Gemini embedding API:", err);
    return null;
  }
}

/**
 * Invokes OpenAI Embedding API (text-embedding-3-small)
 */
async function callOpenAIEmbeddingApi(text: string, apiKey: string): Promise<number[] | null> {
  try {
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: text,
      }),
    });

    if (!response.ok) {
      console.warn("[embed] OpenAI embedding API status:", response.status);
      return null;
    }

    const data = await response.json();
    const values = data.data?.[0]?.embedding;
    if (Array.isArray(values) && values.length > 0) {
      return values;
    }
    return null;
  } catch (err) {
    console.error("[embed] Error calling OpenAI embedding API:", err);
    return null;
  }
}

/**
 * Main function: Generates embedding vector for input text.
 */
export async function generateEmbedding(
  text: string,
  options: EmbeddingOptions = {}
): Promise<number[]> {
  const cleanText = (text || "").trim();
  if (!cleanText) {
    return generateDeterministicFallbackVector("empty", options.dimensions || 768);
  }

  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (geminiKey) {
    const vector = await callGeminiEmbeddingApi(cleanText, geminiKey);
    if (vector) return vector;
  }

  const openAIKey = process.env.OPENAI_API_KEY;
  if (openAIKey) {
    const vector = await callOpenAIEmbeddingApi(cleanText, openAIKey);
    if (vector) return vector;
  }

  // Fallback if no LLM embedding API key is present or request failed
  return generateDeterministicFallbackVector(cleanText, options.dimensions || 768);
}

/**
 * Batch function: Generates embeddings for an array of texts.
 */
export async function generateEmbeddings(
  texts: string[],
  options: EmbeddingOptions = {}
): Promise<number[][]> {
  return Promise.all(texts.map((t) => generateEmbedding(t, options)));
}
