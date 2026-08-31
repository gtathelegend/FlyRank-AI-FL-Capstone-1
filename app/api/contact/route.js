import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getPostHogClient } from "@/lib/posthog-server";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(value = "") {
	return String(value)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

export async function POST(request) {
	// Rate limit by IP (5 requests / 10 min). Blocks spam / mail-relay abuse.
	const ip = getClientIp(request);
	const { success, reset } = await rateLimit(`contact:${ip}`, { limit: 5, windowMs: 10 * 60 * 1000 });
	if (!success) {
		const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
		return NextResponse.json(
			{ message: "Too many messages. Please try again later." },
			{ status: 429, headers: { "Retry-After": String(retryAfter) } },
		);
	}

	let body;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 });
	}

	// Honeypot: a hidden field real users never fill. If populated, silently accept
	// (return 200 so bots get no signal) but do not send anything.
	if ((body?.website || "").toString().trim() !== "") {
		return NextResponse.json({ ok: true });
	}

	const name = (body?.name || "").toString().trim().slice(0, 120);
	const email = (body?.email || "").toString().trim().slice(0, 200);
	const subject = (body?.subject || "").toString().trim().slice(0, 200);
	const message = (body?.message || "").toString().trim().slice(0, 4000);

	if (!name || !email || !message) {
		return NextResponse.json({ message: "Name, email and message are required." }, { status: 400 });
	}
	if (!EMAIL_RE.test(email)) {
		return NextResponse.json({ message: "Please enter a valid email address." }, { status: 400 });
	}

	const host = process.env.SMTP_HOST;
	const port = Number(process.env.SMTP_PORT || 587);
	const user = process.env.SMTP_USER;
	const pass = process.env.SMTP_PASS;
	const from = process.env.SMTP_FROM || (user ? `Portfolio <${user}>` : null);
	const to = process.env.SMTP_TO || process.env.CONTACT_TO || user;

	if (!host || !user || !pass || !to) {
		console.error("[POST /api/contact] SMTP env not configured");
		return NextResponse.json(
			{ message: "Mail service is not configured. Please try again later." },
			{ status: 503 },
		);
	}

	const secure = process.env.SMTP_SECURE
		? process.env.SMTP_SECURE === "true"
		: port === 465;

	const transporter = nodemailer.createTransport({
		host,
		port,
		secure,
		auth: { user, pass },
	});

	const safeSubject = subject || `New message from ${name}`;
	const text = `From: ${name} <${email}>\nSubject: ${safeSubject}\n\n${message}`;
	const html = `
		<div style="font-family:system-ui,Segoe UI,Helvetica,Arial,sans-serif;color:#111;line-height:1.55;max-width:560px;">
			<h2 style="margin:0 0 12px;font-size:18px;">New portfolio contact</h2>
			<p style="margin:0 0 4px;"><strong>Name:</strong> ${escapeHtml(name)}</p>
			<p style="margin:0 0 4px;"><strong>Email:</strong> ${escapeHtml(email)}</p>
			<p style="margin:0 0 12px;"><strong>Subject:</strong> ${escapeHtml(safeSubject)}</p>
			<div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px;white-space:pre-wrap;">${escapeHtml(message)}</div>
		</div>
	`;

	try {
		await transporter.sendMail({
			from,
			to,
			replyTo: `${name} <${email}>`,
			subject: `[Portfolio] ${safeSubject}`,
			text,
			html,
		});
		try {
			const posthog = getPostHogClient();
			// Use a non-PII distinct id; keep the email out of the identity graph.
			posthog?.capture({
				distinctId: `contact:${ip}`,
				event: "contact_email_sent",
				properties: { has_subject: !!subject },
			});
		} catch (phErr) {
			console.warn("[POST /api/contact] PostHog capture error:", phErr?.message || phErr);
		}
		return NextResponse.json({ ok: true });
	} catch (err) {
		console.error("[POST /api/contact] sendMail failed:", err?.message || err);
		return NextResponse.json(
			{ message: "Could not send your message right now. Please try again later." },
			{ status: 502 },
		);
	}
}
