"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf, faArrowUpRightFromSquare, faBookBookmark, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import Card, { CardBody, CardFooter } from "./Card";
import Badge from "./Badge";
import Button from "./Button";

export default function PublicationCard({ publication, className = "" }) {
  if (!publication) return null;

  const {
    id,
    title,
    venue,
    authors,
    year,
    date,
    abstract,
    doi,
    doiUrl,
    projectSlug,
    slug,
    pdfUrl,
    pdf,
    link,
    citations,
  } = publication;

  const detailSlug = projectSlug || slug || id;
  const detailUrl = detailSlug ? `/research/${detailSlug}` : null;
  const pdfLink = pdfUrl || pdf;
  const externalLink = doiUrl || link || (doi ? `https://doi.org/${doi}` : null);
  const displayYear = year || date;

  return (
    <Card
      variant="default"
      interactive
      className={`flex flex-col border border-[#E3DEC3] dark:border-[#33312B] ${className}`}
    >
      <CardBody className="flex-1 flex flex-col">
        {/* Header metadata */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          {venue && <Badge variant="orange">{venue}</Badge>}
          {displayYear && (
            <span className="text-xs font-mono text-[#787467] dark:text-[#9E9A8B]">
              {displayYear}
            </span>
          )}
        </div>

        {/* Paper title - clickable link */}
        {detailUrl ? (
          <Link href={detailUrl} className="group-hover:text-[#FF8A00] transition-colors">
            <h3 className="text-xl font-heading font-bold text-[#181713] dark:text-[#F7F5DC] mb-2 leading-snug">
              {title}
            </h3>
          </Link>
        ) : (
          <h3 className="text-xl font-heading font-bold text-[#181713] dark:text-[#F7F5DC] mb-2 leading-snug">
            {title}
          </h3>
        )}

        {/* Authors */}
        {authors && (
          <p className="text-xs font-mono text-[#57534E] dark:text-[#9E9A8B] mb-3">
            <span className="font-semibold text-[#181713] dark:text-[#D1CDBC]">Authors:</span> {authors}
          </p>
        )}

        {/* Abstract snippet */}
        {abstract && (
          <p className="text-sm text-[#4A473E] dark:text-[#D1CDBC] line-clamp-3 leading-relaxed mb-4 flex-1">
            {abstract}
          </p>
        )}
      </CardBody>

      {/* Action Footer */}
      <CardFooter className="px-6 py-3.5 bg-[#F0EDD4]/40 dark:bg-[#1A1915]">
        <div className="flex items-center gap-3">
          {detailUrl && (
            <Button
              href={detailUrl}
              variant="gold"
              size="sm"
              icon={<FontAwesomeIcon icon={faArrowRight} />}
            >
              View Paper
            </Button>
          )}
          {pdfLink && (
            <Button
              href={pdfLink}
              variant="secondary"
              size="sm"
              icon={<FontAwesomeIcon icon={faFilePdf} className="text-red-500" />}
            >
              PDF
            </Button>
          )}
          {externalLink && (
            <Button
              href={externalLink}
              variant="outline"
              size="sm"
              icon={<FontAwesomeIcon icon={faArrowUpRightFromSquare} />}
            >
              DOI / Publisher
            </Button>
          )}
        </div>

        {citations && (
          <span className="text-xs font-mono text-[#787467] dark:text-[#9E9A8B]">
            <FontAwesomeIcon icon={faBookBookmark} className="mr-1 text-amber-500" />
            {citations} Citations
          </span>
        )}
      </CardFooter>
    </Card>
  );
}
