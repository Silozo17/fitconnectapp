-- Enable 2FA by default for all existing privileged users (admin, manager, staff, coach)
-- Use DISTINCT to avoid duplicate user_ids from users with multiple roles

INSERT INTO public.user_security_settings (user_id, two_factor_enabled, two_factor_method)
SELECT DISTINCT ur.user_id, true, 'email'
FROM public.user_roles ur
WHERE ur.role IN ('admin', 'manager', 'staff', 'coach')
ON CONFLICT (user_id) DO UPDATE 
SET two_factor_enabled = true,
    two_factor_method = COALESCE(public.user_security_settings.two_factor_method, 'email')
WHERE public.user_security_settings.two_factor_enabled = false;