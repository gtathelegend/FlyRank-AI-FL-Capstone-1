/**
 * Pure admin-email check shared by the Edge middleware and Node route handlers.
 *
 * Kept dependency-free (no `next/headers`, no Supabase imports) so it is safe to
 * import into the Edge runtime middleware without pulling in server-only code.
 *
 * Authorization model: a single owner account. Only the email listed in the
 * ADMIN_EMAIL environment variable is treated as an administrator, regardless of
 * how many accounts exist in Supabase Auth.
 *
 * @param {string | null | undefined} email
 * @returns {boolean}
 */
export function isAdminEmail(email) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || !email) return false;
  return email.trim().toLowerCase() === adminEmail.trim().toLowerCase();
}
