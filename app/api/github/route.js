import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 600; // re-fetch upstream every 10 min

const DEFAULT_USER = process.env.NEXT_PUBLIC_GITHUB_USER || "gtathelegend";

function summarize(event) {
	const repo = event.repo?.name;
	const url = repo ? `https://github.com/${repo}` : null;
	const created_at = event.created_at;

	switch (event.type) {
		case "PushEvent": {
			const commits = event.payload?.commits || [];
			const count =
				event.payload?.size ||
				event.payload?.distinct_size ||
				commits.length;
			const head = commits[commits.length - 1];
			return {
				kind: "push",
				icon: "↑",
				title: count > 0
					? `Pushed ${count} commit${count === 1 ? "" : "s"}`
					: "Pushed commits",
				detail: head?.message?.split("\n")[0]?.slice(0, 90) || "",
				repo,
				url: head ? `${url}/commit/${head.sha}` : url,
				created_at,
			};
		}
		case "PullRequestEvent": {
			const action = event.payload?.action;
			const pr = event.payload?.pull_request;
			return {
				kind: "pr",
				icon: "⇅",
				title: `${action === "opened" ? "Opened" : action === "closed" ? (pr?.merged ? "Merged" : "Closed") : "Updated"} PR`,
				detail: pr?.title?.slice(0, 90) || "",
				repo,
				url: pr?.html_url || url,
				created_at,
			};
		}
		case "IssuesEvent": {
			const action = event.payload?.action;
			const issue = event.payload?.issue;
			return {
				kind: "issue",
				icon: "◌",
				title: `${action === "opened" ? "Opened" : action === "closed" ? "Closed" : "Updated"} issue`,
				detail: issue?.title?.slice(0, 90) || "",
				repo,
				url: issue?.html_url || url,
				created_at,
			};
		}
		case "CreateEvent": {
			const refType = event.payload?.ref_type;
			return {
				kind: "create",
				icon: "+",
				title: `Created ${refType}${event.payload?.ref ? ` ${event.payload.ref}` : ""}`,
				detail: "",
				repo,
				url,
				created_at,
			};
		}
		case "WatchEvent":
			return {
				kind: "star",
				icon: "★",
				title: "Starred",
				detail: "",
				repo,
				url,
				created_at,
			};
		case "ForkEvent":
			return {
				kind: "fork",
				icon: "⑂",
				title: "Forked",
				detail: "",
				repo,
				url,
				created_at,
			};
		case "ReleaseEvent":
			return {
				kind: "release",
				icon: "✦",
				title: `Released ${event.payload?.release?.tag_name || ""}`.trim(),
				detail: event.payload?.release?.name?.slice(0, 90) || "",
				repo,
				url: event.payload?.release?.html_url || url,
				created_at,
			};
		default:
			return null;
	}
}

export async function GET(request) {
	const { searchParams } = new URL(request.url);
	const user = (searchParams.get("user") || DEFAULT_USER).replace(/[^A-Za-z0-9-]/g, "");
	if (!user) {
		return NextResponse.json({ message: "Missing user." }, { status: 400 });
	}

	const headers = {
		Accept: "application/vnd.github+json",
		"User-Agent": "vedaang-portfolio",
	};
	if (process.env.GITHUB_TOKEN) {
		headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
	}

	try {
		const res = await fetch(`https://api.github.com/users/${user}/events/public?per_page=30`, {
			headers,
			next: { revalidate: 600 },
		});
		if (!res.ok) {
			return NextResponse.json(
				{ message: `GitHub responded ${res.status}`, events: [] },
				{ status: 200 },
			);
		}
		const raw = await res.json();
		const events = (Array.isArray(raw) ? raw : [])
			.map(summarize)
			.filter(Boolean)
			.slice(0, 6);

		return NextResponse.json(
			{ user, events },
			{ headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=300" } },
		);
	} catch (err) {
		console.error("[GET /api/github]", err);
		return NextResponse.json({ message: "Failed to load GitHub activity.", events: [] }, { status: 200 });
	}
}
