DO $$
DECLARE f record; sig text;
BEGIN
  FOR f IN
    SELECT p.oid, p.proname, pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prosecdef
  LOOP
    sig := format('public.%I(%s)', f.proname, f.args);
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated', sig);
    IF f.proname IN ('has_role','is_admin','consume_usage','redeem_premium_key','register_device',
                     'revoke_device','admin_update_user','admin_create_key','admin_revoke_key',
                     'admin_update_plan','admin_stats') THEN
      EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated', sig);
    END IF;
  END LOOP;
END $$;
