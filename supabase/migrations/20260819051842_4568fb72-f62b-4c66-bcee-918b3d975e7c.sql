-- No anonymous execution of any of our helpers
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;
REVOKE EXECUTE ON FUNCTION public.consume_usage(text, text, boolean) FROM anon;
REVOKE EXECUTE ON FUNCTION public.redeem_premium_key(text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.register_device(text, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.revoke_device(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_update_user(uuid, public.plan_tier, integer, integer, text, integer, boolean, boolean) FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_create_key(text, public.plan_tier, integer, integer, integer, integer, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_revoke_key(text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_update_plan(public.plan_tier, integer, integer, text, text[], text[]) FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_stats() FROM anon;

-- Internal-only helpers: not callable by app users at all
REVOKE EXECUTE ON FUNCTION public.admin_log(text, uuid, jsonb) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.protect_profile_fields() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM anon, authenticated, public;
