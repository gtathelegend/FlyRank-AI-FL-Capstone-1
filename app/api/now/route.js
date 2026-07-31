import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { apiError } from "@/lib/apiError";
import { NextResponse } from "next/server";

const FIELDS = ["focus", "learning", "reading", "listening", "location", "updated_at"];

function pluck(row) {
	if (!row) return {};
	if (row.now && typeof row.now === "object") {
		const out = {};
		for (const f of FIELDS) {
			if (row.now[f] !== undefined) out[f] = row.now[f];
		}
		return out;
	}
	const out = {};
	for (const f of FIELDS) {
		const key = `now_${f}`;
		if (row[key] !== undefined && row[key] !== null) out[f] = row[key];
	}
	return out;
}

export async function GET() {
	const supabase = await createClient();
	const { data, error } = await supabase
		.from("site_settings")
		.select("*")
		.limit(1)
		.single();

	if (error && error.code !== "PGRST116") {
		console.error("[GET /api/now]", error);
		return NextResponse.json({ data: {} }, { status: 200 });
	}
	return NextResponse.json({ data: pluck(data) });
}

export async function PUT(request) {
	try {
		await requireAdmin();

		const body = await request.json();
		const update = {};
		for (const f of FIELDS) {
			if (body[f] !== undefined) update[f] = body[f];
		}
		update.updated_at = new Date().toISOString();

		const admin = createAdminClient();
		const { data: existing } = await admin
			.from("site_settings")
			.select("id")
			.limit(1)
			.single();

		const payload = { now: update, updated_at: new Date().toISOString() };

		let result;
		if (existing) {
			result = await admin
				.from("site_settings")
				.update(payload)
				.eq("id", existing.id)
				.select()
				.single();
		} else {
			result = await admin.from("site_settings").insert(payload).select().single();
		}

		if (result.error) throw result.error;
		return NextResponse.json({ data: pluck(result.data) });
	} catch (err) {
		return apiError(err, "PUT /api/now");
	}
}
