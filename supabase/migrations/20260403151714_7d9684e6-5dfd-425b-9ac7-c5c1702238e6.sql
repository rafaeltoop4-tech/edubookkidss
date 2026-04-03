
-- Fix product_metrics: require authenticated for insert instead of anon with true
DROP POLICY IF EXISTS "Anon can insert metrics" ON public.product_metrics;
DROP POLICY IF EXISTS "Authenticated users can insert metrics" ON public.product_metrics;

CREATE POLICY "Authenticated users can insert metrics"
ON public.product_metrics FOR INSERT
TO authenticated
WITH CHECK (true);

-- Fix product_reviews: require authenticated for insert
DROP POLICY IF EXISTS "Anyone can insert reviews" ON public.product_reviews;

CREATE POLICY "Authenticated users can insert reviews"
ON public.product_reviews FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow admins to manage reviews
CREATE POLICY "Admins can manage reviews"
ON public.product_reviews FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Fix sales: ensure WITH CHECK is scoped
DROP POLICY IF EXISTS "Authenticated users can create sales" ON public.sales;

CREATE POLICY "Authenticated users can create sales"
ON public.sales FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);
