import { createAdminClient } from "@/lib/supabase/admin";

export interface StoredVectorRecord {
  id?: string;
  document_id: string;
  type: string;
  title: string;
  section: string;
  content: string;
  summary?: string;
  tags?: string[];
  url?: string;
  embedding: number[];
  metadata?: Record<string, any>;
  checksum: string;
  updated_at?: string;
}

export interface ExistingChecksumMap {
  [documentIdSection: string]: {
    id: string;
    checksum: string;
    updated_at: string;
  };
}

export interface VectorSearchResult {
  id: string;
  documentId: string;
  type: string;
  title: string;
  section: string;
  content: string;
  summary: string;
  tags: string[];
  url: string;
  metadata: Record<string, any>;
  similarity: number;
}

/**
 * Fetches existing checksums and updatedAt timestamps for all records in portfolio_embeddings.
 */
export async function getExistingChecksumMap(): Promise<ExistingChecksumMap> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("portfolio_embeddings")
      .select("id, document_id, section, checksum, updated_at");

    if (error) {
      console.warn("[vectorStore] Notice fetching checksum map (table may be newly initialized):", error.message);
      return {};
    }

    const map: ExistingChecksumMap = {};
    (data || []).forEach((row: any) => {
      const key = `${row.document_id}::${row.section || "Overview"}`;
      map[key] = {
        id: row.id,
        checksum: row.checksum,
        updated_at: row.updated_at,
      };
    });

    return map;
  } catch (err) {
    console.error("[vectorStore] Error reading existing checksums:", err);
    return {};
  }
}

/**
 * Batch upserts vector records into portfolio_embeddings table.
 */
export async function upsertVectorRecords(records: StoredVectorRecord[]): Promise<boolean> {
  if (!records || records.length === 0) return true;

  try {
    const admin = createAdminClient();
    const payload = records.map((r) => ({
      document_id: r.document_id,
      type: r.type,
      title: r.title,
      section: r.section || "Overview",
      content: r.content,
      summary: r.summary || "",
      tags: r.tags || [],
      url: r.url || "",
      embedding: r.embedding,
      metadata: r.metadata || {},
      checksum: r.checksum,
      updated_at: r.updated_at || new Date().toISOString(),
    }));

    const { error } = await admin
      .from("portfolio_embeddings")
      .upsert(payload, { onConflict: "document_id,section" });

    if (error) {
      console.error("[vectorStore] Error upserting vector records:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("[vectorStore] Exception during vector record upsert:", err);
    return false;
  }
}

/**
 * Removes obsolete records from portfolio_embeddings whose document_ids are no longer present in CMS.
 */
export async function deleteObsoleteVectorRecords(activeDocumentIds: string[]): Promise<number> {
  if (!activeDocumentIds || activeDocumentIds.length === 0) return 0;

  try {
    const admin = createAdminClient();
    const { data: allRows, error: fetchErr } = await admin
      .from("portfolio_embeddings")
      .select("id, document_id");

    if (fetchErr || !allRows) return 0;

    const activeSet = new Set(activeDocumentIds);
    const toDeleteIds = allRows
      .filter((row: any) => !activeSet.has(row.document_id))
      .map((row: any) => row.id);

    if (toDeleteIds.length === 0) return 0;

    const { error: delErr } = await admin
      .from("portfolio_embeddings")
      .delete()
      .in("id", toDeleteIds);

    if (delErr) {
      console.error("[vectorStore] Error deleting obsolete records:", delErr);
      return 0;
    }

    return toDeleteIds.length;
  } catch (err) {
    console.error("[vectorStore] Exception deleting obsolete records:", err);
    return 0;
  }
}

/**
 * Searches for most similar vector records matching query embedding using match_portfolio_embeddings RPC.
 */
export async function searchSimilarVectors(
  queryEmbedding: number[],
  matchCount = 5,
  matchThreshold = 0.0
): Promise<VectorSearchResult[]> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.rpc("match_portfolio_embeddings", {
      query_embedding: queryEmbedding,
      match_threshold: matchThreshold,
      match_count: matchCount,
    });

    if (error) {
      console.warn("[vectorStore] RPC match_portfolio_embeddings warning:", error.message);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      documentId: row.document_id,
      type: row.type,
      title: row.title,
      section: row.section || "Overview",
      content: row.content,
      summary: row.summary || "",
      tags: row.tags || [],
      url: row.url || "",
      metadata: row.metadata || {},
      similarity: row.similarity ?? 0,
    }));
  } catch (err) {
    console.error("[vectorStore] Error executing similarity search:", err);
    return [];
  }
}
