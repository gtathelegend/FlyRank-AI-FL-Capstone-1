-- Migration: CMS Automatic Vector Store Synchronization Triggers & Webhook Configuration
-- Enables automatic HTTP Webhook notifications via pg_net when CMS tables are updated.

-- 1. Enable pg_net extension for asynchronous database webhooks
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Create generic CMS table change notification function
CREATE OR REPLACE FUNCTION notify_cms_knowledge_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  payload JSONB;
BEGIN
  -- Construct webhook payload
  payload := jsonb_build_object(
    'event', TG_OP,
    'schema', TG_TABLE_SCHEMA,
    'table', TG_TABLE_NAME,
    'id', COALESCE(NEW.id, OLD.id),
    'timestamp', NOW()
  );

  -- Perform non-blocking async HTTP POST request via pg_net
  PERFORM net.http_post(
    url := 'http://localhost:3000/api/webhooks/cms-sync',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := payload
  );

  RETURN NEW;
END;
$$;

-- 3. Attach Database Triggers to CMS tables

-- Projects trigger
DROP TRIGGER IF EXISTS trg_cms_sync_projects ON projects;
CREATE TRIGGER trg_cms_sync_projects
AFTER INSERT OR UPDATE OR DELETE ON projects
FOR EACH ROW EXECUTE FUNCTION notify_cms_knowledge_change();

-- Research papers trigger
DROP TRIGGER IF EXISTS trg_cms_sync_research ON research_papers;
CREATE TRIGGER trg_cms_sync_research
AFTER INSERT OR UPDATE OR DELETE ON research_papers
FOR EACH ROW EXECUTE FUNCTION notify_cms_knowledge_change();

-- Skills trigger
DROP TRIGGER IF EXISTS trg_cms_sync_skills ON skills;
CREATE TRIGGER trg_cms_sync_skills
AFTER INSERT OR UPDATE OR DELETE ON skills
FOR EACH ROW EXECUTE FUNCTION notify_cms_knowledge_change();

-- Certifications trigger
DROP TRIGGER IF EXISTS trg_cms_sync_certifications ON certifications;
CREATE TRIGGER trg_cms_sync_certifications
AFTER INSERT OR UPDATE OR DELETE ON certifications
FOR EACH ROW EXECUTE FUNCTION notify_cms_knowledge_change();

-- Experience trigger
DROP TRIGGER IF EXISTS trg_cms_sync_experience ON experience;
CREATE TRIGGER trg_cms_sync_experience
AFTER INSERT OR UPDATE OR DELETE ON experience
FOR EACH ROW EXECUTE FUNCTION notify_cms_knowledge_change();
