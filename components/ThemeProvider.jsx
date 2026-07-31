"use client";

import { useEffect } from "react";

const VALID = ["light", "dark", "mono"];

export const THEME_INIT_SCRIPT = `
try {
	var stored = localStorage.getItem('theme');
	if (!['light','dark','mono'].includes(stored)) stored = 'light';
	document.documentElement.setAttribute('data-theme', stored);
} catch (_) {
	document.documentElement.setAttribute('data-theme', 'light');
}
`;

export default function ThemeProvider() {
	useEffect(() => {
		const apply = (value) => {
			const theme = VALID.includes(value) ? value : "light";
			document.documentElement.setAttribute("data-theme", theme);
		};

		const stored = (() => {
			try {
				return localStorage.getItem("theme");
			} catch {
				return null;
			}
		})();
		if (!stored) {
			apply("light");
		} else {
			apply(stored);
		}

		const onChange = (e) => apply(e.detail?.theme);
		window.addEventListener("themechange", onChange);
		return () => window.removeEventListener("themechange", onChange);
	}, []);

	return null;
}
