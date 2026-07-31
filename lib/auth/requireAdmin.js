import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/auth/isAdminEmail";

/**
 * Typed error carrying an HTTP status so route handlers can translate auth
 * failures into the correct response via `apiError()`.
 */
export class AuthError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

/**
 * Verifies that the current request is made by the single authorized admin.
 *
 *  - 401 Unauthorized: no authenticated Supabase session.
 *  - 403 Forbidden: authenticated, but the user's email is not ADMIN_EMAIL.
 *
 * Throws an {@link AuthError} on failure (catch it and pass to `apiError`).
 * Returns the verified Supabase user on success.
 *
 * This MUST be called before any service-role (RLS-bypassing) operation.
 *
 * @returns {Promise<import("@supabase/supabase-js").User>}
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new AuthError(401, "Unauthorized");
  }
  if (!isAdminEmail(user.email)) {
    throw new AuthError(403, "Forbidden");
  }
  return user;
}
