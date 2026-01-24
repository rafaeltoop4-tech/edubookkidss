-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for product images
CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can update product images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can delete product images"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images');

-- Create storage bucket for protected PDFs (private)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-pdfs', 'product-pdfs', false)
ON CONFLICT (id) DO NOTHING;

-- Only authenticated admins can access PDFs
CREATE POLICY "Only admins can manage PDFs"
ON storage.objects FOR ALL
USING (bucket_id = 'product-pdfs' AND EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Add show_stock column to products if not exists
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS show_stock boolean DEFAULT true;

-- Create product_metrics table for tracking views and engagement
CREATE TABLE IF NOT EXISTS public.product_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('view', 'cart_add', 'cart_remove', 'purchase')),
  quantity integer DEFAULT 1,
  session_id text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on metrics
ALTER TABLE public.product_metrics ENABLE ROW LEVEL SECURITY;

-- Anyone can insert metrics (for tracking)
CREATE POLICY "Anyone can insert metrics"
ON public.product_metrics FOR INSERT
WITH CHECK (true);

-- Only admins can view metrics
CREATE POLICY "Admins can view metrics"
ON public.product_metrics FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster metric queries
CREATE INDEX IF NOT EXISTS idx_product_metrics_product_id ON public.product_metrics(product_id);
CREATE INDEX IF NOT EXISTS idx_product_metrics_event_type ON public.product_metrics(event_type);
CREATE INDEX IF NOT EXISTS idx_product_metrics_created_at ON public.product_metrics(created_at);

-- Drop existing restrictive RLS policies on products and recreate with proper permissions
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;

-- Allow public read of active products (no auth needed)
CREATE POLICY "Public can view active products"
ON public.products FOR SELECT
USING (active = true);

-- Allow admins full access
CREATE POLICY "Admins have full access to products"
ON public.products FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));