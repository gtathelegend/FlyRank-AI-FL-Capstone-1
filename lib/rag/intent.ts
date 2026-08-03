/**
 * Intent Classification Layer for Vedaang's Conversational Portfolio Agent.
 * Detects conversational intents (greetings, farewells, gratitude, about me, chitchat)
 * to bypass embedding generation and vector store retrieval.
 */

export type IntentCategory =
  | "greeting"
  | "farewell"
  | "gratitude"
  | "about_me"
  | "chitchat"
  | "portfolio_query";

export interface IntentResult {
  category: IntentCategory;
  confidence: number;
  bypassRag: boolean;
  response?: string;
}

// Portfolio domain keywords that force RAG execution even if query starts with greeting words
const PORTFOLIO_KEYWORDS = [
  "project", "projects", "aegis", "posture", "research", "paper", "papers",
  "skill", "skills", "backend", "frontend", "stack", "technology", "technologies",
  "language", "languages", "database", "databases", "experience", "internship",
  "certif", "resume", "cv", "pdf", "contact", "email", "github", "linkedin",
  "work", "build", "built", "code", "architecture", "model", "python",
  "node", "react", "next", "docker", "fastapi", "opencv", "pytorch", "supabase", "sql"
];

const GREETING_PATTERNS = [
  /^(hi|hello|hey|hii|heyy|greetings|howdy|sup|yo)\b/i,
  /^(good\s+(morning|afternoon|evening|day))\b/i,
  /^(hi\s+there|hello\s+there|hey\s+there)\b/i,
  /^(hello\s+vedaang|hi\s+vedaang|hey\s+vedaang)\b/i,
];

const FAREWELL_PATTERNS = [
  /^(bye|goodbye|see\s+ya|cya|farewell|catch\s+you\s+later|see\s+you)\b/i,
  /^(have\s+a\s+good\s+(day|night|evening))\b/i,
  /^(talk\s+to\s+you\s+later)\b/i,
];

const GRATITUDE_PATTERNS = [
  /^(thank\s+you|thanks|thx|ty|many\s+thanks|thank\s+you\s+so\s+much)\b/i,
  /^(much\s+appreciated|appreciated|awesome\s+thanks|you're\s+welcome|welcome)\b/i,
];

const ABOUT_ME_PATTERNS = [
  /^(who\s+are\s+you|tell\s+me\s+about\s+yourself|introduce\s+yourself|who\s+is\s+vedaang|about\s+vedaang|about\s+yourself)\b/i,
  /^(what\s+do\s+you\s+do|who\s+am\i\s+talking\s+to)\b/i,
];

const CHITCHAT_PATTERNS = [
  /^(how\s+are\s+you|how\s+is\s+it\s+going|how's\s+it\s+going|how\s+do\s+you\s+do|what\s+are\s+you\s+doing)\b/i,
  /^(nice\s+to\s+meet\s+you)\b/i,
];

/**
 * Classifies input query into conversational intent or portfolio domain query.
 */
export function classifyIntent(query: string): IntentResult {
  const cleanQuery = (query || "").trim().toLowerCase();

  if (!cleanQuery) {
    return {
      category: "greeting",
      confidence: 1.0,
      bypassRag: true,
      response:
        "Hi! 👋\n\nI'm Vedaang.\n\nThanks for visiting my portfolio. I'm happy to answer questions about my projects, backend engineering work, AI research, internships, technical skills, certifications, or anything else you'd like to know.\n\nWhat would you like to explore?",
    };
  }

  // 1. Check for "About Me" / Introduction intent first
  for (const pattern of ABOUT_ME_PATTERNS) {
    if (pattern.test(cleanQuery)) {
      return {
        category: "about_me",
        confidence: 0.98,
        bypassRag: true,
        response:
          "Hi! I'm Vedaang Sharma.\n\nI'm a software developer and AI enthusiast with a strong interest in backend engineering, distributed systems, computer vision, and full-stack development.\n\nI enjoy building projects that solve real-world problems while focusing on scalable architecture and clean engineering practices.\n\nThis portfolio showcases many of the projects, research, and technologies I've worked on.\n\nFeel free to ask about anything you'd like to know.",
      };
    }
  }

  // 2. Check if query contains explicit portfolio domain keywords
  const hasPortfolioKeyword = PORTFOLIO_KEYWORDS.some((kw) => cleanQuery.includes(kw));

  // If query contains portfolio keywords and is a multi-word domain question, prioritize RAG
  if (hasPortfolioKeyword && cleanQuery.split(/\s+/).length > 3) {
    return {
      category: "portfolio_query",
      confidence: 0.95,
      bypassRag: false,
    };
  }

  // 3. Evaluate rule-based conversational intents (bypassing RAG)
  for (const pattern of GREETING_PATTERNS) {
    if (pattern.test(cleanQuery) && !hasPortfolioKeyword) {
      return {
        category: "greeting",
        confidence: 0.98,
        bypassRag: true,
        response:
          "Hi! 👋\n\nI'm Vedaang.\n\nThanks for visiting my portfolio.\n\nI'm happy to answer questions about my projects, backend engineering work, AI research, internships, technical skills, certifications, or anything else you'd like to know.\n\nWhat would you like to explore?",
      };
    }
  }

  for (const pattern of FAREWELL_PATTERNS) {
    if (pattern.test(cleanQuery) && !hasPortfolioKeyword) {
      return {
        category: "farewell",
        confidence: 0.98,
        bypassRag: true,
        response:
          "Goodbye! 👋 Thanks for visiting my portfolio. Feel free to return anytime to check out my new engineering projects and research updates!",
      };
    }
  }

  for (const pattern of GRATITUDE_PATTERNS) {
    if (pattern.test(cleanQuery) && !hasPortfolioKeyword) {
      return {
        category: "gratitude",
        confidence: 0.98,
        bypassRag: true,
        response:
          "You're very welcome! 😊 Let me know if there's anything else you'd like to know about my projects, backend tech stack, or research.",
      };
    }
  }

  for (const pattern of CHITCHAT_PATTERNS) {
    if (pattern.test(cleanQuery) && !hasPortfolioKeyword) {
      return {
        category: "chitchat",
        confidence: 0.92,
        bypassRag: true,
        response:
          "I'm doing great, thanks for asking! 😊 I'm always excited to talk about software engineering, backend architectures, or computer vision research. What's on your mind?",
      };
    }
  }

  // Default: proceed with dynamic RAG pipeline
  return {
    category: "portfolio_query",
    confidence: 0.85,
    bypassRag: false,
  };
}

