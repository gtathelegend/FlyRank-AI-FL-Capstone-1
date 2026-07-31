"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { fetchJson } from "@/lib/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faHouse,
	faUser,
	faCode,
	faFolderOpen,
	faPaperPlane,
	faMagnifyingGlass,
	faCircleArrowRight,
	faCopy,
	faMoon,
	faSun,
	faCircleHalfStroke,
	faDownload,
	faArrowUpRightFromSquare,
	faBookOpen,
	faPenNib,
} from "@fortawesome/free-solid-svg-icons";
import { faGithub, faLinkedin } from "@fortawesome/free-brands-svg-icons";
import posthog from "posthog-js";

const PAGES = [
	{ icon: faHouse, label: "Home", hint: "/", href: "/", group: "Pages" },
	{ icon: faUser, label: "Ask Vedaang AI", hint: "/ask", href: "/ask", group: "Pages" },
	{ icon: faUser, label: "About", hint: "/about", href: "/about", group: "Pages" },
	{ icon: faCode, label: "Skills", hint: "/skills", href: "/skills", group: "Pages" },
	{ icon: faFolderOpen, label: "Projects", hint: "/projects", href: "/projects", group: "Pages" },
	{ icon: faFolderOpen, label: "Project archive", hint: "/projects/archive", href: "/projects/archive", group: "Pages" },
	{ icon: faBookOpen, label: "Research", hint: "/research", href: "/research", group: "Pages" },
	{ icon: faPenNib, label: "Blog", hint: "/blog", href: "/blog", group: "Pages" },
	{ icon: faPaperPlane, label: "Contact", hint: "/contact", href: "/contact", group: "Pages" },
];

function fuzzyScore(text, query) {
	if (!query) return 1;
	const t = text.toLowerCase();
	const q = query.toLowerCase();
	if (t === q) return 100;
	if (t.startsWith(q)) return 80;
	if (t.includes(q)) return 60;
	let i = 0;
	let score = 0;
	for (const ch of q) {
		const idx = t.indexOf(ch, i);
		if (idx === -1) return 0;
		score += idx === i ? 6 : 2;
		i = idx + 1;
	}
	return score;
}

function copy(text) {
	if (typeof navigator !== "undefined" && navigator.clipboard) {
		return navigator.clipboard.writeText(text).catch(() => {});
	}
}

export default function CommandPalette({ introReady = false }) {
	const router = useRouter();
	const pathname = usePathname();
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [active, setActive] = useState(0);
	const [projects, setProjects] = useState([]);
	const [settings, setSettings] = useState(null);
	const inputRef = useRef(null);
	const listRef = useRef(null);

	const isAdmin = pathname?.startsWith("/admin");

	useEffect(() => {
		if (isAdmin) return;
		let mounted = true;
		Promise.all([
			fetchJson("/api/projects").catch(() => ({ data: [] })),
			fetchJson("/api/settings").catch(() => ({ data: {} })),
		]).then(([proj, set]) => {
			if (!mounted) return;
			setProjects(proj.data || []);
			setSettings(set.data || {});
		});
		return () => {
			mounted = false;
		};
	}, [isAdmin]);

	const setTheme = useCallback((theme) => {
		try {
			document.documentElement.setAttribute("data-theme", theme);
			localStorage.setItem("theme", theme);
			window.dispatchEvent(new CustomEvent("themechange", { detail: { theme } }));
		} catch {}
	}, []);

	const email = useMemo(() => {
		if (!settings) return "vedaangsharma2006@gmail.com";
		const e = settings.email || "vedaangsharma2006@gmail.com";
		return e.replace(/^mailto:/, "");
	}, [settings]);

	const cvUrl = "/api/resume";

	const allItems = useMemo(() => {
		const projectItems = (projects || [])
			.filter((p) => p.show !== false && p.status !== "draft")
			.slice(0, 12)
			.map((p) => ({
				icon: faFolderOpen,
				label: p.title,
				hint: `Project · ${p.year || ""}`.trim(),
				href: `/projects/${p.slug}`,
				group: "Projects",
				keywords: (p.tech || p.techStack || []).join(" "),
			}));

		const actions = [
			{
				icon: faCopy,
				label: "Copy email",
				hint: email,
				group: "Actions",
				onSelect: () => copy(email),
				ephemeral: "Email copied",
			},
			{
				icon: faPaperPlane,
				label: "Email me",
				hint: `mailto:${email}`,
				group: "Actions",
				onSelect: () => {
					window.location.href = `mailto:${email}`;
				},
			},
			{
				icon: faDownload,
				label: "Download CV",
				hint: "Resume PDF",
				group: "Actions",
				onSelect: () => {
					const a = document.createElement("a");
					a.href = "/api/resume";
					posthog.capture("cv_downloaded", { source: "command_palette" });
					a.download = "Vedaang_Sharma_Resume.pdf";
					a.click();
				},
			},
			{
				icon: faGithub,
				label: "Open GitHub",
				hint: "github.com/gtathelegend",
				group: "Actions",
				onSelect: () => window.open("https://github.com/gtathelegend", "_blank", "noopener,noreferrer"),
			},
			{
				icon: faLinkedin,
				label: "Open LinkedIn",
				hint: "linkedin.com/in/vedaangsharma2006",
				group: "Actions",
				onSelect: () =>
					window.open("https://www.linkedin.com/in/vedaangsharma2006/", "_blank", "noopener,noreferrer"),
			},
		];

		const themes = [
			{ icon: faSun, label: "Theme: Light", hint: "data-theme=light", group: "Theme", onSelect: () => setTheme("light") },
			{ icon: faMoon, label: "Theme: Dark", hint: "data-theme=dark", group: "Theme", onSelect: () => setTheme("dark") },
			{
				icon: faCircleHalfStroke,
				label: "Theme: Monochrome",
				hint: "data-theme=mono",
				group: "Theme",
				onSelect: () => setTheme("mono"),
			},
		];

		return [...PAGES, ...projectItems, ...actions, ...themes];
	}, [projects, email, setTheme]);

	const filtered = useMemo(() => {
		if (!query) return allItems;
		return allItems
			.map((item) => {
				const fields = [item.label, item.hint || "", item.keywords || ""].join(" ");
				return { item, score: fuzzyScore(fields, query) };
			})
			.filter((x) => x.score > 0)
			.sort((a, b) => b.score - a.score)
			.map((x) => x.item);
	}, [allItems, query]);

	const grouped = useMemo(() => {
		const map = new Map();
		for (const item of filtered) {
			if (!map.has(item.group)) map.set(item.group, []);
			map.get(item.group).push(item);
		}
		return Array.from(map.entries());
	}, [filtered]);

	useEffect(() => {
		if (isAdmin) return;
		const onKey = (e) => {
			const isMod = e.metaKey || e.ctrlKey;
			if (isMod && (e.key === "k" || e.key === "K")) {
				e.preventDefault();
				setOpen((v) => !v);
				return;
			}
			if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
				e.preventDefault();
				setOpen(true);
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [isAdmin]);

	useEffect(() => {
		if (open) {
			posthog.capture("command_palette_opened");
			setQuery("");
			setActive(0);
			setTimeout(() => inputRef.current?.focus(), 0);
		}
	}, [open]);

	useEffect(() => {
		setActive(0);
	}, [query]);

	useEffect(() => {
		if (!open) return;
		const node = listRef.current?.querySelector(`[data-idx="${active}"]`);
		node?.scrollIntoView({ block: "nearest" });
	}, [active, open]);

	const runItem = useCallback(
		(item) => {
			if (!item) return;
			posthog.capture("command_palette_item_selected", { label: item.label, group: item.group });
			if (item.onSelect) {
				item.onSelect();
				setOpen(false);
				return;
			}
			if (item.href) {
				if (item.href.startsWith("http")) {
					window.open(item.href, "_blank", "noopener,noreferrer");
				} else {
					router.push(item.href);
				}
				setOpen(false);
			}
		},
		[router],
	);

	const handleKey = (e) => {
		if (e.key === "Escape") {
			e.preventDefault();
			setOpen(false);
			return;
		}
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setActive((i) => Math.min(filtered.length - 1, i + 1));
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setActive((i) => Math.max(0, i - 1));
		} else if (e.key === "Enter") {
			e.preventDefault();
			runItem(filtered[active]);
		}
	};

	if (isAdmin) return null;

	let runningIdx = 0;

	return (
		<>
			<AnimatePresence>
				{open && (
					<motion.div
						className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4 bg-black/40 backdrop-blur-sm"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={() => setOpen(false)}
					>
						<motion.div
							role="dialog"
							aria-label="Command palette"
							onClick={(e) => e.stopPropagation()}
							className="w-full max-w-xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden"
							initial={{ y: 16, opacity: 0, scale: 0.98 }}
							animate={{ y: 0, opacity: 1, scale: 1 }}
							exit={{ y: 8, opacity: 0, scale: 0.98 }}
							transition={{ type: "spring", stiffness: 260, damping: 24 }}
						>
							<div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-white/10">
								<FontAwesomeIcon icon={faMagnifyingGlass} className="text-gray-400 dark:text-gray-500" />
								<input
									ref={inputRef}
									value={query}
									onChange={(e) => setQuery(e.target.value)}
									onKeyDown={handleKey}
									placeholder="Search pages, projects, or actions…"
									className="flex-1 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none text-sm"
								/>
								<kbd className="hidden sm:inline px-1.5 py-0.5 text-[10px] font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded">
									esc
								</kbd>
							</div>

							<div ref={listRef} className="max-h-[55vh] overflow-y-auto py-2">
								{grouped.length === 0 ? (
									<p className="px-4 py-10 text-center text-sm text-gray-400 dark:text-gray-500">No matches.</p>
								) : (
									grouped.map(([group, items]) => (
										<div key={group} className="py-1">
											<p className="px-4 pt-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
												{group}
											</p>
											<ul>
												{items.map((item) => {
													const idx = runningIdx++;
													const isActive = idx === active;
													return (
														<li key={`${group}-${item.label}-${idx}`}>
															<button
																type="button"
																data-idx={idx}
																onMouseEnter={() => setActive(idx)}
																onClick={() => runItem(item)}
																className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition ${
																	isActive ? "bg-gray-100 dark:bg-white/10" : "hover:bg-gray-50 dark:hover:bg-white/5"
																}`}
															>
																<span className="w-7 h-7 rounded-lg bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-600 dark:text-gray-300 text-xs">
																	<FontAwesomeIcon icon={item.icon} />
																</span>
																<span className="flex-1 min-w-0">
																	<span className="block text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
																		{item.label}
																	</span>
																	{item.hint && (
																		<span className="block text-[11px] text-gray-400 dark:text-gray-500 truncate font-mono">
																			{item.hint}
																		</span>
																	)}
																</span>
																{isActive && (
																	<FontAwesomeIcon icon={faCircleArrowRight} className="text-gray-400 dark:text-gray-500 text-xs" />
																)}
															</button>
														</li>
													);
												})}
											</ul>
										</div>
									))
								)}
							</div>

							<div className="flex items-center justify-between gap-3 px-4 py-2.5 text-[11px] text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-white/10 bg-gray-50/60 dark:bg-white/[0.02]">
								<div className="flex items-center gap-3">
									<span>
										<kbd className="px-1.5 py-0.5 bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded font-semibold">↑↓</kbd>{" "}
										navigate
									</span>
									<span>
										<kbd className="px-1.5 py-0.5 bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded font-semibold">↵</kbd>{" "}
										select
									</span>
								</div>
								<span className="hidden sm:inline">
									<kbd className="px-1.5 py-0.5 bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded font-semibold">⌘K</kbd>{" "}
									anywhere
								</span>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Floating launcher (visible on desktop) */}
			<motion.button
				type="button"
				onClick={() => setOpen(true)}
				aria-label="Open command palette"
				initial={{ opacity: 0, y: 8 }}
				animate={introReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
				transition={{ duration: 0.4, delay: introReady ? 0.6 : 0 }}
				className="hidden md:flex fixed bottom-6 right-6 z-[80] items-center gap-2 px-3.5 py-2 rounded-full bg-white/85 dark:bg-gray-900/85 backdrop-blur border border-gray-200 dark:border-white/10 shadow-lg text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-900 transition"
				style={{ pointerEvents: introReady ? "auto" : "none" }}
			>
				<FontAwesomeIcon icon={faMagnifyingGlass} />
				<span>Quick search</span>
				<kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded text-[10px] font-semibold">
					⌘K
				</kbd>
			</motion.button>
		</>
	);
}
