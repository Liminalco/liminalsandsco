CREATE TABLE public.saved_designs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text,
  product text NOT NULL DEFAULT 'skateboard',
  design jsonb NOT NULL DEFAULT '{}'::jsonb,
  price numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_designs TO authenticated;
GRANT ALL ON public.saved_designs TO service_role;

ALTER TABLE public.saved_designs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own designs" ON public.saved_designs
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX saved_designs_user_created_idx ON public.saved_designs (user_id, created_at DESC);

CREATE TRIGGER saved_designs_touch_updated_at
  BEFORE UPDATE ON public.saved_designs
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();