-- Create admin automation rules table
CREATE TABLE public.admin_automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL,
  trigger_config JSONB NOT NULL DEFAULT '{}',
  target_audience TEXT NOT NULL DEFAULT 'all',
  audience_filters JSONB DEFAULT '{}',
  message_type TEXT NOT NULL DEFAULT 'in_app',
  message_template TEXT NOT NULL,
  message_subject TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  priority INTEGER NOT NULL DEFAULT 0,
  cooldown_days INTEGER DEFAULT 7,
  max_sends_per_user INTEGER,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create admin automation logs table
CREATE TABLE public.admin_automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID REFERENCES admin_automation_rules(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  trigger_type TEXT NOT NULL,
  message_type TEXT NOT NULL,
  message_content TEXT,
  status TEXT NOT NULL DEFAULT 'sent',
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_automation_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_automation_rules (admin only)
CREATE POLICY "Admins can view automation rules"
  ON public.admin_automation_rules FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM admin_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins can create automation rules"
  ON public.admin_automation_rules FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM admin_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins can update automation rules"
  ON public.admin_automation_rules FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM admin_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins can delete automation rules"
  ON public.admin_automation_rules FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM admin_profiles WHERE user_id = auth.uid()
  ));

-- RLS Policies for admin_automation_logs (admin only)
CREATE POLICY "Admins can view automation logs"
  ON public.admin_automation_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM admin_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins can create automation logs"
  ON public.admin_automation_logs FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM admin_profiles WHERE user_id = auth.uid()
  ));

-- Create indexes for performance
CREATE INDEX idx_admin_automation_rules_enabled ON public.admin_automation_rules(is_enabled);
CREATE INDEX idx_admin_automation_rules_trigger ON public.admin_automation_rules(trigger_type);
CREATE INDEX idx_admin_automation_logs_rule ON public.admin_automation_logs(rule_id);
CREATE INDEX idx_admin_automation_logs_user ON public.admin_automation_logs(user_id);
CREATE INDEX idx_admin_automation_logs_created ON public.admin_automation_logs(created_at);

-- Trigger to update updated_at
CREATE TRIGGER update_admin_automation_rules_updated_at
  BEFORE UPDATE ON public.admin_automation_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();