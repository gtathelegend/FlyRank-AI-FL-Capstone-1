"use client";
import { motion } from "framer-motion";
import PropTypes from "prop-types";

/**
 * Canonical section header - micro-label + large bold heading.
 * Matches the home-page design language.
 */
export default function SectionHeader({ label, heading, className = "", id }) {
	const headingId = id || heading.toLowerCase().replace(/\s+/g, "-");
	return (
		<div className={`mb-8 ${className}`}>
			{label && (
				<motion.p
					className="text-[11px] font-bold uppercase tracking-[.35rem] text-gray-400 mb-3"
					initial={{ opacity: 0, x: -40 }}
					whileInView={{ opacity: 1, x: 0 }}
					transition={{ type: "spring", delay: 0.05 }}
					viewport={{ once: true, amount: 0.3 }}
				>
					{label}
				</motion.p>
			)}
			<motion.h2
				id={headingId}
				className="text-gray-900 dark:text-white text-3xl md:text-4xl lg:text-5xl font-bold leading-tight"
				initial={{ opacity: 0, x: -40 }}
				whileInView={{ opacity: 1, x: 0 }}
				transition={{ type: "spring", delay: 0.15 }}
				viewport={{ once: true, amount: 0.3 }}
			>
				{heading}
			</motion.h2>
		</div>
	);
}

SectionHeader.propTypes = {
	label: PropTypes.string,
	heading: PropTypes.string.isRequired,
	className: PropTypes.string,
	id: PropTypes.string,
};
