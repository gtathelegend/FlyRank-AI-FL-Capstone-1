import crypto from "crypto";
import { aggregateKnowledge } from "@/lib/knowledge/aggregate";
import { NormalizedKnowledgeRecord, AggregatedKnowledgeFailure } from "@/lib/knowledge/types";
import { generateEmbedding } from "./embed";
import {
  getExistingChecksumMap,
  upsertVectorRecords,
  deleteObsoleteVectorRecords,
  StoredVectorRecord,
} from "./vectorStore";

export interface IndexingSummary {
  success: boolean;
  totalCount: number;
  indexedCount: number;
  skippedCount: number;
  deletedCount: number;
  durationMs: number;
  timestamp: string;
  error?: string;
}

interface PreparedChunk {
  document_id: string;
  type: string;
  title: string;
  section: string;
  content: string;
  summary: string;
  tags: string[];
  url: string;
  metadata: Record<string, any>;
  checksum: string;
  updated_at: string;
}

/**
 * Computes SHA-256 checksum for a content section.
 */
function computeChecksum(docId: string, section: string, content: string, updatedAt: string): string {
  return crypto
    .createHash("sha256")
    .update(`${docId}:${section}:${content}:${updatedAt}`)
    .digest("hex");
}

/**
 * Splits a normalized record into section-level semantic chunks for maximum retrieval precision.
 */
function extractChunksFromRecord(record: NormalizedKnowledgeRecord): PreparedChunk[] {
  const updatedAt = record.updatedAt || new Date().toISOString();
  const baseTags = record.tags || [];
  const baseMetadata = record.metadata || {};

  // For projects: split into section-level chunks
  if (record.type === "project" && record.projectDetails) {
    const details = record.projectDetails;
    const sections: { name: string; text: string }[] = [
      { name: "Overview", text: details.summary },
      { name: "Problem Statement", text: details.problem },
      { name: "Architecture & Stack", text: details.architecture || `Tech stack: ${details.techStack.join(", ")}` },
      { name: "Engineering Decisions", text: details.engineeringDecisions },
      { name: "Challenges & Outcome", text: [details.challenges, details.outcome].filter(Boolean).join("\n") },
    ].filter((s) => s.text && s.text.trim());

    return sections.map((sec) => {
      const checksum = computeChecksum(record.id, sec.name, sec.text, updatedAt);
      return {
        document_id: record.id,
        type: record.type,
        title: record.title,
        section: sec.name,
        content: sec.text,
        summary: details.summary,
        tags: baseTags,
        url: record.url || details.caseStudyUrl,
        metadata: {
          ...baseMetadata,
          githubLink: details.githubLink,
          liveDemo: details.liveDemo,
        },
        checksum,
        updated_at: updatedAt,
      };
    });
  }

  // For non-projects: single Overview chunk
  const checksum = computeChecksum(record.id, "Overview", record.content, updatedAt);
  return [
    {
      document_id: record.id,
      type: record.type,
      title: record.title,
      section: "Overview",
      content: record.content,
      summary: record.summary,
      tags: baseTags,
      url: record.url || "",
      metadata: baseMetadata,
      checksum,
      updated_at: updatedAt,
    },
  ];
}

/**
 * Main Automatic Indexing Pipeline function.
 * Synchronizes CMS knowledge documents with pgvector embeddings store incrementally.
 */
export async function syncPortfolioVectorStore(forceReindex = false): Promise<IndexingSummary> {
  const startTime = Date.now();

  try {
    // 1. Fetch normalized portfolio records
    const knowledgeResult = await aggregateKnowledge(forceReindex);
    if (!knowledgeResult.success) {
      const failure = knowledgeResult as AggregatedKnowledgeFailure;
      return {
        success: false,
        totalCount: 0,
        indexedCount: 0,
        skippedCount: 0,
        deletedCount: 0,
        durationMs: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        error: failure.error.message,
      };
    }

    const records = knowledgeResult.records;
    const activeDocIds = records.map((r) => r.id);

    // 2. Fetch existing checksum map from Supabase pgvector
    const existingChecksums = forceReindex ? {} : await getExistingChecksumMap();

    // 3. Extract and filter prepared chunks
    const allChunks: PreparedChunk[] = [];
    records.forEach((rec) => {
      const chunks = extractChunksFromRecord(rec);
      allChunks.push(...chunks);
    });

    const chunksToEmbed: PreparedChunk[] = [];
    let skippedCount = 0;

    allChunks.forEach((chunk) => {
      const key = `${chunk.document_id}::${chunk.section}`;
      const existing = existingChecksums[key];

      if (existing && existing.checksum === chunk.checksum && !forceReindex) {
        // Reuse existing embedding — document section has not changed!
        skippedCount++;
      } else {
        // Document is new or changed — regenerate embedding!
        chunksToEmbed.push(chunk);
      }
    });

    // 4. Generate embeddings for new/modified chunks
    let indexedCount = 0;
    if (chunksToEmbed.length > 0) {
      console.log(`[indexer] Regenerating embeddings for ${chunksToEmbed.length} modified/new chunks...`);
      const vectorRecords: StoredVectorRecord[] = [];

      for (const chunk of chunksToEmbed) {
        const embedding = await generateEmbedding(`${chunk.title} - ${chunk.section}: ${chunk.content}`);
        vectorRecords.push({
          document_id: chunk.document_id,
          type: chunk.type,
          title: chunk.title,
          section: chunk.section,
          content: chunk.content,
          summary: chunk.summary,
          tags: chunk.tags,
          url: chunk.url,
          embedding,
          metadata: chunk.metadata,
          checksum: chunk.checksum,
          updated_at: chunk.updated_at,
        });
      }

      const upsertSuccess = await upsertVectorRecords(vectorRecords);
      if (upsertSuccess) {
        indexedCount = vectorRecords.length;
      }
    }

    // 5. Clean up obsolete vectors from deleted CMS documents
    const deletedCount = await deleteObsoleteVectorRecords(activeDocIds);

    const summary: IndexingSummary = {
      success: true,
      totalCount: allChunks.length,
      indexedCount,
      skippedCount,
      deletedCount,
      durationMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };

    console.log(`[indexer] Dynamic Vector Store Sync Completed in ${summary.durationMs}ms:`, {
      totalChunks: summary.totalCount,
      reindexed: summary.indexedCount,
      reused: summary.skippedCount,
      deleted: summary.deletedCount,
    });

    return summary;
  } catch (err: any) {
    console.error("[indexer] Exception during vector store indexing:", err);
    return {
      success: false,
      totalCount: 0,
      indexedCount: 0,
      skippedCount: 0,
      deletedCount: 0,
      durationMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      error: err.message || String(err),
    };
  }
}
