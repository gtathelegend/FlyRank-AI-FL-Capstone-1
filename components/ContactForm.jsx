"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faPaperPlane,
	faCircleNotch,
	faCircleCheck,
	faCircleXmark,
	faUser,
	faEnvelope,
	faTag,
} from "@fortawesome/free-solid-svg-icons";
import posthog from "posthog-js";

const initialForm = { name: "", email: "", subject: "", message: "", website: "" };
const MESSAGE_MAX = 4000;

export default function ContactForm() {
	const [form, setForm] = useState(initialForm);
	const [status, setStatus] = useState("idle");
	const [errorMsg, setErrorMsg] = useState("");

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (status === "loading") return;

		const trimmed = {
			name: form.name.trim(),
			email: form.email.trim(),
			subject: form.subject.trim(),
			message: form.message.trim(),
			website: form.website, // honeypot — sent as-is, must stay empty for humans
		};

		if (!trimmed.name || !trimmed.email || !trimmed.message) {
			setStatus("error");
			setErrorMsg("Please fill in your name, email and message.");
			posthog.capture("contact_form_error", { reason: "validation", message: "Name, email and message are required." });
			return;
		}

		setStatus("loading");
		setErrorMsg("");

		try {
			const res = await fetch("/api/contact", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(trimmed),
			});
			const data = await res.json().catch(() => ({}));
			if (!res.ok) throw new Error(data.message || "Failed to send message");
			setStatus("success");
			setForm(initialForm);
			posthog.capture("contact_form_submitted", { has_subject: !!trimmed.subject });
		} catch (err) {
			setStatus("error");
			setErrorMsg(err.message || "Something went wrong. Please try again.");
			posthog.capture("contact_form_error", { reason: "server_error", message: err.message });
			posthog.captureException(err);
		}
	};

	const isLoading = status === "loading";

	const fieldClass =
		"w-full rounded-xl border border-[#E3DEC3] dark:border-[#33312B] bg-[#FAF8EC] dark:bg-[#1A1915] px-3.5 py-2.5 text-sm text-[#181713] dark:text-[#F7F5DC] placeholder-[#9E9A8B] focus:outline-none focus:ring-2 focus:ring-[#FFC233] focus:border-[#FFC233] transition";
	const fieldWithIcon = `${fieldClass} pl-10`;
	const labelClass = "text-xs font-mono font-semibold uppercase tracking-wider text-[#57534E] dark:text-[#9E9A8B]";
	const iconClass =
		"pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#787467] text-sm";

	return (
		<form onSubmit={handleSubmit} className="w-full" aria-label="Contact form" noValidate>
			{/* Honeypot: hidden from real users; bots tend to fill it. */}
			<div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}>
				<label>
					Website
					<input
						type="text"
						name="website"
						value={form.website}
						onChange={handleChange}
						tabIndex={-1}
						autoComplete="off"
					/>
				</label>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
				<label className="flex flex-col gap-1.5">
					<span className={labelClass}>Name</span>
					<div className="relative">
						<FontAwesomeIcon icon={faUser} className={iconClass} aria-hidden="true" />
						<input
							type="text"
							name="name"
							value={form.name}
							onChange={handleChange}
							required
							autoComplete="name"
							maxLength={120}
							placeholder="Your name"
							className={fieldWithIcon}
						/>
					</div>
				</label>
				<label className="flex flex-col gap-1.5">
					<span className={labelClass}>Email</span>
					<div className="relative">
						<FontAwesomeIcon icon={faEnvelope} className={iconClass} aria-hidden="true" />
						<input
							type="email"
							name="email"
							value={form.email}
							onChange={handleChange}
							required
							autoComplete="email"
							maxLength={200}
							placeholder="you@example.com"
							className={fieldWithIcon}
						/>
					</div>
				</label>
			</div>

			<label className="flex flex-col gap-1.5 mb-4">
				<span className={labelClass}>Subject</span>
				<div className="relative">
					<FontAwesomeIcon icon={faTag} className={iconClass} aria-hidden="true" />
					<input
						type="text"
						name="subject"
						value={form.subject}
						onChange={handleChange}
						maxLength={200}
						placeholder="What's this about?"
						className={fieldWithIcon}
					/>
				</div>
			</label>

			<label className="flex flex-col gap-1.5 mb-6">
				<span className="flex items-center justify-between">
					<span className={labelClass}>Message</span>
					<span className="text-[11px] tabular-nums text-gray-400 dark:text-gray-500">
						{form.message.length}/{MESSAGE_MAX}
					</span>
				</span>
				<textarea
					name="message"
					value={form.message}
					onChange={handleChange}
					required
					rows={6}
					maxLength={MESSAGE_MAX}
					placeholder="Tell me about your project, idea, or question…"
					className={`${fieldClass} resize-y min-h-[140px]`}
				/>
			</label>

			<div className="flex flex-col sm:flex-row sm:items-center gap-3">
				<button
					type="submit"
					disabled={isLoading}
					className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-6 py-3 sm:py-2.5 rounded-xl bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500 hover:from-violet-400 hover:via-indigo-400 hover:to-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900 text-white text-sm font-semibold transition shadow-lg shadow-violet-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
				>
					<FontAwesomeIcon
						icon={isLoading ? faCircleNotch : faPaperPlane}
						className={isLoading ? "animate-spin" : ""}
						aria-hidden="true"
					/>
					{isLoading ? "Sending…" : "Send message"}
				</button>

				<div role="status" aria-live="polite" className="min-h-[1.25rem]">
					{status === "success" && (
						<span className="inline-flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
							<FontAwesomeIcon icon={faCircleCheck} aria-hidden="true" /> Message sent - I&apos;ll be in touch soon.
						</span>
					)}
					{status === "error" && (
						<span className="inline-flex items-center gap-1.5 text-sm text-red-500 dark:text-red-400">
							<FontAwesomeIcon icon={faCircleXmark} aria-hidden="true" /> {errorMsg}
						</span>
					)}
				</div>
			</div>
		</form>
	);
}
