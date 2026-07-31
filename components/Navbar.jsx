"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

const navLinks = [
	{ name: "Home",           href: "/" },
	{ name: "About",          href: "/about" },
	{ name: "Skills",         href: "/skills" },
	{ name: "Projects",       href: "/projects" },
	{ name: "Research",       href: "/research" },
	{ name: "Certifications", href: "/certifications" },
	{ name: "Blog",           href: "/blog" },
	{ name: "Contact",        href: "/contact" },
];

export default function Navbar({ introReady = false }) {
	const [isNavOpen, setIsNavOpen] = useState(false);
	const pathname = usePathname();

	useEffect(() => { setIsNavOpen(false); }, [pathname]);

	return (
		<>
			{/* Floating navbar */}
			<header className="fixed top-4 left-0 right-0 z-[60] flex justify-center px-4 pointer-events-none">
				<motion.div
					className="w-full max-w-6xl pointer-events-auto"
					initial={{ y: -24, opacity: 0 }}
					animate={introReady ? { y: 0, opacity: 1 } : { y: -24, opacity: 0 }}
					transition={{ type: "spring", stiffness: 120, damping: 22, delay: introReady ? 0.5 : 0 }}
				>
					<div className="flex items-center justify-between gap-4 bg-[#F7F5DC]/85 dark:bg-[#141310]/85 backdrop-blur-md border border-[#E3DEC3] dark:border-[#33312B] rounded-2xl shadow-subtle px-4 py-2.5">

						{/* Logo */}
						<Link
							href="/"
							className="shrink-0 font-heading font-bold text-base text-[#181713] dark:text-[#F7F5DC] tracking-tight hover:text-[#FF8A00] dark:hover:text-[#FFC233] transition-colors flex items-center gap-2"
						>
							<span className="w-2.5 h-2.5 rounded-full bg-[#FFC233] inline-block" />
							<span>Vedaang Sharma</span>
						</Link>

						{/* Desktop links */}
						<nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
							{navLinks.map((link) => {
								const active = pathname === link.href;
								return (
									<Link
										key={link.name}
										href={link.href}
										className={`relative px-3 py-1.5 text-xs font-medium rounded-xl transition-all duration-150 ${
											active
												? "text-[#181713] dark:text-[#F7F5DC] font-semibold"
												: "text-[#57534E] dark:text-[#9E9A8B] hover:text-[#181713] dark:hover:text-[#F7F5DC] hover:bg-[#F0EDD4]/60 dark:hover:bg-[#22211C]/60"
										}`}
									>
										{link.name}
										{active && (
											<motion.span
												layoutId="nav-pill"
												className="absolute inset-0 rounded-xl bg-[#F0EDD4] dark:bg-[#22211C] border border-[#E3DEC3] dark:border-[#33312B] -z-10"
												transition={{ type: "spring", stiffness: 350, damping: 30 }}
											/>
										)}
									</Link>
								);
							})}
						</nav>

						{/* Right actions */}
						<div className="flex items-center gap-2 shrink-0">
							<ThemeToggle />

							{/* Hamburger — mobile only */}
							<button
								className="flex md:hidden flex-col justify-center items-center gap-[5px] w-9 h-9 rounded-xl border border-[#E3DEC3] dark:border-[#33312B] bg-[#F0EDD4]/60 dark:bg-[#1E1D19]/60 hover:bg-[#F0EDD4] dark:hover:bg-[#22211C] transition"
								onClick={() => setIsNavOpen(!isNavOpen)}
								aria-label={isNavOpen ? "Close menu" : "Open menu"}
								aria-expanded={isNavOpen}
							>
								<motion.span
									className="block w-4 h-0.5 bg-[#181713] dark:bg-[#F7F5DC] rounded-full origin-center"
									animate={isNavOpen ? { rotate: 45, y: 5.5 } : { rotate: 0, y: 0 }}
									transition={{ duration: 0.2 }}
								/>
								<motion.span
									className="block w-4 h-0.5 bg-[#181713] dark:bg-[#F7F5DC] rounded-full origin-center"
									animate={isNavOpen ? { rotate: -45, y: -5.5 } : { rotate: 0, y: 0 }}
									transition={{ duration: 0.2 }}
								/>
							</button>
						</div>
					</div>
				</motion.div>
			</header>

			{/* Mobile fullscreen menu */}
			<AnimatePresence>
				{isNavOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						className="fixed inset-0 z-[55] md:hidden bg-[#F7F5DC]/98 dark:bg-[#141310]/98 backdrop-blur-xl flex flex-col justify-center items-center px-6"
					>
						<div className="flex flex-col items-center gap-6 w-full max-w-sm">
							<p className="text-[10px] font-mono font-bold uppercase tracking-[0.5rem] text-[#FF8A00] dark:text-[#FFC233] mb-2">
								Navigation
							</p>
							{navLinks.map((link, i) => (
								<motion.div
									key={link.name}
									initial={{ opacity: 0, y: 12 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: i * 0.05, type: "spring", stiffness: 200, damping: 20 }}
									className="w-full text-center"
								>
									<Link
										href={link.href}
										onClick={() => setIsNavOpen(false)}
										className={`block py-2 text-2xl sm:text-3xl font-heading font-bold transition-colors ${
											pathname === link.href
												? "text-[#FF8A00] dark:text-[#FFC233]"
												: "text-[#181713] dark:text-[#F7F5DC] hover:text-[#FF8A00] dark:hover:text-[#FFC233]"
										}`}
									>
										{link.name}
									</Link>
								</motion.div>
							))}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
