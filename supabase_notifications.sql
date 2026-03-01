
-- 1. Enable the HTTP extension for calling Edge Functions
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Ensure profiles table has fcm_token column
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='fcm_token') THEN
        ALTER TABLE public.profiles ADD COLUMN fcm_token TEXT;
    END IF;
END $$;

-- 3. Create the function that calls the Edge Function
CREATE OR REPLACE FUNCTION public.handle_push_notification()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM
    net.http_post(
      url := 'https://zpnsmgwkouwwnmvyikcr.supabase.co/functions/v1/notify-students',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := jsonb_build_object(
        'record', row_to_json(NEW),
        'table', TG_TABLE_NAME,
        'type', TG_OP
      )
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create Trigger for new lessons (Correct table name: lessons_content)
DROP TRIGGER IF EXISTS on_new_lesson ON public.lessons_content;
CREATE TRIGGER on_new_lesson
AFTER INSERT ON public.lessons_content
FOR EACH ROW EXECUTE FUNCTION public.handle_push_notification();

-- 5. Create Trigger for manual notifications from Admin Dashboard
DROP TRIGGER IF EXISTS on_manual_notification ON public.notifications;
CREATE TRIGGER on_manual_notification
AFTER INSERT ON public.notifications
FOR EACH ROW EXECUTE FUNCTION public.handle_push_notification();
