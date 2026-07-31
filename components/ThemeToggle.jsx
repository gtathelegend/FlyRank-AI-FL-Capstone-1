"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun, faMoon } from "@fortawesome/free-solid-svg-icons";

const OPTIONS = [
	{ key: "light", label: "Light", icon: faSun },
	{ key: "dark",  label: "Dark",  icon: faMoon },
];

function readTheme() {
	if (typeof document === "undefined") return "light";
	return document.documentElement.getAttribute("data-theme") || "light";
}

export default function ThemeToggle({ className = "" }) {
	const [theme, setTheme] = useState("light");

	useEffect(() => {
		setTheme(readTheme());
		const observer = new MutationObserver(() => setTheme(readTheme()));
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["data-theme"],
		});
		return () => observer.disconnect();
	}, []);

	const apply = (next) => {
		try {
			document.documentElement.setAttribute("data-theme", next);
			localStorage.setItem("theme", next);
			window.dispatchEvent(new CustomEvent("themechange", { detail: { theme: next } }));
		} catch {}
		setTheme(next);
	};

	return (
		<div
			role="radiogroup"
			aria-label="Theme"
			className={`inline-flex items-center gap-0.5 p-0.5 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 ${className}`}
		>
			{OPTIONS.map((opt) => {
				const active = theme === opt.key;
				return (
					<button
						key={opt.key}
						type="button"
						role="radio"
						aria-checked={active}
						aria-label={`${opt.label} theme`}
						onClick={() => apply(opt.key)}
						className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] transition ${
							active
								? "bg-white text-gray-900 shadow-sm dark:bg-gray-100 dark:text-gray-900"
								: "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
						}`}
					>
						<FontAwesomeIcon icon={opt.icon} />
					</button>
				);
			})}
		</div>
	);
}
