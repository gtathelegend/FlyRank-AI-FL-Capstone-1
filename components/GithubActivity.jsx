"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";

function timeAgo(iso) {
	if (!iso) return "";
	const diff = Date.now() - new Date(iso).getTime();
	if (Number.isNaN(diff)) return "";
	const m = Math.floor(diff / 60000);
	if (m < 1) return "just now";
	if (m < 60) return `${m}m ago`;
	const h = Math.floor(m / 60);
	if (h < 24) return `${h}h ago`;
	const d = Math.floor(h / 24);
	if (d < 30) return `${d}d ago`;
	const mo = Math.floor(d / 30);
	if (mo < 12) return `${mo}mo ago`;
	return `${Math.floor(mo / 12)}y ago`;
}

export default function GithubActivity({ user }) {
	const [state, setState] = useState({ status: "loading", events: [] });

	useEffect(() => {
		let mounted = true;
		const url = user ? `/api/github?user=${encodeURIComponent(user)}` : "/api/github";
		fetch(url)
			.then((r) => r.json())
			.then((data) => {
				if (!mounted) return;
				setState({
					status: data.events?.length ? "ready" : "empty",
					events: data.events || [],
					user: data.user,
				});
			})
			.catch(() => mounted && setState({ status: "error", events: [] }));
		return () => {
			mounted = false;
		};
	}, [user]);

	const profileUrl = state.user ? `https://github.com/${state.user}` : "https://github.com";

	return (
		<div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/[0.03] p-6 sm:p-8 shadow-sm">
			<div className="flex items-center justify-between gap-3 mb-5">
				<div className="flex items-center gap-2.5">
					<div className="w-9 h-9 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 flex items-center justify-center">
						<FontAwesomeIcon icon={faGithub} />
					</div>
					<div>
						<h3 className="text-sm font-semibold text-gray-900 dark:text-white">Live from GitHub</h3>
						<p className="text-[11px] text-gray-500 dark:text-gray-400">Latest public activity</p>
					</div>
				</div>
				<a
					href={profileUrl}
					target="_blank"
					rel="noopener noreferrer"
					className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition inline-flex items-center gap-1.5"
				>
					Profile <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-[10px]" />
				</a>
			</div>

			{state.status === "loading" && (
				<ul className="space-y-2 animate-pulse">
					{Array.from({ length: 4 }).map((_, i) => (
						<li key={i} className="h-12 rounded-lg bg-gray-100 dark:bg-white/5" />
					))}
				</ul>
			)}

			{state.status === "error" && (
				<p className="text-sm text-gray-500 dark:text-gray-400 italic">Couldn&apos;t reach GitHub right now.</p>
			)}

			{state.status === "empty" && (
				<p className="text-sm text-gray-500 dark:text-gray-400 italic">No public activity yet.</p>
			)}

			{state.status === "ready" && (
				<ul className="divide-y divide-gray-100 dark:divide-white/10">
					{state.events.map((e, i) => (
						<motion.li
							key={`${e.repo}-${e.created_at}-${i}`}
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: i * 0.04 }}
							className="py-3 first:pt-0 last:pb-0"
						>
							<a
								href={e.url || "#"}
								target="_blank"
								rel="noopener noreferrer"
								className="group flex gap-3 items-start"
							>
								<span className="font-mono text-sm w-6 text-center text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition shrink-0">
									{e.icon}
								</span>
								<div className="min-w-0 flex-1">
									<div className="flex flex-wrap items-baseline gap-x-2">
										<span className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition">
											{e.title}
										</span>
										{e.repo && (
											<span className="font-mono text-[12px] text-gray-500 dark:text-gray-400 truncate">
												{e.repo}
											</span>
										)}
									</div>
									{e.detail && (
										<p className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{e.detail}</p>
									)}
								</div>
								<span className="text-[11px] text-gray-400 dark:text-gray-500 whitespace-nowrap pt-0.5">
									{timeAgo(e.created_at)}
								</span>
							</a>
						</motion.li>
					))}
				</ul>
			)}
		</div>
	);
}
