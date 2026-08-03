-- Migration: Enable pgvector and create portfolio_embeddings vector store table & similarity RPC

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create portfolio_embeddings table
CREATE TABLE IF NOT EXISTS portfolio_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  section TEXT NOT NULL DEFAULT 'Overview',
  content TEXT NOT NULL,
  summary TEXT,
  tags TEXT[] DEFAULT '{}',
  url TEXT,
  embedding vector(768),
  metadata JSONB DEFAULT '{}'::jsonb,
  checksum TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_document_section UNIQUE (document_id, section)
);

-- 3. Create HNSW vector index for similarity search
CREATE INDEX IF NOT EXISTS idx_portfolio_embeddings_hnsw 
ON portfolio_embeddings 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- 4. Create Full-Text Search index
ALTER TABLE portfolio_embeddings ADD COLUMN IF NOT EXISTS fts tsvector 
GENERATED ALWAYS AS (to_tsvector('english', title || ' ' || section || ' ' || content)) STORED;

CREATE INDEX IF NOT EXISTS idx_portfolio_embeddings_fts 
ON portfolio_embeddings USING gin(fts);

-- 5. RPC function for vector similarity matching
CREATE OR REPLACE FUNCTION match_portfolio_embeddings(
  query_embedding vector,
  match_threshold float DEFAULT 0.0,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  document_id TEXT,
  type TEXT,
  title TEXT,
  section TEXT,
  content TEXT,
  summary TEXT,
  tags TEXT[],
  url TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pe.id,
    pe.document_id,
    pe.type,
    pe.title,
    pe.section,
    pe.content,
    pe.summary,
    pe.tags,
    pe.url,
    pe.metadata,
    1 - (pe.embedding <=> query_embedding) AS similarity
  FROM portfolio_embeddings pe
  WHERE 1 - (pe.embedding <=> query_embedding) >= match_threshold
  ORDER BY pe.embedding <=> query_embedding ASC
  LIMIT match_count;
END;
$$;
