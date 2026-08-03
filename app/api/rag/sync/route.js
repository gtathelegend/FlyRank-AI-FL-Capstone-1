import { NextResponse } from "next/server";
import { syncPortfolioVectorStore } from "@/lib/rag/indexer";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { apiError } from "@/lib/apiError";

export const dynamic = "force-dynamic";

/**
 * Admin & Automated RAG Vector Store Synchronization API route.
 * Can be triggered via admin panel or server actions.
 */
export async function POST(request) {
  try {
    // Check optional force query parameter
    const { searchParams } = new URL(request.url);
    const force = searchParams.get("force") === "true";

    const summary = await syncPortfolioVectorStore(force);

    return NextResponse.json({
      success: true,
      message: "RAG Vector Store synchronized successfully.",
      summary,
    });
  } catch (error) {
    return apiError(error, "POST /api/rag/sync");
  }
}

export async function GET() {
  try {
    const summary = await syncPortfolioVectorStore(false);
    return NextResponse.json({
      success: true,
      summary,
    });
  } catch (error) {
    return apiError(error, "GET /api/rag/sync");
  }
}
