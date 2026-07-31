"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const COLS = 18;
const ROWS = 14;
const TICK_MS = 110;

const DIRS = {
	ArrowUp: { x: 0, y: -1 },
	ArrowDown: { x: 0, y: 1 },
	ArrowLeft: { x: -1, y: 0 },
	ArrowRight: { x: 1, y: 0 },
	w: { x: 0, y: -1 },
	s: { x: 0, y: 1 },
	a: { x: -1, y: 0 },
	d: { x: 1, y: 0 },
};

function randomFood(snake) {
	while (true) {
		const f = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
		if (!snake.some((s) => s.x === f.x && s.y === f.y)) return f;
	}
}

const initialSnake = () => [
	{ x: Math.floor(COLS / 2) - 1, y: Math.floor(ROWS / 2) },
	{ x: Math.floor(COLS / 2) - 2, y: Math.floor(ROWS / 2) },
	{ x: Math.floor(COLS / 2) - 3, y: Math.floor(ROWS / 2) },
];

function SnakeGame() {
	const [snake, setSnake] = useState(initialSnake);
	const [food, setFood] = useState(() => randomFood(initialSnake()));
	const [dir, setDir] = useState({ x: 1, y: 0 });
	const [running, setRunning] = useState(false);
	const [score, setScore] = useState(0);
	const [best, setBest] = useState(0);
	const [over, setOver] = useState(false);
	const dirRef = useRef(dir);
	dirRef.current = dir;

	useEffect(() => {
		try {
			const stored = Number(localStorage.getItem("snake_best") || 0);
			if (Number.isFinite(stored)) setBest(stored);
		} catch {}
	}, []);

	const reset = useCallback(() => {
		const s = initialSnake();
		setSnake(s);
		setFood(randomFood(s));
		setDir({ x: 1, y: 0 });
		setScore(0);
		setOver(false);
		setRunning(true);
	}, []);

	useEffect(() => {
		const onKey = (e) => {
			const next = DIRS[e.key];
			if (next) {
				e.preventDefault();
				const cur = dirRef.current;
				if (cur.x + next.x === 0 && cur.y + next.y === 0) return;
				setDir(next);
				if (!running && !over) setRunning(true);
			} else if (e.key === " " || e.key === "Enter") {
				e.preventDefault();
				if (over) reset();
				else setRunning((r) => !r);
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [running, over, reset]);

	useEffect(() => {
		if (!running || over) return;
		const id = setInterval(() => {
			setSnake((prev) => {
				const head = prev[0];
				const d = dirRef.current;
				const next = { x: head.x + d.x, y: head.y + d.y };
				if (next.x < 0 || next.y < 0 || next.x >= COLS || next.y >= ROWS) {
					setOver(true);
					setRunning(false);
					return prev;
				}
				if (prev.some((s, i) => i > 0 && s.x === next.x && s.y === next.y)) {
					setOver(true);
					setRunning(false);
					return prev;
				}
				const ate = next.x === food.x && next.y === food.y;
				const body = ate ? [next, ...prev] : [next, ...prev.slice(0, -1)];
				if (ate) {
					setScore((s) => {
						const ns = s + 1;
						setBest((b) => {
							const nb = Math.max(b, ns);
							try {
								localStorage.setItem("snake_best", String(nb));
							} catch {}
							return nb;
						});
						return ns;
					});
					setFood(randomFood(body));
				}
				return body;
			});
		}, TICK_MS);
		return () => clearInterval(id);
	}, [running, over, food]);

	const cells = [];
	for (let y = 0; y < ROWS; y++) {
		for (let x = 0; x < COLS; x++) {
			const isHead = snake[0]?.x === x && snake[0]?.y === y;
			const isBody = !isHead && snake.some((s) => s.x === x && s.y === y);
			const isFood = food.x === x && food.y === y;
			cells.push(
				<div
					key={`${x}-${y}`}
					className={`aspect-square rounded-[3px] ${
						isHead
							? "bg-emerald-400"
							: isBody
								? "bg-emerald-500/70"
								: isFood
									? "bg-red-400"
									: "bg-gray-800/40"
					}`}
				/>,
			);
		}
	}

	return (
		<div className="rounded-2xl border border-gray-800 bg-gray-950 text-gray-100 p-5 sm:p-6 shadow-xl">
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-2">
					<span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
					<span className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
					<span className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
					<span className="ml-2 text-[11px] uppercase tracking-widest text-gray-400">
						snake.exe
					</span>
				</div>
				<div className="flex items-center gap-3 text-xs">
					<span className="text-gray-400">
						score <span className="text-emerald-400 font-mono font-bold">{score}</span>
					</span>
					<span className="text-gray-500">
						best <span className="text-gray-300 font-mono font-bold">{best}</span>
					</span>
				</div>
			</div>

			<div
				className="grid gap-[2px] mb-4 select-none"
				style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
			>
				{cells}
			</div>

			<div className="flex items-center justify-between gap-3 text-xs text-gray-400">
				<p>
					<span className="font-mono text-gray-300">arrows / wasd</span> to move ·{" "}
					<span className="font-mono text-gray-300">space</span> to{" "}
					{over ? "restart" : running ? "pause" : "play"}
				</p>
				<button
					type="button"
					onClick={() => (over ? reset() : setRunning((r) => !r))}
					className="px-3 py-1.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/25 transition"
				>
					{over ? "Restart" : running ? "Pause" : "Play"}
				</button>
			</div>

			{over && (
				<motion.p
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="mt-3 text-center text-sm text-red-300"
				>
					Game over - press space to play again.
				</motion.p>
			)}
		</div>
	);
}

export default function NotFound() {
	return (
		<main className="min-h-screen bg-white dark:bg-transparent">
			<section className="pt-28 md:pt-36 pb-24 md:pb-32 px-6 sm:px-10 lg:px-16">
				<div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
					<div>
						<p className="text-[11px] font-bold uppercase tracking-[.35rem] text-gray-400 dark:text-gray-500 mb-3">
							Page not found
						</p>
						<h1 className="text-7xl sm:text-8xl md:text-9xl font-bold text-gray-900 dark:text-white leading-none tracking-tight mb-6">
							404
						</h1>
						<p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg leading-relaxed max-w-md mb-8">
							Looks like you&apos;ve wandered off the map. While you&apos;re here, want to play a
							quick round of snake?
						</p>
						<div className="flex flex-wrap gap-3">
							<Link
								href="/"
								className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 text-white dark:bg-white dark:text-gray-900 text-sm font-semibold hover:bg-gray-700 dark:hover:bg-gray-200 transition shadow-sm"
							>
								Take me home
							</Link>
							<button
								onClick={() => window.history.back()}
								className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 dark:border-white/15 text-gray-700 dark:text-gray-200 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-white/5 transition"
							>
								Go back
							</button>
						</div>
					</div>

					<div>
						<SnakeGame />
					</div>
				</div>
			</section>
		</main>
	);
}
