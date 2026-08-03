import { generateEmbedding } from "./embed";
import { searchSimilarVectors, calculateCosineSimilarity, VectorSearchResult } from "./vectorStore";
import { aggregateKnowledge } from "@/lib/knowledge/aggregate";
import { NormalizedKnowledgeRecord } from "@/lib/knowledge/types";

export type FilterCategory =
  | "projects"
  | "research"
  | "experience"
  | "skills"
  | "blog"
  | "certifications"
  | "project"
  | "skill"
  | "certification"
  | string;

export interface SearchOptions {
  limit?: number;
  topK?: number;
  threshold?: number;
  filter?: FilterCategory | FilterCategory[];
  categories?: FilterCategory[];
}

export interface SearchResultItem {
  title: string;
  content: string;
  url: string;
  similarityScore: number;
  similarity: number;
  score: number;
  type: string;
  section?: string;
  id?: string;
  metadata?: Record<string, any>;
}

export interface SearchResponse {
  query: string;
  documents: SearchResultItem[];
  context: string;
  count: number;
  confidenceScore: number;
  confidenceLevel: "High" | "Medium" | "Low" | "None";
}

/**
 * Normalizes filter inputs into singular/plural target type array.
 * e.g., "projects" -> ["project", "projects"]
 */
export function normalizeTypeFilter(filter?: FilterCategory | FilterCategory[]): string[] {
  if (!filter) return [];
  const list = Array.isArray(filter) ? filter : [filter];
  const normalizedSet = new Set<string>();

  for (const item of list) {
    if (!item) continue;
    const lower = item.trim().toLowerCase();
    if (lower === "projects" || lower === "project") {
      normalizedSet.add("project");
      normalizedSet.add("projects");
    } else if (lower === "skills" || lower === "skill") {
      normalizedSet.add("skill");
      normalizedSet.add("skills");
    } else if (lower === "certifications" || lower === "certification") {
      normalizedSet.add("certification");
      normalizedSet.add("certifications");
    } else if (lower === "research") {
      normalizedSet.add("research");
    } else if (lower === "experience") {
      normalizedSet.add("experience");
    } else if (lower === "blog") {
      normalizedSet.add("blog");
    } else {
      normalizedSet.add(lower);
    }
  }

  return Array.from(normalizedSet);
}

/**
 * Formats top retrieved document items into a consolidated markdown context string.
 */
export function formatRetrievalContext(documents: SearchResultItem[]): string {
  if (!documents || documents.length === 0) {
    return "No relevant portfolio context found.";
  }

  return documents
    .map((doc, idx) => {
      const titleLine = doc.section && doc.section !== "Overview"
        ? `### Document ${idx + 1}: ${doc.title} - ${doc.section}`
        : `### Document ${idx + 1}: ${doc.title}`;
      const typeTag = doc.type ? ` [Type: ${doc.type}]` : "";
      const urlLine = doc.url ? `\nURL: ${doc.url}` : "";
      const scoreLine = `\nRelevance Score: ${doc.similarityScore}`;

      return `${titleLine}${typeTag}${urlLine}${scoreLine}\n${doc.content}`;
    })
    .join("\n\n---\n\n");
}

/**
 * In-memory fallback retriever using normalized knowledge aggregator
 * when vector store table is empty or uninitialized.
 */
async function fallbackKnowledgeSearch(
  queryEmbedding: number[],
  limit: number,
  threshold: number,
  filterTypes: string[]
): Promise<SearchResultItem[]> {
  try {
    const aggResult = await aggregateKnowledge();
    if (!aggResult.success) return [];

    const records: NormalizedKnowledgeRecord[] = aggResult.records || [];
    const filtered = filterTypes.length > 0
      ? records.filter((r) => filterTypes.includes(r.type.toLowerCase()))
      : records;

    const items: SearchResultItem[] = [];

    for (const rec of filtered) {
      const textToEmbed = `${rec.title}: ${rec.content}`;
      const recVec = await generateEmbedding(textToEmbed);
      const sim = calculateCosineSimilarity(queryEmbedding, recVec);

      if (sim >= threshold) {
        const roundedScore = Number(sim.toFixed(4));
        items.push({
          title: rec.title,
          content: rec.content,
          url: rec.url || "",
          similarityScore: roundedScore,
          similarity: roundedScore,
          score: roundedScore,
          type: rec.type,
          section: "Overview",
          id: rec.id,
          metadata: rec.metadata || {},
        });
      }
    }

    return items
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, limit);
  } catch (err) {
    console.error("[search] Error during fallback knowledge retrieval:", err);
    return [];
  }
}

/**
 * Executes Semantic Search Retrieval Engine with Confidence Threshold.
 * 
 * Flow:
 * Question -> Embedding -> Cosine Similarity Search -> Confidence Filtering -> Top K Documents -> Context
 *
 * Note: Does NOT call LLM text generation.
 */
export async function semanticSearch(
  question: string,
  options: SearchOptions = {}
): Promise<SearchResponse> {
  const query = (question || "").trim();
  const limit = options.limit ?? options.topK ?? 5;
  const threshold = options.threshold ?? 0.20; // Default confidence threshold
  const filterInput = options.filter ?? options.categories;
  const filterTypes = normalizeTypeFilter(filterInput);

  if (!query) {
    return {
      query: "",
      documents: [],
      context: "No search query provided.",
      count: 0,
      confidenceScore: 0.0,
      confidenceLevel: "None",
    };
  }

  // 1. Question -> Embedding
  const queryEmbedding = await generateEmbedding(query);

  // 2. Embedding -> Similarity search via vector store
  const vectorResults: VectorSearchResult[] = await searchSimilarVectors(
    queryEmbedding,
    limit,
    threshold,
    filterTypes
  );

  let documents: SearchResultItem[] = [];

  if (vectorResults && vectorResults.length > 0) {
    documents = vectorResults.map((res) => {
      const score = Number((res.similarity ?? 0).toFixed(4));
      const displayTitle = res.section && res.section !== "Overview"
        ? `${res.title} - ${res.section}`
        : res.title;

      return {
        title: displayTitle,
        content: res.content,
        url: res.url || "",
        similarityScore: score,
        similarity: score,
        score: score,
        type: res.type,
        section: res.section,
        id: res.documentId || res.id,
        metadata: res.metadata || {},
      };
    });
  } else {
    // 3. Fallback search against aggregated knowledge base if vector store yields no results
    documents = await fallbackKnowledgeSearch(queryEmbedding, limit, threshold, filterTypes);
  }

  // 4. Discard low-similarity documents below confidence threshold
  documents = documents
    .filter((doc) => doc.similarityScore >= threshold)
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, limit);

  // 5. Calculate retrieval confidence score & level
  const topScore = documents.length > 0 ? documents[0].similarityScore : 0.0;
  let confidenceLevel: "High" | "Medium" | "Low" | "None" = "None";

  if (documents.length > 0) {
    if (topScore >= 0.55) {
      confidenceLevel = "High";
    } else if (topScore >= 0.35) {
      confidenceLevel = "Medium";
    } else if (topScore >= threshold) {
      confidenceLevel = "Low";
    }
  }

  // 6. Return context & document list
  const context = documents.length > 0
    ? formatRetrievalContext(documents)
    : "No relevant portfolio context found.";

  return {
    query,
    documents,
    context,
    count: documents.length,
    confidenceScore: topScore,
    confidenceLevel,
  };
}

// Named Aliases for flexibility and compatibility
export const searchSemantic = semanticSearch;
export const search = semanticSearch;
export default semanticSearch;
