"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { fetchJson } from "@/lib/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { faArrowUpRightFromSquare, faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import SectionHeader from "@/components/SectionHeader";

export default function Page() {
	const [projects, setProjects] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		let isMounted = true;
		const loadProjects = async () => {
			try {
				const response = await fetchJson("/api/projects");
				if (isMounted) { setProjects(response.data || []); setError(""); }
			} catch (err) {
				if (isMounted) setError("Unable to load projects right now.");
			} finally {
				if (isMounted) setIsLoading(false);
			}
		};
		loadProjects();
		return () => { isMounted = false; };
	}, []);

	return (
		<main className="overflow-hidden bg-transparent min-h-screen">
			<div className="pt-28 md:pt-36 pb-16 md:pb-24 px-4 sm:px-8 md:px-16 max-w-6xl mx-auto">
				<Link href="/projects" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition mb-8">
					<FontAwesomeIcon icon={faChevronLeft} className="text-xs" /> Back to projects
				</Link>
				<SectionHeader label="Complete List" heading="Archive" />
				<p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base max-w-2xl mt-4 mb-2">
					Every project I&apos;ve worked on - including older experiments and side projects.
				</p>
				<div className="mt-8 overflow-x-auto">
					<table className="w-full">
						<thead>
							<tr className="border-b border-gray-200 dark:border-white/10">
								<th className="text-start text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider py-3 px-4">Year</th>
								<th className="text-start text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider py-3 px-4">Title</th>
								<th className="text-start text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider py-3 px-4 hidden md:table-cell">Technology</th>
								<th className="text-start text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider py-3 px-4">Links</th>
							</tr>
						</thead>
						<tbody>
							{isLoading && (
								<tr><td colSpan={4} className="py-6 text-center text-gray-500">Loading projects...</td></tr>
							)}
							{!isLoading && error && (
								<tr><td colSpan={4} className="py-6 text-center text-red-600">{error}</td></tr>
							)}
							{!isLoading && !error && projects.map((project, index) => (
								<motion.tr key={index}
									className="border-b border-gray-100 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors duration-200 rounded-lg"
									initial={{ opacity: 0, y: 10 }}
									whileInView={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.03 }}
									viewport={{ once: true }}>
									<td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-sm font-medium">{project.year}</td>
									<td className="py-3 px-4">
										<Link href={`/projects/${project.slug}`} className="text-gray-900 dark:text-gray-100 font-semibold hover:text-blue-700 dark:hover:text-blue-400 transition-colors">
											{project.title}
										</Link>
									</td>
									<td className="py-3 px-4 hidden md:table-cell">
										<div className="flex flex-wrap gap-1">
											{(project.tech || []).map((t, i) => (
												<span key={i} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 rounded-md">{t}</span>
											))}
										</div>
									</td>
									<td className="py-3 px-4">
										<div className="flex items-center gap-3">
											{(project.code || project.githubLink) && (
												<a href={project.code || project.githubLink} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors" title="GitHub">
													<FontAwesomeIcon icon={faGithub} className="text-lg" />
												</a>
											)}
											{(project.preview || project.liveLink) && (
												<a href={project.preview || project.liveLink} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title="Live Preview">
													<FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-base" />
												</a>
											)}
										</div>
									</td>
								</motion.tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</main>
	);
}
