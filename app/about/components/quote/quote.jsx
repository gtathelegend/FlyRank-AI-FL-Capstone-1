// Quote.js
import "./style.css";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useIntersectionObserver } from "./useIntersectionObserver";
import { fetchJson } from "@/lib/api";

const DEFAULT_QUOTE = "There are no limits to what you can accomplish except the limits you place on your own thinking.";

function Wrapper({ children }) {
	return (
		<div className="min-h-[60vh] md:min-h-[80vh] mx-auto container px-6 sm:px-10 py-10 grid grid-cols-1 mt-6 md:mt-10">
			<motion.div
				className="flex justify-center items-center flex-col mb-5"
				initial={{
					opacity: 0,
					scale: 0.9,
				}}
				whileInView={{
					opacity: 1,
					scale: 1,
				}}
				transition={{
					delay: 0.6,
					duration: 2,
					ease: [0.22, 1, 0.36, 1],
				}}>
				{children}
			</motion.div>
		</div>
	);
}

export default function Quote() {
	const [quoteText, setQuoteText] = useState(DEFAULT_QUOTE);
	const [ref, isIntersecting] = useIntersectionObserver();

	useEffect(() => {
		fetchJson("/api/settings")
			.then((res) => {
				const q = res.data?.quote_text;
				if (q && q.trim()) setQuoteText(q.trim());
			})
			.catch(() => {});
	}, []);

	const words = quoteText.replace(/^[""]|[""]$/g, "").split(" ");
	const isLong = words.length > 12;
	const firstHalf  = isLong ? words.slice(0, Math.ceil(words.length / 2)) : words;
	const secondHalf = isLong ? words.slice(Math.ceil(words.length / 2))    : [];

	return (
		<Wrapper>
			<div ref={ref} className="text-center">
				<h3 className="text-xl sm:text-2xl md:text-3xl lg:text-[2rem] leading-snug">
					&ldquo;{firstHalf.map((word, index) => (
						<motion.span
							key={index}
							initial={{ opacity: 0, filter: "blur(4px)", scale: 0.92 }}
							animate={{
								opacity: isIntersecting ? 1 : 0,
								filter: isIntersecting ? "blur(0px)" : "blur(4px)",
								scale: isIntersecting ? 1 : 0.92,
							}}
							transition={{ delay: isIntersecting ? index * 0.1 : 0, duration: 0.5 }}>
							{word}{" "}
						</motion.span>
					))}
				</h3>
				{secondHalf.length > 0 && (
					<h3 className="text-base sm:text-lg md:text-xl">
						{secondHalf.map((word, index) => (
							<motion.span
								key={index + firstHalf.length}
								initial={{ opacity: 0, filter: "blur(4px)", scale: 0.92 }}
								animate={{
									opacity: isIntersecting ? 1 : 0,
									filter: isIntersecting ? "blur(0px)" : "blur(4px)",
									scale: isIntersecting ? 1 : 0.92,
								}}
								transition={{ delay: isIntersecting ? (firstHalf.length + index) * 0.1 : 0, duration: 0.5 }}>
								{word}{" "}
							</motion.span>
						))}
						&rdquo;
					</h3>
				)}
				{secondHalf.length === 0 && <>&rdquo;</>}
			</div>
		</Wrapper>
	);
}
