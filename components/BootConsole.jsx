"use client";

import { useEffect, useRef, useState } from "react";

const SEQUENCE = [
	{ cmd: "whoami", out: "vedaang.sharma - full stack developer, jaipur" },
	{ cmd: "stack --list", out: "react · next.js · node · python · ai/ml" },
	{ cmd: "open --portfolio", out: "[OK] welcome." },
];

const TYPE_SPEED = 28;
const OUT_SPEED = 14;
const PAUSE_AFTER_CMD = 200;
const PAUSE_AFTER_OUT = 320;

export default function BootConsole({ onDone, className = "" }) {
	const [lines, setLines] = useState([]);
	const [done, setDone] = useState(false);
	const cancelled = useRef(false);
	const onDoneRef = useRef(onDone);
	onDoneRef.current = onDone;

	useEffect(() => {
		cancelled.current = false;
		setLines([]);
		setDone(false);

		const sleep = (ms) =>
			new Promise((resolve) => {
				const id = setTimeout(resolve, ms);
				return id;
			});

		async function run() {
			for (let i = 0; i < SEQUENCE.length; i++) {
				if (cancelled.current) return;
				const { cmd, out } = SEQUENCE[i];

				setLines((prev) => [...prev, { kind: "cmd", text: "" }]);
				for (let c = 1; c <= cmd.length; c++) {
					if (cancelled.current) return;
					await sleep(TYPE_SPEED);
					setLines((prev) => {
						const next = prev.slice();
						next[next.length - 1] = { kind: "cmd", text: cmd.slice(0, c) };
						return next;
					});
				}
				await sleep(PAUSE_AFTER_CMD);
				if (cancelled.current) return;

				setLines((prev) => [...prev, { kind: "out", text: "" }]);
				for (let c = 1; c <= out.length; c++) {
					if (cancelled.current) return;
					await sleep(OUT_SPEED);
					setLines((prev) => {
						const next = prev.slice();
						next[next.length - 1] = { kind: "out", text: out.slice(0, c) };
						return next;
					});
				}
				await sleep(PAUSE_AFTER_OUT);
			}
			if (!cancelled.current) {
				setDone(true);
				onDoneRef.current?.();
			}
		}

		run();
		return () => {
			cancelled.current = true;
		};
	}, []);

	return (
		<div
			className={`rounded-xl border border-gray-200 bg-gray-950 text-gray-100 shadow-lg overflow-hidden font-mono text-[12px] sm:text-[13px] leading-relaxed ${className}`}
			role="presentation"
			aria-hidden="true"
		>
			<div className="flex items-center gap-1.5 px-3 py-2 bg-gray-900/60 border-b border-white/5">
				<span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
				<span className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
				<span className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
				<span className="ml-2 text-[10px] text-gray-400 tracking-widest uppercase">~ / portfolio</span>
			</div>
			<div className="px-4 py-3 space-y-1 min-h-[112px]">
				{lines.map((line, i) => {
					const isLast = i === lines.length - 1 && !done;
					if (line.kind === "cmd") {
						return (
							<div key={i} className="flex gap-2">
								<span className="text-emerald-400 select-none">~ ❯</span>
								<span className="text-gray-100">
									{line.text}
									{isLast && <span className="ml-0.5 inline-block w-1.5 h-3 bg-gray-100 align-middle animate-pulse" />}
								</span>
							</div>
						);
					}
					return (
						<div key={i} className="text-gray-400 pl-5">
							{line.text}
							{isLast && <span className="ml-0.5 inline-block w-1.5 h-3 bg-gray-300 align-middle animate-pulse" />}
						</div>
					);
				})}
				{done && <div className="text-gray-600 text-[11px] mt-1">- ready.</div>}
			</div>
		</div>
	);
}
