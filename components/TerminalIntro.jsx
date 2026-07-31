"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BootConsole from "@/components/BootConsole";

const SESSION_KEY = "vs_intro_seen";

export default function TerminalIntro({ onDone }) {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		if (!sessionStorage.getItem(SESSION_KEY)) {
			setVisible(true);
		} else {
			onDone?.();
		}
	}, [onDone]);

	function handleDone() {
		setTimeout(() => {
			sessionStorage.setItem(SESSION_KEY, "1");
			setVisible(false);
			onDone?.();
		}, 700);
	}

	return (
		<AnimatePresence>
			{visible && (
				<motion.div
					className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-950"
					initial={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.7, ease: "easeInOut" }}
				>
					<BootConsole onDone={handleDone} className="w-full max-w-md mx-6" />
				</motion.div>
			)}
		</AnimatePresence>
	);
}
