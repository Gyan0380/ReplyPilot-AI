-- ===== enums =====
CREATE TYPE public.app_role AS ENUM ('admin','user');
CREATE TYPE public.plan_tier AS ENUM ('free','low','high','ultra');
CREATE TYPE public.key_status AS ENUM ('active','redeemed','expired','revoked');

-- ===== plans =====
CREATE TABLE public.plans (
  id public.plan_tier PRIMARY KEY,
  name text NOT NULL,
  daily_limit integer NOT NULL,
  languages text[] NOT NULL DEFAULT '{}',
  speed text NOT NULL DEFAULT 'slow',
  platforms text[] NOT NULL DEFAULT '{}',
  price_inr integer NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.plans TO authenticated, anon;
GRANT ALL ON public.plans TO service_role;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- ===== user roles =====
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "plans readable" ON public.plans FOR SELECT TO authenticated USING (true);
CREATE POLICY "plans admin write" ON public.plans FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ===== profiles =====
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  display_name text,
  photo_url text,
  plan public.plan_tier NOT NULL DEFAULT 'free',
  status text NOT NULL DEFAULT 'active',
  daily_limit integer NOT NULL DEFAULT 20,
  usage_count integer NOT NULL DEFAULT 0,
  usage_date date NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  expires_at timestamptz,
  device_limit integer NOT NULL DEFAULT 1,
  bot_enabled boolean NOT NULL DEFAULT true,
  business_name text,
  business_description text,
  business_products text,
  business_prices text,
  delivery_info text,
  refund_policy text,
  contact_info text,
  business_hours text,
  tone text NOT NULL DEFAULT 'friendly',
  language_mode text NOT NULL DEFAULT 'auto',
  instructions text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_active timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles select own" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_admin());
CREATE POLICY "profiles insert own" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());
CREATE POLICY "profiles update own" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.is_admin()) WITH CHECK (id = auth.uid() OR public.is_admin());

-- block privilege escalation from the browser
CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL OR public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;
  NEW.plan := OLD.plan;
  NEW.status := OLD.status;
  NEW.daily_limit := OLD.daily_limit;
  NEW.usage_count := OLD.usage_count;
  NEW.usage_date := OLD.usage_date;
  NEW.expires_at := OLD.expires_at;
  NEW.device_limit := OLD.device_limit;
  NEW.created_at := OLD.created_at;
  NEW.id := OLD.id;
  RETURN NEW;
END; $$;
CREATE TRIGGER protect_profiles BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_fields();

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, plan, status, daily_limit, device_limit)
  VALUES (NEW.id, NEW.email,
          COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(COALESCE(NEW.email,'user'), '@', 1)),
          'free', 'active', 20, 1)
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===== chats =====
CREATE TABLE public.chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id uuid NOT NULL DEFAULT gen_random_uuid(),
  role text NOT NULL CHECK (role IN ('user','assistant')),
  text text NOT NULL,
  language text,
  platform text NOT NULL DEFAULT 'chat',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX chats_user_created ON public.chats (user_id, created_at DESC);
GRANT SELECT, INSERT, DELETE ON public.chats TO authenticated;
GRANT ALL ON public.chats TO service_role;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "chats own" ON public.chats FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "chats insert own" ON public.chats FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "chats delete own" ON public.chats FOR DELETE TO authenticated USING (user_id = auth.uid());
ALTER PUBLICATION supabase_realtime ADD TABLE public.chats;

-- ===== devices =====
CREATE TABLE public.devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id text NOT NULL,
  name text NOT NULL DEFAULT 'Unknown device',
  status text NOT NULL DEFAULT 'active',
  last_active timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, device_id)
);
GRANT SELECT ON public.devices TO authenticated;
GRANT ALL ON public.devices TO service_role;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "devices own read" ON public.devices FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

-- ===== platform connections =====
CREATE TABLE public.platform_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform text NOT NULL CHECK (platform IN ('whatsapp','facebook','instagram')),
  status text NOT NULL DEFAULT 'not_connected',
  external_id text,
  config jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, platform)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.platform_connections TO authenticated;
GRANT ALL ON public.platform_connections TO service_role;
ALTER TABLE public.platform_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "platforms own" ON public.platform_connections FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.is_admin()) WITH CHECK (user_id = auth.uid());

-- ===== premium keys (hash only) =====
CREATE TABLE public.premium_keys (
  key_hash text PRIMARY KEY,
  label text,
  plan public.plan_tier NOT NULL,
  daily_limit integer NOT NULL,
  device_limit integer NOT NULL DEFAULT 1,
  duration_days integer NOT NULL DEFAULT 30,
  expires_at timestamptz,
  status public.key_status NOT NULL DEFAULT 'active',
  redeemed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  redeemed_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.premium_keys TO authenticated;
GRANT ALL ON public.premium_keys TO service_role;
ALTER TABLE public.premium_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "keys admin only" ON public.premium_keys FOR SELECT TO authenticated USING (public.is_admin());

-- ===== payments =====
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan public.plan_tier NOT NULL,
  amount_inr integer NOT NULL DEFAULT 0,
  provider text NOT NULL DEFAULT 'none',
  provider_payment_id text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz
);
GRANT SELECT ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payments own read" ON public.payments FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

-- ===== usage events =====
CREATE TABLE public.usage_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform text NOT NULL DEFAULT 'chat',
  language text,
  cached boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX usage_events_user_created ON public.usage_events (user_id, created_at DESC);
GRANT SELECT ON public.usage_events TO authenticated;
GRANT ALL ON public.usage_events TO service_role;
ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "usage own read" ON public.usage_events FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

-- ===== admin logs =====
CREATE TABLE public.admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_uid uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  target_uid uuid,
  details jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.admin_logs TO authenticated;
GRANT ALL ON public.admin_logs TO service_role;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin logs admin only" ON public.admin_logs FOR SELECT TO authenticated USING (public.is_admin());

-- ===== seed plans =====
INSERT INTO public.plans (id, name, daily_limit, languages, speed, platforms, price_inr, sort_order) VALUES
  ('free','FREE',20,ARRAY['English'],'Slow',ARRAY['whatsapp'],0,1),
  ('low','LOW',150,ARRAY['English','Hinglish'],'Medium',ARRAY['whatsapp','facebook'],199,2),
  ('high','HIGH',400,ARRAY['Hindi','Hinglish','English'],'Fast',ARRAY['whatsapp','facebook','instagram'],499,3),
  ('ultra','ULTRA',2000,ARRAY['Indian languages','English'],'Fast',ARRAY['whatsapp','facebook','instagram'],999,4);

-- ===== quota consumption (server-side truth) =====
CREATE OR REPLACE FUNCTION public.consume_usage(_platform text DEFAULT 'chat', _language text DEFAULT NULL, _cached boolean DEFAULT false)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE p public.profiles; today date := (now() AT TIME ZONE 'utc')::date; recent int;
BEGIN
  IF auth.uid() IS NULL THEN RETURN jsonb_build_object('allowed',false,'reason','unauthorized'); END IF;
  SELECT * INTO p FROM public.profiles WHERE id = auth.uid() FOR UPDATE;
  IF p IS NULL THEN RETURN jsonb_build_object('allowed',false,'reason','no_profile'); END IF;
  IF p.status <> 'active' THEN RETURN jsonb_build_object('allowed',false,'reason','disabled'); END IF;
  IF p.expires_at IS NOT NULL AND p.expires_at < now() THEN
    UPDATE public.profiles SET plan='free', daily_limit=20, device_limit=1, expires_at=NULL WHERE id=p.id;
    RETURN jsonb_build_object('allowed',false,'reason','expired');
  END IF;
  SELECT count(*) INTO recent FROM public.usage_events
    WHERE user_id = p.id AND created_at > now() - interval '20 seconds';
  IF recent >= 8 THEN RETURN jsonb_build_object('allowed',false,'reason','rate_limited'); END IF;
  IF p.usage_date <> today THEN
    UPDATE public.profiles SET usage_date = today, usage_count = 0 WHERE id = p.id;
    p.usage_count := 0;
  END IF;
  IF p.usage_count >= p.daily_limit THEN
    RETURN jsonb_build_object('allowed',false,'reason','limit_reached','usage_count',p.usage_count,'daily_limit',p.daily_limit);
  END IF;
  UPDATE public.profiles SET usage_count = usage_count + 1, last_active = now(), usage_date = today
    WHERE id = p.id RETURNING usage_count INTO recent;
  INSERT INTO public.usage_events (user_id, platform, language, cached) VALUES (p.id, _platform, _language, _cached);
  RETURN jsonb_build_object('allowed',true,'usage_count',recent,'daily_limit',p.daily_limit,'plan',p.plan);
END; $$;

-- ===== redeem premium key =====
CREATE OR REPLACE FUNCTION public.redeem_premium_key(_key_hash text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE k public.premium_keys; new_expiry timestamptz;
BEGIN
  IF auth.uid() IS NULL THEN RETURN jsonb_build_object('ok',false,'reason','unauthorized'); END IF;
  SELECT * INTO k FROM public.premium_keys WHERE key_hash = _key_hash FOR UPDATE;
  IF k IS NULL THEN RETURN jsonb_build_object('ok',false,'reason','invalid'); END IF;
  IF k.status = 'revoked' THEN RETURN jsonb_build_object('ok',false,'reason','revoked'); END IF;
  IF k.status = 'redeemed' THEN RETURN jsonb_build_object('ok',false,'reason','already_redeemed'); END IF;
  IF k.expires_at IS NOT NULL AND k.expires_at < now() THEN
    UPDATE public.premium_keys SET status='expired' WHERE key_hash=k.key_hash;
    RETURN jsonb_build_object('ok',false,'reason','expired');
  END IF;
  new_expiry := now() + (k.duration_days || ' days')::interval;
  UPDATE public.profiles SET plan = k.plan, daily_limit = k.daily_limit, device_limit = k.device_limit,
    expires_at = new_expiry, status = 'active' WHERE id = auth.uid();
  UPDATE public.premium_keys SET status='redeemed', redeemed_by = auth.uid(), redeemed_at = now()
    WHERE key_hash = k.key_hash;
  RETURN jsonb_build_object('ok',true,'plan',k.plan,'daily_limit',k.daily_limit,'expires_at',new_expiry);
END; $$;

-- ===== devices =====
CREATE OR REPLACE FUNCTION public.register_device(_device_id text, _name text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE lim int; cnt int;
BEGIN
  IF auth.uid() IS NULL THEN RETURN jsonb_build_object('ok',false,'reason','unauthorized'); END IF;
  SELECT device_limit INTO lim FROM public.profiles WHERE id = auth.uid();
  IF EXISTS (SELECT 1 FROM public.devices WHERE user_id=auth.uid() AND device_id=_device_id) THEN
    UPDATE public.devices SET last_active = now(), status='active', name=_name
      WHERE user_id=auth.uid() AND device_id=_device_id;
    RETURN jsonb_build_object('ok',true,'reason','existing');
  END IF;
  SELECT count(*) INTO cnt FROM public.devices WHERE user_id=auth.uid() AND status='active';
  IF cnt >= COALESCE(lim,1) THEN RETURN jsonb_build_object('ok',false,'reason','device_limit','limit',lim); END IF;
  INSERT INTO public.devices (user_id, device_id, name) VALUES (auth.uid(), _device_id, _name);
  RETURN jsonb_build_object('ok',true,'reason','registered');
END; $$;

CREATE OR REPLACE FUNCTION public.revoke_device(_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN jsonb_build_object('ok',false); END IF;
  DELETE FROM public.devices WHERE id = _id AND (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
  RETURN jsonb_build_object('ok',true);
END; $$;

-- ===== admin actions =====
CREATE OR REPLACE FUNCTION public.admin_log(_action text, _target uuid, _details jsonb)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.admin_logs (admin_uid, action, target_uid, details)
  VALUES (auth.uid(), _action, _target, COALESCE(_details,'{}'::jsonb))
$$;

CREATE OR REPLACE FUNCTION public.admin_update_user(
  _target uuid, _plan public.plan_tier DEFAULT NULL, _daily_limit integer DEFAULT NULL,
  _device_limit integer DEFAULT NULL, _status text DEFAULT NULL,
  _extend_days integer DEFAULT NULL, _force_expire boolean DEFAULT false,
  _reset_usage boolean DEFAULT false)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE pl public.plans;
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF _plan IS NOT NULL THEN
    SELECT * INTO pl FROM public.plans WHERE id = _plan;
    UPDATE public.profiles SET plan = _plan, daily_limit = COALESCE(_daily_limit, pl.daily_limit) WHERE id = _target;
  ELSIF _daily_limit IS NOT NULL THEN
    UPDATE public.profiles SET daily_limit = _daily_limit WHERE id = _target;
  END IF;
  IF _device_limit IS NOT NULL THEN UPDATE public.profiles SET device_limit = _device_limit WHERE id = _target; END IF;
  IF _status IS NOT NULL THEN UPDATE public.profiles SET status = _status WHERE id = _target; END IF;
  IF _extend_days IS NOT NULL THEN
    UPDATE public.profiles SET expires_at = COALESCE(GREATEST(expires_at, now()), now()) + (_extend_days || ' days')::interval
      WHERE id = _target;
  END IF;
  IF _force_expire THEN
    UPDATE public.profiles SET plan='free', daily_limit=20, device_limit=1, expires_at=NULL WHERE id = _target;
  END IF;
  IF _reset_usage THEN UPDATE public.profiles SET usage_count = 0 WHERE id = _target; END IF;
  PERFORM public.admin_log('update_user', _target, jsonb_build_object(
    'plan',_plan,'daily_limit',_daily_limit,'device_limit',_device_limit,'status',_status,
    'extend_days',_extend_days,'force_expire',_force_expire,'reset_usage',_reset_usage));
  RETURN jsonb_build_object('ok',true);
END; $$;

CREATE OR REPLACE FUNCTION public.admin_create_key(
  _key_hash text, _plan public.plan_tier, _daily_limit integer,
  _device_limit integer, _duration_days integer, _valid_days integer, _label text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  INSERT INTO public.premium_keys (key_hash, label, plan, daily_limit, device_limit, duration_days, expires_at, created_by)
  VALUES (_key_hash, _label, _plan, _daily_limit, _device_limit, _duration_days,
          CASE WHEN _valid_days IS NULL THEN NULL ELSE now() + (_valid_days || ' days')::interval END,
          auth.uid());
  PERFORM public.admin_log('create_key', NULL, jsonb_build_object('plan',_plan,'daily_limit',_daily_limit));
  RETURN jsonb_build_object('ok',true);
END; $$;

CREATE OR REPLACE FUNCTION public.admin_revoke_key(_key_hash text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  UPDATE public.premium_keys SET status='revoked' WHERE key_hash = _key_hash;
  PERFORM public.admin_log('revoke_key', NULL, jsonb_build_object('key_hash',_key_hash));
  RETURN jsonb_build_object('ok',true);
END; $$;

CREATE OR REPLACE FUNCTION public.admin_update_plan(
  _plan public.plan_tier, _daily_limit integer, _price_inr integer, _speed text, _languages text[], _platforms text[])
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  UPDATE public.plans SET daily_limit = COALESCE(_daily_limit, daily_limit),
    price_inr = COALESCE(_price_inr, price_inr), speed = COALESCE(_speed, speed),
    languages = COALESCE(_languages, languages), platforms = COALESCE(_platforms, platforms),
    updated_at = now() WHERE id = _plan;
  PERFORM public.admin_log('update_plan', NULL, jsonb_build_object('plan',_plan));
  RETURN jsonb_build_object('ok',true);
END; $$;

CREATE OR REPLACE FUNCTION public.admin_stats()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  SELECT jsonb_build_object(
    'total_users', (SELECT count(*) FROM public.profiles),
    'active_users', (SELECT count(*) FROM public.profiles WHERE status='active'),
    'free_users', (SELECT count(*) FROM public.profiles WHERE plan='free'),
    'premium_users', (SELECT count(*) FROM public.profiles WHERE plan<>'free'),
    'replies_today', (SELECT count(*) FROM public.usage_events WHERE created_at::date = (now() AT TIME ZONE 'utc')::date),
    'active_keys', (SELECT count(*) FROM public.premium_keys WHERE status='active'),
    'expired_keys', (SELECT count(*) FROM public.premium_keys WHERE status='expired'),
    'redeemed_keys', (SELECT count(*) FROM public.premium_keys WHERE status='redeemed'),
    'connected_platforms', (SELECT count(*) FROM public.platform_connections WHERE status='connected')
  ) INTO r;
  RETURN r;
END; $$;
