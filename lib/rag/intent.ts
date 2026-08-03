/**
 * Intent Classification Layer for Ask Vedaang RAG Pipeline.
 * Detects conversational intents (greetings, farewells, gratitude, bot info, chitchat)
 * to bypass embedding generation and vector store retrieval.
 */

export type IntentCategory =
  | "greeting"
  | "farewell"
  | "gratitude"
  | "bot_info"
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
  "vedaang", "work", "build", "built", "code", "architecture", "model", "python",
  "node", "react", "next", "docker", "fastapi", "opencv", "pytorch", "supabase", "sql"
];

const GREETING_PATTERNS = [
  /^(hi|hello|hey|heyy|greetings|howdy|sup|yo)\b/i,
  /^(good\s+(morning|afternoon|evening|day))\b/i,
  /^(hi\s+there|hello\s+there|hey\s+there)\b/i,
  /^(hello\s+ask\s+vedaang|hi\s+ask\s+vedaang)\b/i,
];

const FAREWELL_PATTERNS = [
  /^(bye|goodbye|see\s+ya|cya|farewell|catch\s+you\s+later)\b/i,
  /^(have\s+a\s+good\s+(day|night|evening))\b/i,
  /^(talk\s+to\s+you\s+later)\b/i,
];

const GRATITUDE_PATTERNS = [
  /^(thank\s+you|thanks|thx|ty|many\s+thanks|thank\s+you\s+so\s+much)\b/i,
  /^(much\s+appreciated|appreciated|awesome\s+thanks)\b/i,
];

const BOT_INFO_PATTERNS = [
  /^(who\s+are\s+you|what\s+are\s+you|what\s+is\s+your\s+name|who\s+created\s+you)\b/i,
  /^(what\s+can\s+you\s+do|help\s+me|how\s+do\s+i\s+use\s+this|capabilities)\b/i,
];

const CHITCHAT_PATTERNS = [
  /^(how\s+are\s+you|how\s+is\s+it\s+going|how's\s+it\s+going|how\s+do\s+you\s+do)\b/i,
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
        "Hello! 👋 I am **Ask Vedaang**, Vedaang Sharma's AI portfolio guide. How can I help you explore his work today?",
    };
  }

  // 1. Check if query contains explicit portfolio domain keywords
  const hasPortfolioKeyword = PORTFOLIO_KEYWORDS.some((kw) => cleanQuery.includes(kw));

  // If query contains portfolio keywords and is a multi-word domain question, prioritize RAG
  if (hasPortfolioKeyword && cleanQuery.split(/\s+/).length > 3) {
    return {
      category: "portfolio_query",
      confidence: 0.95,
      bypassRag: false,
    };
  }

  // 2. Evaluate rule-based conversational intents (bypassing RAG)
  for (const pattern of GREETING_PATTERNS) {
    if (pattern.test(cleanQuery) && !hasPortfolioKeyword) {
      return {
        category: "greeting",
        confidence: 0.98,
        bypassRag: true,
        response:
          "Hello! 👋 Welcome to Vedaang Sharma's engineering portfolio.\n\nI can help you explore his [projects](/projects), [published research](/research), [backend capabilities](/skills), or [contact info](/contact). What would you like to know?",
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
          "Goodbye! 👋 Thanks for visiting Vedaang's portfolio. Feel free to return anytime to check out new engineering case studies and research updates!",
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
          "You're very welcome! 😊 Let me know if you have any other questions about Vedaang's projects, technical stack, or research.",
      };
    }
  }

  for (const pattern of BOT_INFO_PATTERNS) {
    if (pattern.test(cleanQuery) && !hasPortfolioKeyword) {
      return {
        category: "bot_info",
        confidence: 0.95,
        bypassRag: true,
        response:
          "I am **Ask Vedaang**, an AI assistant designed to guide visitors through Vedaang Sharma's engineering portfolio.\n\nYou can ask me about:\n- **Selected Projects**: Learn about [Aegis Care](/projects/aegis-care) or [Posture Sense](/projects/posture-sense)\n- **Research**: Explore published computer vision papers on the [Research Page](/research)\n- **Tech Stack**: Discover backend & AI capabilities on the [Skills Page](/skills)\n- **Resume & Contact**: Download [Vedaang's Resume PDF](/api/resume) or send a message on [Contact Page](/contact)",
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
          "I'm doing great, thank you for asking! 😊 I'm ready to assist you with any questions about Vedaang Sharma's work and research.",
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
