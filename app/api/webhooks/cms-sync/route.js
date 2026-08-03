import { NextResponse } from "next/server";
import { syncPortfolioVectorStore } from "@/lib/rag/indexer";

export const dynamic = "force-dynamic";

/**
 * Supabase Database Webhook & HTTP Event Trigger Endpoint.
 * Automatically synchronizes knowledge index and pgvector embeddings when any CMS table changes.
 */
export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const secretHeader = request.headers.get("x-webhook-secret") || "";
    const expectedSecret = process.env.CMS_WEBHOOK_SECRET;

    if (expectedSecret && secretHeader !== expectedSecret && !authHeader.includes(expectedSecret)) {
      return NextResponse.json({ message: "Unauthorized webhook request." }, { status: 401 });
    }

    const payload = await request.json().catch(() => ({}));
    console.log("[cms-sync webhook] Event received:", {
      type: payload.type || payload.event || "MUTATION",
      table: payload.table || payload.schema || "CMS",
    });

    // Run knowledge indexer & vector store sync
    const summary = await syncPortfolioVectorStore(true);

    return NextResponse.json({
      success: true,
      message: "CMS Knowledge Index & Vector Store synchronized successfully.",
      summary,
    });
  } catch (error) {
    console.error("[POST /api/webhooks/cms-sync]", error);
    return NextResponse.json(
      { message: "Failed to synchronize CMS knowledge index." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "active",
    endpoint: "/api/webhooks/cms-sync",
    message: "CMS auto-sync webhook endpoint is operational.",
  });
}
