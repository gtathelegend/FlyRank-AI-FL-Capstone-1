import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import PropTypes from "prop-types";
import BlurImage from "@/public/image/placeholder/blur.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import posthog from "posthog-js";

export default function ProjectCard({ project, activeCategory }) {
	const categoryMatch =
		activeCategory === null ||
		(project.category || []).includes(Number(activeCategory));

	const desc = project.desc || project.description || [];
	const tech = project.tech || project.techStack || [];
	const thumbnail = project.thumbnail || project.imageUrl || null;
	const githubUrl = project.githubLink || project.code;
	const liveUrl = project.liveLink || project.preview;

	if (!categoryMatch) return null;

	return (
		<motion.div
			className="group bg-white dark:bg-white/[0.03] border border-neutral-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300"
			initial={{ opacity: 0, y: 30 }}
			whileInView={{ opacity: 1, y: 0 }}
			transition={{ type: "spring", duration: 0.6 }}
			viewport={{ once: true }}>
			{/* Image */}
			<Link href={`/projects/${project.slug}`}>
				<div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-white/5">
					<Image
						src={thumbnail || BlurImage}
						alt={project.title || "Project"}
						fill
						sizes="(max-width: 768px) 100vw, 50vw"
						className="object-cover group-hover:scale-105 transition-transform duration-500"
						placeholder="blur"
						blurDataURL={BlurImage.src}
					/>
					{project.year && (
						<div className="absolute top-3 left-3 bg-gray-900/80 text-white text-xs font-semibold px-2.5 py-1 rounded-lg backdrop-blur-sm">
							{project.year}
						</div>
					)}
				</div>
			</Link>
			{/* Content */}
			<div className="p-5">
				<Link href={`/projects/${project.slug}`}>
					<h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">{project.title}</h3>
				</Link>
				{desc[0] && (
					<p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{desc[0]}</p>
				)}
				{tech.length > 0 && (
					<div className="flex flex-wrap gap-1.5 mb-4">
						{tech.map((t) => (
							<span key={t} className="text-xs px-2 py-1 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 rounded-md border border-gray-200 dark:border-white/10">{t}</span>
						))}
					</div>
				)}
				{/* Action links */}
				<div className="flex items-center gap-3 pt-2 border-t border-gray-100 dark:border-white/10">
					<Link href={`/projects/${project.slug}`} className="text-xs font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-700 dark:hover:text-blue-400 transition-colors">
						Details →
					</Link>
					{githubUrl && (
						<a href={githubUrl} target="_blank" rel="noopener noreferrer" onClick={() => posthog.capture("project_card_github_clicked", { project: project.title, slug: project.slug })} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors" title="GitHub">
							<FontAwesomeIcon icon={faGithub} className="text-base" />
						</a>
					)}
					{liveUrl && (
						<a href={liveUrl} target="_blank" rel="noopener noreferrer" onClick={() => posthog.capture("project_card_live_clicked", { project: project.title, slug: project.slug })} className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title="Live Preview">
							<FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-sm" />
						</a>
					)}
				</div>
			</div>
		</motion.div>
	);
}

ProjectCard.propTypes = {
	project: PropTypes.object.isRequired,
	activeCategory: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
