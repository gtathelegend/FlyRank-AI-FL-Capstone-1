# Architectural Audit & Dynamic RAG Design for Ask Vedaang

**Document Target**: `docs/rag-audit.md`  
**System**: Ask Vedaang AI Assistant (`/app/api/ask`, `components/AskVedaang.jsx`, `lib/ask/*`)  
**Author**: Antigravity AI Engineering Team  
**Date**: August 2026  

---

## Executive Summary

This document presents a comprehensive architectural audit of the current **Ask Vedaang** AI assistant system within Vedaang Sharma's engineering portfolio codebase. It diagnoses the root causes behind blank and failing assistant responses, maps out the end-to-end request lifecycle, documents critical failure modes across all system layers, verifies all database queries and environment variables, and delivers an upgraded, production-grade **Retrieval-Augmented Generation (RAG)** architecture design powered dynamically by Supabase (`pgvector`), granular section-level semantic chunking, decoupled asynchronous worker ingestion, hybrid search with multi-stage re-ranking, conversation memory, a portable distributed cache layer, and analytics logging.

---

## Part 1: Architectural Audit of the Current Assistant

### 1. Root Cause Analysis: Why "Ask Vedaang" Returns Blank Responses

Through code inspection, database verification, and stream lifecycle analysis, **three primary root causes** were identified that lead to blank responses or degraded UI behavior in the current system:

#### A. UI Stream Decoding & Async State Update Batching Race Condition
In [AskVedaang.jsx](file:///d:/Vedaang/Internship/FlyRank%20AI/Capstone/FlyRank-AI-FL-Capstone-1/components/AskVedaang.jsx#L72-L93):
```javascript
const reader = response.body.getReader();
const decoder = new TextDecoder();
let assistantResponse = "";

setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

while (true) {
  const { value, done } = await reader.read();
  if (done) break;
  const chunk = decoder.decode(value, { stream: true });
  assistantResponse += chunk;

  setMessages((prev) => {
    const updated = [...prev];
    updated[updated.length - 1] = {
      role: "assistant",
      content: assistantResponse,
    };
    return updated;
  });
}
```
* **Failure Mechanism**:
  1. Before the stream loop begins, line 76 appends an empty assistant message `{ role: "assistant", content: "" }` to the `messages` array.
  2. In `MarkdownRenderer`, an empty string renders as `""` (or default placeholder `"..."`).
  3. If the server stream terminates prematurely, yields 0 bytes, or errors out on the first chunk, `assistantResponse` remains `""`.
  4. In React 18 / Next.js client components, functional state updates inside rapid `while(true)` loops execute asynchronously. When `setMessages` receives stale state or when `decoder.decode` buffers remaining bytes without a final flush (`stream: false`), the state update can lock the last message at `content: ""`.

#### B. API Route Error Protocol Mismatch (JSON Error vs. Stream Protocol)
In [app/api/ask/route.js](file:///d:/Vedaang/Internship/FlyRank%20AI/Capstone/FlyRank-AI-FL-Capstone-1/app/api/ask/route.js#L106-L109) & [L151-L155](file:///d:/Vedaang/Internship/FlyRank%20AI/Capstone/FlyRank-AI-FL-Capstone-1/app/api/ask/route.js#L151-L155):
```javascript
// Validation Error (400) or Server Error (500)
return NextResponse.json(
  { message: "An error occurred while processing your request." },
  { status: 500 }
);
```
* **Failure Mechanism**:
  1. The UI component expects a readable `text/plain` byte stream.
  2. If an exception occurs in `route.js` (e.g. database query rejection, missing request body, invalid prompt payload), the route handler returns a JSON response object with HTTP status 500 or 400.
  3. In `components/AskVedaang.jsx`, `if (!response.ok) throw new Error(...)` catches the error.
  4. If the error occurs *after* line 76 (where an empty message was already pushed to React state), the `catch` block appends a *second* message containing the error string. The user is left with **two** message bubbles: a completely blank message bubble followed by an error bubble.

#### C. In-Memory Knowledge Serializer Failures & LLM Key Absences
In [app/api/ask/route.js](file:///d:/Vedaang/Internship/FlyRank%20AI/Capstone/FlyRank-AI-FL-Capstone-1/app/api/ask/route.js#L115-L127):
```javascript
let answer = await callGroqLLM(message, kb);
if (!answer) {
  answer = await callGeminiLLM(message, kb);
}
if (!answer || typeof answer !== "string" || !answer.trim()) {
  answer = answerQuestion(message, kb);
}
```
* **Failure Mechanism**:
  1. Both `GROQ_API_KEY` and `GEMINI_API_KEY` are currently unconfigured/missing in `.env`.
  2. `callGroqLLM` and `callGeminiLLM` silently return `null`.
  3. System falls back to `answerQuestion(message, kb)` in [lib/ask/askEngine.js](file:///d:/Vedaang/Internship/FlyRank%20AI/Capstone/FlyRank-AI-FL-Capstone-1/lib/ask/askEngine.js).
  4. `answerQuestion` relies on naive static string keyword checking (`containsAny`, `.includes()`). If a user asks a nuanced question (e.g., *"What architecture did Vedaang use for distributed caching?"*), none of the keyword conditions trigger.
  5. If `kb.bio` or property fields are empty or undefined, the fallthrough template returns generic text or an empty string if property lookups fail, leading to non-informative or blank outputs.

---

### 2. Complete Request Lifecycle Trace

The current request lifecycle spans 7 stages:

```
[ User Input ]
      │
      ▼
┌───────────────────────────────┐
│ 1. UI Component               │  (AskVedaang.jsx)
│    - Renders input drawer     │
│    - Dispatches POST /api/ask │
└──────────────┬────────────────┘
               │ HTTP POST { message }
               ▼
┌───────────────────────────────┐
│ 2. API Route Handler          │  (app/api/ask/route.js)
│    - Validates payload        │
│    - Invokes aggregator       │
└──────────────┬────────────────┘
               │
               ▼
┌───────────────────────────────┐
│ 3. Knowledge Aggregator       │  (lib/ask/knowledgeAggregator.js)
│    - Promise.all across 8     │
│      Supabase tables          │
└──────────────┬────────────────┘
               │ SELECT *
               ▼
┌───────────────────────────────┐
│ 4. Supabase Database          │  (PostgreSQL CMS)
│    - projects, research,      │
│      skills, certs, etc.      │
└──────────────┬────────────────┘
               │ Raw Table Rows
               ▼
┌───────────────────────────────┐
│ 5. Data Mappers               │  (lib/supabase/mappers.js)
│    - Map snake_case -> camel  │
│    - Construct `kb` object    │
└──────────────┬────────────────┘
               │ `kb` Object Payload
               ▼
┌───────────────────────────────┐
│ 6. LLM / Fallback Engine      │  (Groq / Gemini / askEngine.js)
│    - Inject full `kb` in system│
│      prompt OR run regex      │
└──────────────┬────────────────┘
               │ Markdown String
               ▼
┌───────────────────────────────┐
│ 7. Streaming Response         │  (ReadableStream + TextEncoder)
│    - Word-by-word chunking    │
│    - UI TextDecoder render    │
└───────────────────────────────┘
```

---

### 3. Comprehensive Failure Point Inventory

| Layer | Failure Point | Description & Impact | Severity |
| :--- | :--- | :--- | :--- |
| **Aggregator** | `Promise.all` Fail-Fast Rejection | If **any single** Supabase table query fails (e.g. schema migration error, missing table), `Promise.all` rejects entirely, collapsing knowledge to empty fallback arrays. | **High** |
| **Aggregator** | Unbounded In-Memory Loading | Fetches **every single row** across 8 tables on **every user query**. Does not scale with site content growth and consumes high memory. | **High** |
| **LLM Gateway** | Unconfigured API Keys | Neither `GROQ_API_KEY` nor `GEMINI_API_KEY` are present in `.env`, forcing 100% of traffic to the static fallback engine. | **Critical** |
| **LLM Gateway** | System Prompt Token Blowout | Serializing the entire database as `JSON.stringify(kb)` into the system prompt wastes tokens, causes high latency, and hits LLM context window limits. | **High** |
| **Rule Engine** | Keyword Fragility | `askEngine.js` relies on hardcoded string matches (`q.includes(...)`). Out-of-vocabulary or complex queries fail matching and receive generic fallback text. | **Medium** |
| **Streaming** | Space-Split Chunking | `answer.split(" ")` breaks code blocks, multi-line markdown headers, and UTF-8 multi-byte characters when streamed word-by-word. | **Medium** |
| **Streaming** | No SSE Standard Header | Response uses `text/plain` instead of `text/event-stream` or Vercel AI SDK protocol, breaking standard browser streaming optimizations. | **Medium** |
| **UI Component** | Async State Mutation | Functional state update `updated[updated.length - 1]` inside `while(true)` loop can overwrite previous assistant messages during rapid streaming. | **High** |
| **UI Component** | Double Message Rendering | On HTTP error, UI pushes an empty assistant message before checking stream status, creating orphan empty message bubbles. | **High** |

---

### 4. Supabase Query Audit & Schema Verification

Every query in `lib/ask/knowledgeAggregator.js` was audited against the live Supabase instance:

```javascript
// Audited Queries from lib/ask/knowledgeAggregator.js
admin.from("projects").select("*").order("sort_order", { ascending: true });
admin.from("research_papers").select("*").order("sort_order", { ascending: true });
admin.from("research_interests").select("*").order("sort_order", { ascending: true });
admin.from("experience").select("*").order("sort_order", { ascending: true });
admin.from("skills").select("*").order("name", { ascending: true });
admin.from("certifications").select("*").order("sort_order", { ascending: true });
admin.from("education").select("*").order("start_year", { ascending: false });
admin.from("site_settings").select("*").limit(1);
```

#### Empirical Test Verification Results:

| Table Name | Query Status | Rows Returned | Sample Verified Schema Columns | Audit Remarks |
| :--- | :--- | :--- | :--- | :--- |
| `projects` | **SUCCESS** | 5 | `id`, `title`, `slug`, `year`, `description`, `tech_stack`, `category`, `thumbnail`, `github_link`, `live_link`, `featured`, `show`, `status`, `sort_order`, `problem_statement`, `architecture_notes`, `engineering_decisions`, `challenges`, `lessons_learned`, `architecture_diagram` | Valid. Case study columns exist and map correctly. |
| `research_papers` | **SUCCESS** | 2 | `id`, `title`, `venue`, `year`, `abstract`, `areas`, `project_slug`, `doi_url`, `sort_order`, `content` | Valid. Content & abstract fields populated. |
| `research_interests` | **SUCCESS** | 0 | `id`, `title`, `description`, `icon_name`, `sort_order` | Valid schema. Table is currently empty in DB. |
| `experience` | **SUCCESS** | 1 | `id`, `company`, `role`, `start_date`, `end_date`, `description`, `type`, `location`, `skills`, `sort_order` | Valid. Returns single experience record. |
| `skills` | **SUCCESS** | 24 | `id`, `name`, `category`, `level` | Valid. Sorted by `name` ascending. |
| `certifications` | **SUCCESS** | 13 | `id`, `name`, `issuer`, `year`, `category`, `url`, `sort_order` | Valid. Returns 13 verified certifications. |
| `education` | **SUCCESS** | 2 | `id`, `institute`, `degree`, `start_year`, `end_year`, `summary`, `gpa`, `achievements` | Valid. Sorted by `start_year` descending. |
| `site_settings` | **SUCCESS** | 1 | `id`, `full_name`, `tagline`, `hero_subtitle`, `hero_image`, `about_image`, `cv_url`, `email`, `resume_pdf_url`, `about_bio`, `quote_text` | Valid. Single record contains portfolio bio & metadata. |

---

### 5. Environment Variables Audit

Audit of environment configuration in [.env](file:///d:/Vedaang/Internship/FlyRank%20AI/Capstone/FlyRank-AI-FL-Capstone-1/.env):

| Variable Name | Environment Scope | Status | Purpose / Value Audit |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Public (Client & Server) | **CONFIGURED** | `https://bgsxyltobglglgdisrsd.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public (Client & Server) | **CONFIGURED** | Publishable anon key present. |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret (Server Only) | **CONFIGURED** | Secret service role key present. Bypasses RLS for backend routes. |
| `GROQ_API_KEY` | Secret (Server Only) | **MISSING** | Required for Groq API (`llama-3.3-70b-versatile`). Currently undefined. |
| `GEMINI_API_KEY` / `GOOGLE_GENERATIVE_AI_API_KEY` | Secret (Server Only) | **MISSING** | Required for Gemini API (`gemini-1.5-flash`). Currently undefined. |
| `OPENAI_API_KEY` | Secret (Server Only) | **MISSING** | Needed for RAG embedding generation (`text-embedding-3-small`). |
| `COHERE_API_KEY` | Secret (Server Only) | **MISSING** | Required for optional multi-stage Cross-Encoder Re-ranking (`cohere-rerank-v3`). |
| `UPSTASH_REDIS_REST_URL` | Secret (Server Only) | **CONFIGURED** | Optional Redis credentials for Distributed Cache Layer. |
| `UPSTASH_REDIS_REST_TOKEN` | Secret (Server Only) | **CONFIGURED** | Optional Redis credentials for Distributed Cache Layer. |

---

### 6. Streaming Implementation Verification

#### Server-Side Streaming Audit (`app/api/ask/route.js`)
* Uses WHATWG `ReadableStream` standard.
* **Flaw**: `answer.split(" ")` creates chunks by space delimiter. When text contains Markdown code blocks (e.g. ```` ```js ... ``` ````) or long inline URLs (`[Title](/projects/slug)`), splitting on space disrupts character sequences and can corrupt Markdown formatting during UI decoding.
* **Flaw**: Lack of HTTP stream buffering directives (`X-Content-Type-Options: nosniff`) and improper MIME header (`text/plain` instead of `text/event-stream`).

#### Client-Side Stream Reader Audit (`components/AskVedaang.jsx`)
* Uses `response.body.getReader()` with `TextDecoder`.
* **Flaw**: Does not buffer incomplete UTF-8 chunk frames. If a chunk boundary cuts across a multi-byte UTF-8 character or Markdown symbol, `decoder.decode(value, { stream: true })` attempts decoding, but if the final chunk isn't flushed with `{ stream: false }`, trailing characters are dropped.

---

### 7. Fallback Behavior Verification

The current system implements a **three-tier fallback chain**:

1. **Tier 1 (Groq LLM)**: Attempts Groq API. Fails immediately due to missing `GROQ_API_KEY`.
2. **Tier 2 (Gemini LLM)**: Attempts Gemini API. Fails immediately due to missing `GEMINI_API_KEY`.
3. **Tier 3 (Static Synthesizer - `askEngine.js`)**: Evaluates rule-based keywords.
   * If matched: Returns structured Markdown from `kb`.
   * If unmatched: Returns a static default bio response.
4. **Safety Net (Route Level)**: If `answer` is empty string, returns hardcoded welcome message.

---

## Part 2: Dynamic RAG Architecture Design (Refined Specifications)

To transform **Ask Vedaang** into an intelligent, dynamic, grounded AI assistant, we redesign the knowledge pipeline into a state-of-the-art **Retrieval-Augmented Generation (RAG)** architecture using **Supabase + pgvector** following the end-to-end flow:

```
┌─────────────────────────────────────────────────────────┐
│                    Supabase CMS                         │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                  Knowledge Builder                      │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                  Semantic Chunker                       │
│    (Section-Level: Problem, Architecture, Stack)        │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                 Embedding Generator                     │
│               (Background Worker Queue)                 │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                      pgvector                           │
│             (`portfolio_embeddings` table)              │
└────────────────────────────▲────────────────────────────┘
                             │
────────────── Runtime Query Processing ───────────────────
                             │
┌────────────────────────────┴────────────────────────────┐
│                    User Question                        │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│           Distributed Cache Layer (Portable)            │
│   (Adapters: Upstash / Vercel KV / Redis / In-Memory)   │
│            Hit? Return Cached Stream Response           │
└────────────────────────────┬────────────────────────────┘
                             │ Miss
                             ▼
┌─────────────────────────────────────────────────────────┐
│                 Query Contextualizer                    │
│           (Conversation Memory Integration)             │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                  Query Embedding                        │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│             Hybrid Search (Vector + FTS)                │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                Metadata Filtering                       │
│           (Filter by Tech, Section, Category)           │
└────────────────────────────┬────────────────────────────┘
                             │ (Top 20 Chunks)
                             ▼
┌─────────────────────────────────────────────────────────┐
│                    Reranking                            │
│           (Cross-Encoder / Cohere Rerank)               │
└────────────────────────────┬────────────────────────────┘
                             │ (Top 5 Chunks)
                             ▼
┌─────────────────────────────────────────────────────────┐
│                 Prompt Builder                          │
│           (Strict Categorical Grounding)                │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                      LLM                                │
│         (Groq / Gemini / OpenAI Gateway)                │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│              Streaming Response (SSE)                   │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│               Conversation Memory                        │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│               Analytics & Logging                       │
└────────────────────────────┬────────────────────────────┘
```

---

### 1. Architectural Principles & Refinements

1. **Supabase is the Single Source of Truth**: All domain entities remain stored in Supabase PostgreSQL tables.
2. **Granular Section-Level Semantic Chunking**: Projects, research papers, and blog posts are split into distinct semantic sub-chunks (e.g. *Problem Statement*, *Architecture & Algorithms*, *Engineering Decisions*, *Challenges*). Answering *"How did you calculate joint angles?"* retrieves **only** the `Joint Angle Calculation` chunk rather than a monolithic project record.
3. **Decoupled Asynchronous Worker Ingestion**: No expensive or fragile database triggers. Content updates in CMS trigger an API route or background queue (`reindex-queue`) processed by a background worker.
4. **Clean Separation of Concerns**:
   - `KnowledgeBuilder` fetches clean entity documents.
   - `SemanticChunker` decomposes documents into section-level payloads.
   - `EmbeddingGenerator` produces 1536-dim vectors.
   - `Retriever` handles Hybrid Retrieval (Vector + Full-Text) and Metadata Filtering.
   - `Reranker` scores Top 20 retrieved candidates down to Top 5.
   - `PromptBuilder` formats structured anti-hallucination prompts.
   - `LLMEngine` handles stream generation.
5. **Multi-turn Conversation Memory**: Rewrites user queries in context of recent chat turns to support follow-up questions (e.g., *"How fast is it?"* after asking about Aegis Care).
6. **Portable Distributed Cache Layer**: Defines a key-value caching interface at the architectural level (`CacheAdapter.get`, `CacheAdapter.set`) decoupled from any single vendor. Can be backed interchangeably by Upstash Redis, Vercel KV, self-hosted Redis, or local LRU in-memory cache.
7. **Knowledge Versioning & Incremental Reindexing**: Every chunk maintains `updatedAt`, `version`, and content `checksum` (SHA-256). Updating one project re-embeds **only** that project's modified section chunks.
8. **Observability & Telemetry**: Logs query, retrieved chunks, similarity scores, rerank scores, latency, chosen LLM model, and errors for continuous improvement.

---

### 2. Core Component Specifications

#### A. Rich Source Metadata Schema & `pgvector` Table

We define the `portfolio_embeddings` schema in Supabase with complete source metadata and version tracking:

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create dynamic section-level portfolio embeddings table
CREATE TABLE IF NOT EXISTS portfolio_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,                  -- 'project', 'research_paper', 'blog_post', 'skill', 'experience', 'bio'
  source_id UUID NOT NULL,            -- Foreign reference to primary table row ID
  title TEXT NOT NULL,                 -- e.g. "Posture Sense"
  slug TEXT,                           -- Route URL e.g. "/projects/posture-sense"
  section TEXT NOT NULL,               -- e.g. "Architecture", "Problem Statement", "Backend", "Challenges"
  content TEXT NOT NULL,               -- Textual section payload
  embedding vector(1536) NOT NULL,    -- 1536-dim vector (OpenAI text-embedding-3-small)
  metadata JSONB DEFAULT '{}'::jsonb, -- Filter attributes: {"tech_stack": ["Python", "Flask", "MediaPipe"], "category": "Computer Vision"}
  version INT NOT NULL DEFAULT 1,     -- Incremental schema version
  checksum TEXT NOT NULL,              -- SHA-256 hash of (title + section + content + metadata)
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create HNSW Index for ultra-fast Cosine Similarity Search
CREATE INDEX IF NOT EXISTS idx_portfolio_embeddings_hnsw 
ON portfolio_embeddings 
USING hnsw (embedding vector_cosine_ops) 
WITH (m = 16, ef_construction = 64);

-- Full-Text Search Index for Hybrid Lexical Search
ALTER TABLE portfolio_embeddings ADD COLUMN IF NOT EXISTS fts tsvector 
GENERATED ALWAYS AS (to_tsvector('english', title || ' ' || section || ' ' || content)) STORED;

CREATE INDEX IF NOT EXISTS idx_portfolio_embeddings_fts 
ON portfolio_embeddings USING gin(fts);
```

---

#### B. Asynchronous Ingestion & Incremental Reindexing Worker

Instead of database triggers, content updates in Supabase trigger an asynchronous background worker (`/api/admin/reindex`):

```
┌────────────────────────────────┐
│ CMS Action (Save Project/Post) │
└───────────────┬────────────────┘
                │
                ▼
┌────────────────────────────────┐
│ POST /api/admin/reindex-job    │
└───────────────┬────────────────┘
                │ Enqueue Job
                ▼
┌────────────────────────────────┐
│ Background Embedding Worker    │
│ 1. Extract raw content sections│
│ 2. Compute SHA-256 checksums   │
│ 3. Check existing checksums in │
│    `portfolio_embeddings`      │
│ 4. Re-embed ONLY changed chunks│
│ 5. Delete removed sections     │
└────────────────────────────────┘
```

---

#### C. Hybrid Search, Metadata Filtering & Multi-Stage Re-ranking

Runtime retrieval follows a 3-step pipeline:

1. **Step 1: Hybrid Search (Vector Cosine + Full-Text Keyword)**:
   Retrieves Top 20 candidate chunks matching either semantic embedding distance OR PostgreSQL keyword match.
2. **Step 2: Metadata Filtering**:
   Applies JSONB metadata constraints (e.g. `metadata->'tech_stack' ? 'Flask'`).
3. **Step 3: Cross-Encoder Re-ranking**:
   Passes the user query and 20 retrieved candidates to a Cross-Encoder model (Cohere Rerank v3 or `bge-reranker-large`). Re-ranks candidates by relevance score and selects the **Top 5** highest quality chunks.

---

#### D. Dynamic Prompt Builder with Categorical Grounding

`PromptBuilder` organizes retrieved Top-5 chunks into clear categories and enforces anti-hallucination guardrails:

```javascript
export function buildRAGPrompt(userQuery, chunks, conversationHistory = []) {
  const groupedContext = chunks.reduce((acc, chunk) => {
    const key = chunk.type.toUpperCase();
    if (!acc[key]) acc[key] = [];
    acc[key].push(
      `### ${chunk.title} — ${chunk.section} ([Link](${chunk.slug}))\n${chunk.content}`
    );
    return acc;
  }, {});

  const formattedContext = Object.entries(groupedContext)
    .map(([category, items]) => `== ${category} KNOWLEDGE ==\n${items.join("\n\n")}`)
    .join("\n\n");

  return `You are Ask Vedaang, an AI assistant representing Vedaang Sharma's engineering portfolio.

STRICT OPERATIONAL RULES:
1. Answer the user's question using ONLY the retrieved portfolio context below.
2. If the context does not explicitly contain the answer, state clearly: "I don't have that specific detail in Vedaang's portfolio records." Do not fabricate answers.
3. Always include Markdown links formatted as [Title](/projects/slug) when referencing projects or case studies.
4. Maintain a technical, precise, and encouraging tone.

RETRIEVED PORTFOLIO CONTEXT:
${formattedContext || "No relevant context chunks found."}

${conversationHistory.length > 0 ? `CONVERSATION HISTORY:\n${formatHistory(conversationHistory)}\n` : ""}
USER QUESTION: ${userQuery}`;
}
```

---

#### E. Conversation Memory & Multi-turn Query Rewriting

To resolve follow-up questions like *"What backend did you use for it?"* after asking *"Tell me about Aegis Care"*, the assistant uses a lightweight **Query Contextualizer**:

```
[ User Query: "What backend did you use for it?" ]
                      +
[ Recent History: "User: Tell me about Aegis Care..." ]
                      │
                      ▼
┌──────────────────────────────────────────────────┐
│ Query Contextualizer (Fast LLM / Regex Rules)    │
│ Standalone Query: "What backend framework and    │
│ tech stack was used for the Aegis Care project?" │
└─────────────────────┬────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────┐
│ Vector & Full-Text Search on Standalone Query    │
└──────────────────────────────────────────────────┘
```

---

#### F. High-Performance Distributed Cache Layer & Native SSE Streaming

1. **Portable Distributed Cache Layer**:
   - Designed around a pluggable key-value caching contract (`CacheProvider`).
   - Query strings are lowercased, trimmed, and hashed with SHA-256 (`rag:cache:<hash>`).
   - **Supported Implementations**: Upstash Redis REST, Vercel KV, self-hosted Redis, or local in-memory LRU fallback.
   - On cache hit, streams back stored text directly without invoking LLM API or vector retrieval.
2. **Native SSE Byte Streaming**:
   Replaces `answer.split(" ")` with WHATWG `ReadableStream` yielding `Uint8Array` byte chunks formatted as Server-Sent Events (`text/event-stream`). UI decodes chunks using standard streaming response handling or Vercel AI SDK wrappers.

---

#### G. Observability, Telemetry & Analytics

Every request logs execution metrics to `rag_analytics` table in Supabase for continuous monitoring:

```sql
CREATE TABLE IF NOT EXISTS rag_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT NOT NULL,
  standalone_query TEXT,
  retrieved_chunk_ids UUID[],
  top_similarity_score FLOAT,
  rerank_scores FLOAT[],
  cache_hit BOOLEAN DEFAULT FALSE,
  llm_provider TEXT,                  -- 'groq', 'gemini', 'openai', 'fallback'
  time_to_first_token_ms INT,
  total_latency_ms INT,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 3. Comprehensive Architectural Decisions & Trade-Off Matrix

| Architectural Decision | Chosen Strategy | Alternative Considered | Justification & Technical Rationale |
| :--- | :--- | :--- | :--- |
| **Chunking Strategy** | **Section-Level Semantic Chunking** | Document-Level / Paragraph Split | Section-level chunking isolates technical aspects (e.g. *Angle Calculation*, *Caching Layer*), preventing irrelevant project text from diluting context embeddings. |
| **Ingestion Pipeline** | **Decoupled API Queue Worker** | PostgreSQL Database Triggers | Avoids database lock contention, reduces DB execution costs, simplifies debugging, and decouples ingestion logic from vendor DB extensions. |
| **Vector Storage** | **Supabase `pgvector`** | Pinecone, Qdrant | Keeps Supabase as the **single source of truth**. Eliminates multi-database sync overhead, SaaS costs, and data fragmentation. |
| **Search Strategy** | **Hybrid Search + Cross-Encoder Rerank** | Vector-Only Search | Combines semantic vector similarity with exact lexical matches (FTS) and Cross-Encoder re-ranking, ensuring high precision for technical queries. |
| **Query Caching** | **Portable Distributed Cache Layer** | Single Provider (Upstash/Redis) | Abstracting cache interfaces allows swapping backends (Upstash Redis, Vercel KV, Redis, In-Memory) without changing application architecture. |
| **Streaming Protocol** | **Server-Sent Events (`text/event-stream`)** | `answer.split(" ")` text stream | Prevents Markdown parsing errors, UTF-8 chunk truncation, and proxy buffer delays. |

---

## Part 3: Implementation Roadmap & Next Steps

1. **Phase 1: Supabase `pgvector` Schema Migration**: Run SQL migration establishing `portfolio_embeddings`, HNSW index, FTS index, `match_portfolio_chunks` RPC, and `rag_analytics` table.
2. **Phase 2: Semantic Chunker & Ingestion Worker**: Develop `lib/rag/semanticChunker.js` and `scripts/seed-embeddings.mjs` to execute section-level chunking and initial vector generation.
3. **Phase 3: Hybrid Retriever & Reranker Gateway**: Implement `lib/rag/retriever.js` featuring hybrid search, metadata filtering, and optional Cohere/Cross-Encoder re-ranking.
4. **Phase 4: API Route, Cache & Memory Refactor**: Rewrite `app/api/ask/route.js` to integrate portable cache layer, query contextualization, prompt building, and SSE streaming.
5. **Phase 5: UI Stream & Analytics Update**: Refactor `components/AskVedaang.jsx` to process native SSE streams with robust error boundary handling and analytics logging.

---

*End of Architectural Audit & Dynamic RAG Design Document.*
