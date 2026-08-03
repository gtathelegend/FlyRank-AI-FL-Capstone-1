export type EntityType =
  | "project"
  | "research"
  | "skill"
  | "certification"
  | "experience"
  | "education"
  | "blog"
  | "resume"
  | "settings";

export interface ProjectDetails {
  summary: string;
  problem: string;
  architecture: string;
  techStack: string[];
  engineeringDecisions: string;
  challenges: string;
  outcome: string;
  githubLink?: string;
  liveDemo?: string;
  caseStudyUrl: string;
}

export interface NormalizedKnowledgeRecord {
  id: string;
  type: EntityType;
  title: string;
  content: string;
  summary: string;
  tags: string[];
  url?: string;
  updatedAt?: string;
  projectDetails?: ProjectDetails;
  metadata?: Record<string, any>;
}

export interface PortfolioBio {
  name: string;
  tagline: string;
  subtitle: string;
  location: string;
  email: string;
  github: string;
  linkedin: string;
  resumePdfUrl?: string;
  cvUrl?: string;
  heroImage?: string;
  aboutImage?: string;
  aboutBio?: string;
}

export interface KnowledgeStats {
  totalRecords: number;
  projectsCount: number;
  researchCount: number;
  skillsCount: number;
  certificationsCount: number;
  experienceCount: number;
  educationCount: number;
  blogCount: number;
}

export interface AggregatedKnowledgeSuccess {
  success: true;
  timestamp: string;
  records: NormalizedKnowledgeRecord[];
  byType: Record<EntityType, NormalizedKnowledgeRecord[]>;
  bio: PortfolioBio;
  stats: KnowledgeStats;

  // Backward compatibility fields for legacy askEngine consumers
  projects: any[];
  researchPapers: any[];
  researchInterests: any[];
  experience: any[];
  skills: any[];
  certifications: any[];
  education: any[];
}

export interface StructuredError {
  code: string;
  message: string;
  details?: any;
  failedTables?: string[];
}

export interface AggregatedKnowledgeFailure {
  success: false;
  timestamp: string;
  error: StructuredError;
}

export type AggregatedKnowledgeResult =
  | AggregatedKnowledgeSuccess
  | AggregatedKnowledgeFailure;
