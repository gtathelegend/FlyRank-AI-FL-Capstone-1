"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import Container from "@/components/ui/Container";

const FOOTER_LINKS = [
	{
		group: "Pages",
		links: [
			{ label: "Home", href: "/" },
			{ label: "About", href: "/about" },
			{ label: "Skills", href: "/skills" },
		],
	},
	{
		group: "Work",
		links: [
			{ label: "Projects", href: "/projects" },
			{ label: "Research", href: "/research" },
			{ label: "Blog", href: "/blog" },
			{ label: "Archive", href: "/projects/archive" },
		],
	},
	{
		group: "Connect",
		links: [
			{ label: "Contact", href: "/contact" },
			{ label: "GitHub", href: "https://github.com/gtathelegend", external: true },
			{ label: "LinkedIn", href: "https://www.linkedin.com/in/vedaangsharma2006/", external: true },
			{ label: "Email", href: "mailto:vedaangsharma2006@gmail.com", external: true },
		],
	},
];

export default function Footer() {
	return (
		<footer className="bg-[#F0EDD4]/60 dark:bg-[#1A1915] border-t border-[#E3DEC3] dark:border-[#33312B] text-[#181713] dark:text-[#F7F5DC]">
			{/* CTA Strip */}
			<div className="py-12 md:py-16 border-b border-[#E3DEC3]/60 dark:border-[#33312B]/60">
				<Container size="lg">
					<motion.div
						className="text-center max-w-2xl mx-auto"
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4 }}
						viewport={{ once: true }}
					>
						<span className="inline-block text-[11px] font-mono font-bold uppercase tracking-widest text-[#FF8A00] dark:text-[#FFC233] bg-[#FF8A00]/10 dark:bg-[#FFC233]/10 border border-[#FF8A00]/20 dark:border-[#FFC233]/20 px-3 py-1 rounded-full mb-4">
							Interested in collaborating?
						</span>
						<h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-[#181713] dark:text-[#F7F5DC] mb-4">
							Let&apos;s Work Together
						</h2>
						<p className="text-sm sm:text-base text-[#57534E] dark:text-[#9E9A8B] mb-6 leading-relaxed">
							Have an AI engineering project, research inquiry, or open position? Let&apos;s talk.
						</p>
						<Link
							href="/contact"
							className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#181713] text-[#F7F5DC] dark:bg-[#F7F5DC] dark:text-[#181713] text-sm font-semibold hover:bg-[#2A2823] dark:hover:bg-[#EFECCA] transition-all shadow-subtle"
						>
							<span>Get In Touch</span>
							<span>&rarr;</span>
						</Link>
					</motion.div>
				</Container>
			</div>

			{/* Link columns */}
			<div className="py-12">
				<Container size="lg">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-8">
						{/* Brand column */}
						<div className="col-span-2 md:col-span-1">
							<Link href="/" className="font-heading font-bold text-lg text-[#181713] dark:text-[#F7F5DC] block mb-1">
								Vedaang Sharma
							</Link>
							<p className="text-xs text-[#57534E] dark:text-[#9E9A8B] leading-relaxed max-w-[200px]">
								Full Stack &amp; AI Systems Developer
							</p>
						</div>

						{/* Nav columns */}
						{FOOTER_LINKS.map((col) => (
							<div key={col.group}>
								<p className="text-xs font-mono font-bold uppercase tracking-wider text-[#FF8A00] dark:text-[#FFC233] mb-3">
									{col.group}
								</p>
								<ul className="space-y-2">
									{col.links.map((link) => (
										<li key={link.label}>
											{link.external ? (
												<a
													href={link.href}
													target="_blank"
													rel="noopener noreferrer"
													className="text-sm text-[#57534E] hover:text-[#181713] dark:text-[#9E9A8B] dark:hover:text-[#F7F5DC] transition-colors"
												>
													{link.label}
												</a>
											) : (
												<Link
													href={link.href}
													className="text-sm text-[#57534E] hover:text-[#181713] dark:text-[#9E9A8B] dark:hover:text-[#F7F5DC] transition-colors"
												>
													{link.label}
												</Link>
											)}
										</li>
									))}
								</ul>
							</div>
						))}
					</div>
				</Container>
			</div>

			{/* Copyright */}
			<div className="py-6 border-t border-[#E3DEC3]/60 dark:border-[#33312B]/60">
				<Container size="lg" className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#787467] dark:text-[#9E9A8B]">
					<p>
						&copy;{new Date().getFullYear()} <span className="font-semibold text-[#181713] dark:text-[#F7F5DC]">Vedaang Sharma</span>. All rights reserved.
					</p>
					<p className="text-[11px]">
						Portfolio V2 &middot; Designed with Warm Editorial Aesthetics
					</p>
				</Container>
			</div>
		</footer>
	);
}
