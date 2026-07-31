"use client";

import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpRightFromSquare, faFolder, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import Card, { CardBody, CardFooter } from "./Card";
import Tag from "./Tag";
import Badge from "./Badge";

export default function ProjectCard({ project, className = "" }) {
  if (!project) return null;

  const {
    title,
    description,
    slug,
    image,
    thumbnail,
    tech = [],
    techStack = [],
    githubUrl,
    github,
    demoUrl,
    demo,
    featured,
    year,
    problemStatement,
  } = project;

  const displayTech = tech.length > 0 ? tech : techStack;
  const projectImage = thumbnail || image;
  const projectGithub = githubUrl || github;
  const projectDemo = demoUrl || demo;

  return (
    <Card
      variant="default"
      interactive
      padding="none"
      className={`flex flex-col h-full overflow-hidden border border-[#E3DEC3] dark:border-[#33312B] ${className}`}
    >
      {/* Image Thumbnail with smooth hover zoom */}
      <div className="relative aspect-video w-full overflow-hidden bg-[#F0EDD4] dark:bg-[#151411]">
        {projectImage ? (
          <Image
            src={projectImage}
            alt={title}
            fill
            className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-[#787467] dark:text-[#6E6B5F]">
            <FontAwesomeIcon icon={faFolder} className="text-3xl mb-2 opacity-50" />
            <span className="text-xs font-mono">Case Study</span>
          </div>
        )}

        <div className="absolute top-3 left-3 z-10 flex gap-2">
          {featured && <Badge variant="gold" size="sm">Featured Case Study</Badge>}
        </div>

        {year && (
          <div className="absolute top-3 right-3 z-10">
            <span className="text-[11px] font-mono font-semibold bg-[#181713]/80 text-[#F7F5DC] backdrop-blur px-2.5 py-0.5 rounded-full">
              {year}
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <CardBody className="p-6 flex flex-col flex-1">
        <Link href={`/projects/${slug || ""}`} className="group-hover:text-[#FF8A00] transition-colors">
          <h3 className="text-xl font-heading font-bold text-[#181713] dark:text-[#F7F5DC] line-clamp-1 mb-2">
            {title}
          </h3>
        </Link>

        {problemStatement && (
          <p className="text-xs font-mono text-[#FF8A00] dark:text-[#FFC233] line-clamp-1 mb-2 font-medium">
            Problem: {problemStatement}
          </p>
        )}

        <p className="text-sm text-[#57534E] dark:text-[#9E9A8B] line-clamp-2 leading-relaxed mb-4 flex-1">
          {description}
        </p>

        {/* Tech tags */}
        {displayTech.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-auto">
            {displayTech.slice(0, 4).map((t) => (
              <Tag key={t} size="sm" variant="mono">
                {t}
              </Tag>
            ))}
            {displayTech.length > 4 && (
              <Tag size="sm" variant="neutral">
                +{displayTech.length - 4}
              </Tag>
            )}
          </div>
        )}
      </CardBody>

      {/* Footer */}
      <CardFooter className="px-6 py-3.5 bg-[#F0EDD4]/40 dark:bg-[#1A1915] mt-0">
        <Link
          href={`/projects/${slug || ""}`}
          className="text-xs font-mono font-semibold text-[#181713] dark:text-[#F7F5DC] group-hover:text-[#FF8A00] dark:group-hover:text-[#FFC233] transition-colors inline-flex items-center gap-1.5"
        >
          <span>Read Case Study</span>
          <FontAwesomeIcon icon={faArrowRight} className="text-[10px] group-hover:translate-x-1 transition-transform" />
        </Link>

        <div className="flex items-center gap-3">
          {projectGithub && (
            <a
              href={projectGithub}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#57534E] dark:text-[#9E9A8B] hover:text-[#181713] dark:hover:text-[#F7F5DC] transition-colors"
              aria-label="GitHub Repository"
            >
              <FontAwesomeIcon icon={faGithub} className="text-base" />
            </a>
          )}
          {projectDemo && (
            <a
              href={projectDemo}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#57534E] dark:text-[#9E9A8B] hover:text-[#FF8A00] dark:hover:text-[#FFC233] transition-colors"
              aria-label="Live Demo"
            >
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-sm" />
            </a>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
