import { NextResponse } from "next/server";
import { AuthError } from "@/lib/auth/requireAdmin";

/**
 * Translates a thrown error into a safe JSON response.
 *
 * Security: never leaks SQL text, Supabase/PostgREST internals, stack traces,
 * hints, or schema details to the client. Full diagnostic detail is logged
 * server-side only. Clients receive a generic message (or, for AuthError, the
 * intended 401/403 status with a neutral label).
 *
 * @param {unknown} err   The caught error.
 * @param {string} tag    Log tag, e.g. "POST /api/projects".
 * @returns {NextResponse}
 */
export function apiError(err, tag = "API") {
  if (err instanceof AuthError) {
    return NextResponse.json({ message: err.message }, { status: err.status });
  }

  // Log full detail on the server only.
  console.error(
    `[${tag}]`,
    err?.message || err,
    err?.code ? `code=${err.code}` : "",
    err?.details ? `details=${err.details}` : ""
  );

  return NextResponse.json(
    { message: "Something went wrong. Please try again later." },
    { status: 500 }
  );
}

/**
 * Helper for explicit, client-safe validation failures (HTTP 400 by default).
 * Use for messages that are intentionally surfaced to the user.
 *
 * @param {string} message
 * @param {number} [status=400]
 * @returns {NextResponse}
 */
export function clientError(message, status = 400) {
  return NextResponse.json({ message }, { status });
}
