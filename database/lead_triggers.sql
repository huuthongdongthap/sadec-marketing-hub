-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Function to call the scoring Edge Function
CREATE OR REPLACE FUNCTION public.trigger_lead_scoring()
RETURNS TRIGGER AS $$
DECLARE
  edge_function_url text := current_setting('app.settings.edge_function_url', true) || '/score-lead';
  service_role_key text := current_setting('app.settings.service_role_key', true);
BEGIN
  -- If settings are not available (local dev), use defaults or skip
  IF edge_function_url IS NULL OR edge_function_url = '/score-lead' THEN
     edge_function_url := 'http://localhost:54321/functions/v1/score-lead'; -- Local Supabase default
  END IF;

  -- Call the Edge Function asynchronously
  PERFORM net.http_post(
    url := edge_function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || COALESCE(service_role_key, 'anon_key_placeholder')
    ),
    body := jsonb_build_object(
      'id', NEW.id,
      'name', NEW.name,
      'phone', NEW.phone,
      'email', NEW.email,
      'company_name', NEW.company,
      'source', NEW.source,
      'message', NEW.notes,
      'created_at', NEW.created_at
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger definition
DROP TRIGGER IF EXISTS on_lead_insert_score ON leads;
CREATE TRIGGER on_lead_insert_score
  AFTER INSERT ON leads
  FOR EACH ROW
  EXECUTE FUNCTION trigger_lead_scoring();

-- Add a comment explaining usage
COMMENT ON FUNCTION public.trigger_lead_scoring IS 'Triggers the lead scoring Edge Function on new lead insertion via pg_net';
