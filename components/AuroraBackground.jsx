"use client";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function AuroraBackground() {
	const pathname = usePathname();
	if (pathname?.startsWith("/admin")) return null;

	return (
		<>
			{/* Soft gradient base - light mode only */}
			<div
				className="pointer-events-none absolute inset-0 -z-20 dark:hidden"
				style={{
					background:
						"linear-gradient(135deg, #E0F2FE 0%, #F5F3FF 50%, #ECFEFF 100%)",
				}}
			/>
			{/* Dark mode base */}
			<div className="pointer-events-none absolute inset-0 -z-20 hidden dark:block bg-gray-950" />

			{/* Floating aurora blobs */}
			<div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
				<motion.div
					className="absolute -top-40 -left-32 h-[44rem] w-[44rem] rounded-full bg-sky-200/60 dark:bg-sky-500/[0.05] blur-3xl"
					animate={{ x: [0, 70, -30, 0], y: [0, 50, -40, 0] }}
					transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
				/>
				<motion.div
					className="absolute top-[28%] -right-40 h-[38rem] w-[38rem] rounded-full bg-violet-200/55 dark:bg-violet-500/[0.05] blur-3xl"
					animate={{ x: [0, -60, 40, 0], y: [0, 60, -50, 0] }}
					transition={{ duration: 34, repeat: Infinity, ease: "easeInOut" }}
				/>
				<motion.div
					className="absolute top-[55%] left-[20%] h-[34rem] w-[34rem] rounded-full bg-cyan-200/50 dark:bg-cyan-500/[0.04] blur-3xl"
					animate={{ x: [0, 50, -50, 0], y: [0, -40, 30, 0] }}
					transition={{ duration: 38, repeat: Infinity, ease: "easeInOut" }}
				/>
				<motion.div
					className="absolute bottom-[-10%] right-[15%] h-[30rem] w-[30rem] rounded-full bg-indigo-200/45 dark:bg-indigo-500/[0.04] blur-3xl"
					animate={{ x: [0, -40, 30, 0], y: [0, 30, -20, 0] }}
					transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
				/>
			</div>
		</>
	);
}
